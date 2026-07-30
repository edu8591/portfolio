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
export type EmailTransport = {
  send(email: OutboundEmail): Promise<void>;
};
