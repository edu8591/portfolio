import type { ContactEmail, SubmittedContactMessage } from "@/types/contact-message";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes every character that could change the meaning of the surrounding
 * markup. Every Visitor-supplied value passes through here on its way into the
 * html rendering — the message body is untrusted input landing in markup the
 * owner's mail client renders. The text and subject renderings carry no markup
 * and are left unescaped.
 */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

/** Collapses CRLF and CR to a single newline so both renderings agree. */
function normaliseLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

/**
 * Flattens a value to a single line. The subject becomes a mail header, where
 * a raw line break from the Visitor would start a new header field.
 */
function toSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function buildContactEmail({
  name,
  email,
  message,
  submittedAt,
}: SubmittedContactMessage): ContactEmail {
  const body = normaliseLineBreaks(message);
  const timestamp = submittedAt.toISOString();

  const html = [
    "<div>",
    `<p><strong>From:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    `<p><strong>Sent:</strong> ${escapeHtml(timestamp)}</p>`,
    "<hr />",
    `<p>${escapeHtml(body).replace(/\n/g, "<br />")}</p>`,
    "</div>",
  ].join("");

  const text = [
    `From: ${name}`,
    `Email: ${email}`,
    `Sent: ${timestamp}`,
    "",
    body,
    "",
  ].join("\n");

  return {
    subject: `New contact message from ${toSingleLine(name)}`,
    html,
    text,
  };
}
