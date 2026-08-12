import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendContactMessage } from "@/actions/contact";
import { FORCED_FAILURE_ADDRESS } from "@/constants/contact";
import type { ContactMessage } from "@/lib/contact-message-schema";
import { buildContactEmail } from "@/lib/contact/email";
import { MINIMUM_TIME_TO_SUBMIT_MS } from "@/lib/contact/spam-guards";

/**
 * Resend stands in for the network here. The action owns the client, so the
 * SDK is the seam: mocking it exercises the real delivery code — including what
 * it puts in `from`, `to`, and `replyTo` — without a key, quota, or a request.
 */
const send = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const FROM = "portfolio@owner.example.com";
const TO = "owner@owner.example.com";

/**
 * The action reads the clock itself, so a render time is chosen relative to
 * *now* rather than pinned to a fixed instant: comfortably past the too-fast
 * threshold for the happy path, and inside it for the guard tests.
 */
const wellPast = () =>
  new Date(Date.now() - MINIMUM_TIME_TO_SUBMIT_MS * 10).toISOString();

const message = (overrides: Partial<ContactMessage> = {}): ContactMessage => ({
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I saw your portfolio and would love to talk.",
  renderedAt: wellPast(),
  website: "",
  ...overrides,
});

beforeEach(() => {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_FROM_EMAIL = FROM;
  process.env.CONTACT_TO_EMAIL = TO;
  send.mockReset();
  send.mockResolvedValue({ data: { id: "sent" }, error: null });
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.CONTACT_TO_EMAIL;
});

describe("sendContactMessage", () => {
  describe("a valid Contact Message", () => {
    it("returns a typed success", async () => {
      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "success",
      });
    });

    it("sends exactly once", async () => {
      await sendContactMessage(message());

      expect(send).toHaveBeenCalledTimes(1);
    });

    it("sends the content the builder produced", async () => {
      await sendContactMessage(message());

      const expected = buildContactEmail({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello, I saw your portfolio and would love to talk.",
        // The action stamps its own submission time, which the subject and
        // body don't depend on, so any instant produces the same content.
        submittedAt: new Date(),
      });

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expected.subject,
          html: expected.html,
        }),
      );
    });

    it("sends from the owner's verified address, never the Visitor's", async () => {
      await sendContactMessage(message());

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ from: FROM, to: TO }),
      );
    });

    it("sets the Visitor's address as replyTo, so replying answers them", async () => {
      await sendContactMessage(message());

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: "ada@example.com" }),
      );
    });

    it("sends the normalised address the schema produced", async () => {
      await sendContactMessage(message({ email: "  ADA@Example.COM  " }));

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: "ada@example.com" }),
      );
    });
  });

  describe("invalid input", () => {
    it.each([
      ["name", "a"],
      ["email", "not-an-email"],
      ["message", "too short"],
      ["name", "   "],
      ["message", "         "],
    ])("returns a field error for an invalid %s", async (field, value) => {
      const result = await sendContactMessage(message({ [field]: value }));

      expect(result).toMatchObject({ status: "invalid" });
      if (result.status !== "invalid") throw new Error("expected invalid");
      expect(Object.keys(result.fieldErrors)).toContain(field);
    });

    it("sends nothing", async () => {
      await sendContactMessage(message({ email: "nope" }));

      expect(send).not.toHaveBeenCalled();
    });

    it("reports every invalid field at once", async () => {
      const result = await sendContactMessage(
        message({ name: "a", email: "nope", message: "short" }),
      );

      if (result.status !== "invalid") throw new Error("expected invalid");
      expect(Object.keys(result.fieldErrors).sort()).toEqual([
        "email",
        "message",
        "name",
      ]);
    });

    it("rejects a message beyond the length cap, so quota can't be burned", async () => {
      const result = await sendContactMessage(
        message({ message: "x".repeat(2001) }),
      );

      expect(result).toMatchObject({ status: "invalid" });
      expect(send).not.toHaveBeenCalled();
    });
  });

  describe("spam guards", () => {
    it("returns a success-shaped result when the honeypot is filled", async () => {
      // Indistinguishable from a real success, so a bot learns nothing.
      await expect(
        sendContactMessage(message({ website: "https://spam.example.com" })),
      ).resolves.toEqual({ status: "success" });
    });

    it("sends nothing when the honeypot is filled", async () => {
      await sendContactMessage(message({ website: "https://spam.example.com" }));

      expect(send).not.toHaveBeenCalled();
    });

    it("lets an untouched honeypot through, so Visitors are never blocked", async () => {
      await sendContactMessage(message({ website: "" }));

      expect(send).toHaveBeenCalledTimes(1);
    });

    it("returns a success-shaped result when the submission is too fast", async () => {
      await expect(
        sendContactMessage(message({ renderedAt: new Date().toISOString() })),
      ).resolves.toEqual({ status: "success" });
    });

    it("sends nothing when the submission is too fast", async () => {
      await sendContactMessage(message({ renderedAt: new Date().toISOString() }));

      expect(send).not.toHaveBeenCalled();
    });

    it("treats an unparseable render time as too fast", async () => {
      const result = await sendContactMessage(
        message({ renderedAt: "not-a-timestamp" }),
      );

      expect(result).toEqual({ status: "success" });
      expect(send).not.toHaveBeenCalled();
    });

    it("runs the guards before the transport is ever reached", async () => {
      // A tripped guard must cost nothing, even when delivery is broken.
      send.mockRejectedValue(new Error("transport down"));

      await expect(
        sendContactMessage(message({ website: "bot" })),
      ).resolves.toEqual({ status: "success" });
    });
  });

  describe("confirmed delivery", () => {
    it("returns a typed error when the SDK reports one", async () => {
      // The SDK resolves with an `error` rather than throwing, so a success
      // returned here would tell the Visitor their message was delivered when
      // it was refused — and nothing kept a copy of it.
      send.mockResolvedValue({ data: null, error: { message: "rejected" } });

      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "error",
      });
    });

    it("returns a typed error when the send throws", async () => {
      send.mockRejectedValue(new Error("network down"));

      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "error",
      });
    });

    it("does not throw when the send fails", async () => {
      // The Visitor gets an inline error and keeps their text; an unhandled
      // rejection would give them a crashed page instead.
      send.mockRejectedValue(new Error("network down"));

      await expect(sendContactMessage(message())).resolves.toBeDefined();
    });

    it("returns an error when the environment is misconfigured", async () => {
      delete process.env.CONTACT_FROM_EMAIL;

      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "error",
      });
      expect(send).not.toHaveBeenCalled();
    });
  });

  describe("the forced-failure address", () => {
    it("returns an error without calling Resend", async () => {
      // Reserved by RFC 6761, so a Visitor cannot reach this branch by
      // accident, and an end-to-end failure test costs no quota.
      await expect(
        sendContactMessage(message({ email: FORCED_FAILURE_ADDRESS })),
      ).resolves.toEqual({ status: "error" });

      expect(send).not.toHaveBeenCalled();
    });
  });
});
