import { describe, expect, it } from "vitest";

import { contactMessageSchema } from "@/lib/contact-message-schema";
import { errorMessageKey } from "@/lib/contact/error-message-key";

const validContactMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I saw your portfolio and would like to talk about a project.",
};

/**
 * Drives the mapper with the schema's real issues rather than hand-written
 * ones, so a change to the schema surfaces here instead of silently leaving the
 * form showing a fallback message.
 */
function keyFor(field: "name" | "email" | "message", value: unknown): string {
  const result = contactMessageSchema.safeParse({
    ...validContactMessage,
    [field]: value,
  });

  if (result.success) {
    throw new Error(`Expected ${field} of ${JSON.stringify(value)} to be rejected`);
  }

  const issue = result.error.issues.find(({ path }) => path[0] === field);

  if (!issue) {
    throw new Error(`Expected an issue on ${field}`);
  }

  return errorMessageKey(issue);
}

describe("errorMessageKey", () => {
  describe("name", () => {
    it("maps a name that is too short", () => {
      expect(keyFor("name", "A")).toBe("nameTooShort");
    });

    it("maps a whitespace-only name to the same key as an empty one", () => {
      expect(keyFor("name", "   ")).toBe(keyFor("name", ""));
    });

    it("maps a name that is too long", () => {
      expect(keyFor("name", "A".repeat(81))).toBe("nameTooLong");
    });

    it("maps a missing name", () => {
      expect(keyFor("name", undefined)).toBe("nameTooShort");
    });
  });

  describe("email", () => {
    it("maps a malformed address", () => {
      expect(keyFor("email", "not-an-email")).toBe("emailInvalid");
    });

    it("maps an empty address", () => {
      expect(keyFor("email", "")).toBe("emailInvalid");
    });

    it("maps an address that is too long", () => {
      expect(keyFor("email", `${"a".repeat(243)}@example.com`)).toBe("emailTooLong");
    });

    it("maps a missing address", () => {
      expect(keyFor("email", undefined)).toBe("emailInvalid");
    });
  });

  describe("message", () => {
    it("maps a message that is too short", () => {
      expect(keyFor("message", "a".repeat(9))).toBe("messageTooShort");
    });

    it("maps a message that is too long", () => {
      expect(keyFor("message", "a".repeat(2001))).toBe("messageTooLong");
    });

    it("maps a missing message", () => {
      expect(keyFor("message", undefined)).toBe("messageTooShort");
    });
  });

  it("falls back to a generic key for an issue on an unrecognised path", () => {
    expect(errorMessageKey({ code: "custom", path: ["website"], message: "" })).toBe(
      "invalid",
    );
  });
});
