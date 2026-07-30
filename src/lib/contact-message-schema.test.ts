import { describe, expect, it } from "vitest";

import { contactMessageSchema } from "@/lib/contact-message-schema";

const validContactMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I saw your portfolio and would like to talk about a project.",
};

describe("contactMessageSchema", () => {
  it("accepts a well-formed Contact Message", () => {
    const result = contactMessageSchema.safeParse(validContactMessage);

    expect(result.success).toBe(true);
  });

  describe("name", () => {
    it("rejects a name of 1 character", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "A",
      });

      expect(result.success).toBe(false);
    });

    it("accepts a name of 2 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "Ad",
      });

      expect(result.success).toBe(true);
    });

    it("accepts a name of 80 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "A".repeat(80),
      });

      expect(result.success).toBe(true);
    });

    it("rejects a name of 81 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "A".repeat(81),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("message", () => {
    it("rejects a message of 9 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        message: "a".repeat(9),
      });

      expect(result.success).toBe(false);
    });

    it("accepts a message of 10 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        message: "a".repeat(10),
      });

      expect(result.success).toBe(true);
    });

    it("accepts a message of 2000 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        message: "a".repeat(2000),
      });

      expect(result.success).toBe(true);
    });

    it("rejects a message of 2001 characters", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        message: "a".repeat(2001),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("email", () => {
    it.each([
      "not-an-email",
      "ada@",
      "@example.com",
      "ada@example",
      "ada example@test.com",
      "ada@@example.com",
      "",
    ])("rejects the malformed address %j", (email) => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        email,
      });

      expect(result.success).toBe(false);
    });

    it("accepts a valid mixed-case address and lowercases it", () => {
      const result = contactMessageSchema.parse({
        ...validContactMessage,
        email: "Ada.Lovelace@Example.COM",
      });

      expect(result.email).toBe("ada.lovelace@example.com");
    });

    it("accepts an address of exactly 254 characters", () => {
      const local = "a".repeat(242);
      const email = `${local}@example.com`;

      expect(email).toHaveLength(254);
      expect(contactMessageSchema.safeParse({ ...validContactMessage, email }).success).toBe(true);
    });

    it("rejects an address of 255 characters", () => {
      const local = "a".repeat(243);
      const email = `${local}@example.com`;

      expect(email).toHaveLength(255);
      expect(contactMessageSchema.safeParse({ ...validContactMessage, email }).success).toBe(false);
    });
  });

  describe("trimming before length checks", () => {
    it("rejects a whitespace-only name that is long enough untrimmed", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "      ",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a whitespace-only message that is long enough untrimmed", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        message: " ".repeat(50),
      });

      expect(result.success).toBe(false);
    });

    it("rejects a padded name that is too short once trimmed", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: "   A   ",
      });

      expect(result.success).toBe(false);
    });

    it("accepts a padded name that fits once trimmed", () => {
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        name: `  ${"A".repeat(80)}  `,
      });

      expect(result.success).toBe(true);
    });

    it("rejects a padded email that exceeds 254 characters once trimmed", () => {
      const local = "a".repeat(243);
      const result = contactMessageSchema.safeParse({
        ...validContactMessage,
        email: `  ${local}@example.com  `,
      });

      expect(`${local}@example.com`).toHaveLength(255);
      expect(result.success).toBe(false);
    });

    it("returns trimmed values", () => {
      const result = contactMessageSchema.parse({
        name: "  Ada Lovelace  ",
        email: "  ada@example.com  ",
        message: `  ${validContactMessage.message}  `,
      });

      expect(result).toEqual({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: validContactMessage.message,
      });
    });
  });
});
