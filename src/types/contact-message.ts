import type { VisibleContactMessageFields } from "@/lib/contact-message-schema";

/**
 * A validated Contact Message together with the time it was submitted.
 *
 * The Visitor's fields come from `contactMessageSchema` — the single source of
 * truth for what a valid Contact Message is — so this type cannot drift from
 * what the form and the Server Action actually parse. The timestamp is added by
 * the server at submission time rather than parsed from the Visitor's input.
 */
export type SubmittedContactMessage = VisibleContactMessageFields & {
  submittedAt: Date;
};

/** The rendered email a Contact Message becomes. */
export type ContactEmail = {
  subject: string;
  html: string;
  text: string;
};

/**
 * What the Server Action tells the form. `success` is the only outcome that
 * clears the Visitor's text, and it is returned exclusively after Resend has
 * confirmed the send (ADR-0001) — or after a spam guard tripped, which is
 * deliberately indistinguishable.
 */
export type SubmitContactMessageResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "error" };
