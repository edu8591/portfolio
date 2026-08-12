import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { sendContactMessage } from "@/actions/contact";
import type { ContactMessage } from "@/lib/contact-message-schema";
import { buildContactEmail } from "@/lib/contact/email";
import { fakeTransport } from "@/lib/contact/select-transport";
import { MINIMUM_TIME_TO_SUBMIT_MS } from "@/lib/contact/spam-guards";

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
  // The recorder stands in for Resend, so the whole action runs without
  // network access or the real transport's configuration.
  process.env.CONTACT_USE_FAKE_TRANSPORT = "true";
});

afterEach(() => {
  delete process.env.CONTACT_USE_FAKE_TRANSPORT;
  delete process.env.CONTACT_FAKE_TRANSPORT_FAILS;
  fakeTransport.reset();
});

describe("sendContactMessage", () => {
  describe("a valid Contact Message", () => {
    it("returns a typed success", async () => {
      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "success",
      });
    });

    it("records exactly one send", async () => {
      await sendContactMessage(message());

      expect(fakeTransport.sent).toHaveLength(1);
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

      expect(fakeTransport.sent[0]).toMatchObject({
        subject: expected.subject,
        html: expected.html,
      });
    });

    it("sets the Visitor's address as replyTo, so replying answers them", async () => {
      await sendContactMessage(message());

      expect(fakeTransport.sent[0].replyTo).toBe("ada@example.com");
    });

    it("sends the normalised address the schema produced", async () => {
      await sendContactMessage(message({ email: "  ADA@Example.COM  " }));

      expect(fakeTransport.sent[0].replyTo).toBe("ada@example.com");
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

      expect(fakeTransport.sent).toEqual([]);
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
      expect(fakeTransport.sent).toEqual([]);
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

      expect(fakeTransport.sent).toEqual([]);
    });

    it("lets an untouched honeypot through, so Visitors are never blocked", async () => {
      await sendContactMessage(message({ website: "" }));

      expect(fakeTransport.sent).toHaveLength(1);
    });

    it("returns a success-shaped result when the submission is too fast", async () => {
      await expect(
        sendContactMessage(message({ renderedAt: new Date().toISOString() })),
      ).resolves.toEqual({ status: "success" });
    });

    it("sends nothing when the submission is too fast", async () => {
      await sendContactMessage(message({ renderedAt: new Date().toISOString() }));

      expect(fakeTransport.sent).toEqual([]);
    });

    it("treats an unparseable render time as too fast", async () => {
      const result = await sendContactMessage(
        message({ renderedAt: "not-a-timestamp" }),
      );

      expect(result).toEqual({ status: "success" });
      expect(fakeTransport.sent).toEqual([]);
    });

    it("runs the guards before the transport is ever reached", async () => {
      // A tripped guard must cost nothing, even when the transport is broken.
      process.env.CONTACT_FAKE_TRANSPORT_FAILS = "true";

      await expect(
        sendContactMessage(message({ website: "bot" })),
      ).resolves.toEqual({ status: "success" });
    });
  });

  describe("confirmed delivery", () => {
    beforeEach(() => {
      process.env.CONTACT_FAKE_TRANSPORT_FAILS = "true";
    });

    it("returns a typed error when the transport fails", async () => {
      await expect(sendContactMessage(message())).resolves.toEqual({
        status: "error",
      });
    });

    it("does not throw when the transport fails", async () => {
      // The Visitor gets an inline error and keeps their text; an unhandled
      // rejection would give them a crashed page instead.
      await expect(sendContactMessage(message())).resolves.toBeDefined();
    });

    it("records nothing when the transport fails", async () => {
      await sendContactMessage(message());

      expect(fakeTransport.sent).toEqual([]);
    });
  });
});
