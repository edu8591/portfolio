import { describe, expect, it } from "vitest";

import { buildContactEmail } from "@/lib/contact/email";
import type { SubmittedContactMessage } from "@/types/contact-message";

const contactMessage = (
  overrides: Partial<SubmittedContactMessage> = {},
): SubmittedContactMessage => ({
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I saw your portfolio.",
  submittedAt: new Date("2026-07-30T12:34:56.000Z"),
  ...overrides,
});

describe("buildContactEmail", () => {
  it("returns a subject, html, and text rendering", () => {
    const email = buildContactEmail(contactMessage());

    expect(email.subject).toBeTypeOf("string");
    expect(email.html).toBeTypeOf("string");
    expect(email.text).toBeTypeOf("string");
  });

  it("names the Visitor in the subject", () => {
    const email = buildContactEmail(contactMessage({ name: "Grace Hopper" }));

    expect(email.subject).toContain("Grace Hopper");
  });

  it("keeps the subject to a single line", () => {
    // The subject becomes a mail header, where a raw line break from the
    // Visitor's name would start a new header field.
    const email = buildContactEmail(
      contactMessage({ name: "Ada\r\nBcc: someone@example.com" }),
    );

    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.subject).toContain("Ada Bcc: someone@example.com");
  });

  describe("escaping", () => {
    it("escapes a script-tag payload in the message body", () => {
      const email = buildContactEmail(
        contactMessage({ message: "<script>alert('xss')</script>" }),
      );

      expect(email.html).not.toContain("<script>");
      expect(email.html).toContain("&lt;script&gt;");
    });

    it.each([
      ["name", "From"],
      ["email", "Email"],
      ["message", null],
    ] as const)("escapes & < > \" in the %s field", (field, label) => {
      const email = buildContactEmail(contactMessage({ [field]: `& < > " end` }));
      const escaped = "&amp; &lt; &gt; &quot; end";

      // Assert against the specific labelled line, so escaping one field can't
      // mask another field going unescaped.
      expect(email.html).toContain(
        label ? `<strong>${label}:</strong> ${escaped}` : `<p>${escaped}</p>`,
      );
    });

    it("leaves the plain-text rendering unescaped", () => {
      const email = buildContactEmail(contactMessage({ message: "5 < 6 & 7 > 6" }));

      expect(email.text).toContain("5 < 6 & 7 > 6");
    });

    it("escapes a payload that would break out of an attribute", () => {
      const email = buildContactEmail(
        contactMessage({ email: `"><img src=x onerror=alert(1)>` }),
      );

      expect(email.html).not.toContain("<img");
      expect(email.html).not.toContain(`"><`);
    });
  });

  describe("line breaks", () => {
    const multiline = "First line\nSecond line\n\nFourth line";

    it("preserves the Visitor's line breaks in the html rendering", () => {
      const email = buildContactEmail(contactMessage({ message: multiline }));

      expect(email.html).toContain("First line<br />Second line<br /><br />Fourth line");
    });

    it("preserves the Visitor's line breaks in the text rendering", () => {
      const email = buildContactEmail(contactMessage({ message: multiline }));

      expect(email.text).toContain(multiline);
    });

    it("normalises CRLF line breaks", () => {
      const email = buildContactEmail(
        contactMessage({ message: "First line\r\nSecond line" }),
      );

      expect(email.html).toContain("First line<br />Second line");
      expect(email.text).toContain("First line\nSecond line");
      expect(email.text).not.toContain("\r");
    });
  });

  describe("the text alternative", () => {
    const email = buildContactEmail(contactMessage());

    it("carries the Visitor's name", () => {
      expect(email.text).toContain("Ada Lovelace");
    });

    it("carries the Visitor's email address", () => {
      expect(email.text).toContain("ada@example.com");
    });

    it("carries the message body", () => {
      expect(email.text).toContain("Hello, I saw your portfolio.");
    });

    it("carries the timestamp", () => {
      expect(email.text).toContain("2026-07-30T12:34:56.000Z");
    });

    it("carries no markup", () => {
      expect(email.text).not.toMatch(/<[a-z/]/i);
    });
  });

  describe("the html rendering", () => {
    const email = buildContactEmail(contactMessage());

    it("carries the Visitor's name, email, message, and timestamp", () => {
      expect(email.html).toContain("Ada Lovelace");
      expect(email.html).toContain("ada@example.com");
      expect(email.html).toContain("Hello, I saw your portfolio.");
      expect(email.html).toContain("2026-07-30T12:34:56.000Z");
    });

    it("labels each value with semantic markup", () => {
      expect(email.html).toContain("<strong>");
    });

    it("references no external images or stylesheets", () => {
      expect(email.html).not.toMatch(/<img|<link|<style/i);
    });
  });

  it("is pure — the same Contact Message always renders the same email", () => {
    const message = contactMessage();

    expect(buildContactEmail(message)).toEqual(buildContactEmail(message));
  });
});
