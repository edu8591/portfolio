import { describe, expect, it } from "vitest";

import { buildContactEmail } from "@/lib/contact/email";
import { createFakeTransport } from "@/lib/contact/fake-transport";
import { MINIMUM_TIME_TO_SUBMIT_MS } from "@/lib/contact/spam-guards";
import { submitContactMessage } from "@/lib/contact/submit-contact-message";

const RENDERED_AT = new Date("2026-07-30T12:00:00.000Z");
const SUBMITTED_AT = new Date(RENDERED_AT.getTime() + MINIMUM_TIME_TO_SUBMIT_MS);

const FROM = "portfolio@owner.example.com";
const TO = "owner@owner.example.com";

const formData = (overrides: Record<string, string> = {}) => {
  const fields: Record<string, string> = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello, I saw your portfolio and would love to talk.",
    renderedAt: RENDERED_AT.toISOString(),
    ...overrides,
  };

  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
};

const submit = (
  data: FormData,
  {
    failing = false,
    now = SUBMITTED_AT,
  }: { failing?: boolean; now?: Date } = {},
) => {
  const transport = createFakeTransport({ failing });

  return {
    transport,
    result: submitContactMessage(data, {
      transport,
      now: () => now,
      from: FROM,
      to: TO,
    }),
  };
};

describe("submitContactMessage", () => {
  describe("a valid Contact Message", () => {
    it("returns a typed success", async () => {
      const { result } = submit(formData());

      await expect(result).resolves.toEqual({ status: "success" });
    });

    it("records exactly one send", async () => {
      const { transport, result } = submit(formData());
      await result;

      expect(transport.sent).toHaveLength(1);
    });

    it("sends the content the builder produced", async () => {
      const { transport, result } = submit(formData());
      await result;

      const expected = buildContactEmail({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello, I saw your portfolio and would love to talk.",
        submittedAt: SUBMITTED_AT,
      });

      expect(transport.sent[0]).toMatchObject({
        subject: expected.subject,
        html: expected.html,
        text: expected.text,
      });
    });

    it("sends from the owner's verified address, never the Visitor's", async () => {
      const { transport, result } = submit(formData());
      await result;

      expect(transport.sent[0].from).toBe(FROM);
      expect(transport.sent[0].to).toBe(TO);
    });

    it("sets the Visitor's address as replyTo, so replying answers them", async () => {
      const { transport, result } = submit(formData());
      await result;

      expect(transport.sent[0].replyTo).toBe("ada@example.com");
    });

    it("sends the normalised address the schema produced", async () => {
      const { transport, result } = submit(
        formData({ email: "  ADA@Example.COM  " }),
      );
      await result;

      expect(transport.sent[0].replyTo).toBe("ada@example.com");
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
      const { result } = submit(formData({ [field]: value }));

      await expect(result).resolves.toMatchObject({ status: "invalid" });
      const resolved = await result;
      if (resolved.status !== "invalid") throw new Error("expected invalid");
      expect(Object.keys(resolved.fieldErrors)).toContain(field);
    });

    it("sends nothing", async () => {
      const { transport, result } = submit(formData({ email: "nope" }));
      await result;

      expect(transport.sent).toEqual([]);
    });

    it("reports every invalid field at once", async () => {
      const resolved = await submit(
        formData({ name: "a", email: "nope", message: "short" }),
      ).result;

      if (resolved.status !== "invalid") throw new Error("expected invalid");
      expect(Object.keys(resolved.fieldErrors).sort()).toEqual([
        "email",
        "message",
        "name",
      ]);
    });

    it("rejects a missing field rather than coercing it", async () => {
      const data = formData();
      data.delete("message");

      await expect(submit(data).result).resolves.toMatchObject({
        status: "invalid",
      });
    });

    it("rejects a message beyond the length cap, so quota can't be burned", async () => {
      const { transport, result } = submit(
        formData({ message: "x".repeat(2001) }),
      );

      await expect(result).resolves.toMatchObject({ status: "invalid" });
      expect(transport.sent).toEqual([]);
    });
  });

  describe("spam guards", () => {
    it("returns a success-shaped result when the honeypot is filled", async () => {
      const { result } = submit(formData({ website: "https://spam.example.com" }));

      // Indistinguishable from a real success, so a bot learns nothing.
      await expect(result).resolves.toEqual({ status: "success" });
    });

    it("sends nothing when the honeypot is filled", async () => {
      const { transport, result } = submit(
        formData({ website: "https://spam.example.com" }),
      );
      await result;

      expect(transport.sent).toEqual([]);
    });

    it("returns a success-shaped result when the submission is too fast", async () => {
      const { result } = submit(formData(), {
        now: new Date(RENDERED_AT.getTime() + MINIMUM_TIME_TO_SUBMIT_MS - 1),
      });

      await expect(result).resolves.toEqual({ status: "success" });
    });

    it("sends nothing when the submission is too fast", async () => {
      const { transport, result } = submit(formData(), {
        now: new Date(RENDERED_AT.getTime() + MINIMUM_TIME_TO_SUBMIT_MS - 1),
      });
      await result;

      expect(transport.sent).toEqual([]);
    });

    it("treats a missing render time as too fast", async () => {
      const data = formData();
      data.delete("renderedAt");

      const { transport, result } = submit(data);

      await expect(result).resolves.toEqual({ status: "success" });
      expect(transport.sent).toEqual([]);
    });

    it("treats an unparseable render time as too fast", async () => {
      const { transport, result } = submit(
        formData({ renderedAt: "not-a-timestamp" }),
      );

      await expect(result).resolves.toEqual({ status: "success" });
      expect(transport.sent).toEqual([]);
    });

    it("runs the guards before the transport is ever reached", async () => {
      // A tripped guard must cost nothing, even when the transport is broken.
      const { result } = submit(formData({ website: "bot" }), { failing: true });

      await expect(result).resolves.toEqual({ status: "success" });
    });
  });

  describe("confirmed delivery", () => {
    it("returns a typed error when the transport fails", async () => {
      const { result } = submit(formData(), { failing: true });

      await expect(result).resolves.toEqual({ status: "error" });
    });

    it("does not throw when the transport fails", async () => {
      // The Visitor gets an inline error and keeps their text; an unhandled
      // rejection would give them a crashed page instead.
      const { result } = submit(formData(), { failing: true });

      await expect(result).resolves.toBeDefined();
    });

    it("returns success only after the transport has resolved", async () => {
      let resolveSend: () => void = () => {};
      const settled = new Promise<void>((resolve) => {
        resolveSend = resolve;
      });

      let done = false;
      const pending = submitContactMessage(formData(), {
        transport: { send: () => settled },
        now: () => SUBMITTED_AT,
        from: FROM,
        to: TO,
      }).then((result) => {
        done = true;
        return result;
      });

      await Promise.resolve();
      expect(done).toBe(false);

      resolveSend();

      await expect(pending).resolves.toEqual({ status: "success" });
    });
  });
});
