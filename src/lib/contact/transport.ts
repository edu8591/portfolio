import type { ContactEmail } from "@/types/contact-message";

/** An email addressed and ready to hand to a provider. */
export type OutboundEmail = ContactEmail & {
  /** The owner's verified-domain address. Never the Visitor's. */
  from: string;
  /** The owner's inbox. */
  to: string;
  /** The Visitor's address, so replying answers them directly. */
  replyTo: string;
};

/**
 * The seam the Server Action depends on instead of the Resend SDK (ADR-0001).
 *
 * `send` resolves only once the provider has accepted the email, and rejects
 * otherwise — the action's typed success is gated on that promise, so a
 * transport that resolves without delivering would break the one guarantee the
 * feature makes.
 */
/** The name of the decoy field. A Visitor never sees it; bots fill it in. */
export const HONEYPOT_FIELD = "website";

/**
 * What the Server Action tells the form. `success` is the only outcome that
 * clears the Visitor's text, and it is returned exclusively after a transport
 * has confirmed the send (ADR-0001) — or after a spam guard tripped, which is
 * deliberately indistinguishable.
 */
export type SubmitContactMessageResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "error" };

export type EmailTransport = {
  send(email: OutboundEmail): Promise<void>;
};
