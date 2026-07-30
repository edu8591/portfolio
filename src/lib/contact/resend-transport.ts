import "server-only";

import { Resend } from "resend";

import { readContactEnv } from "@/lib/contact/env";
import type { EmailTransport } from "@/lib/contact/transport";

/**
 * The slice of the Resend SDK this module uses. Narrowing it to one method
 * keeps the provider's surface area out of the rest of the codebase and lets
 * the error-reporting branch below be tested without network access.
 */
export type ResendClient = {
  emails: {
    send(payload: {
      from: string;
      to: string;
      replyTo: string;
      subject: string;
      html: string;
      text: string;
    }): Promise<{ error: { message: string } | null }>;
  };
};

/**
 * The production transport (ADR-0001). Nothing outside this module imports the
 * Resend SDK, so swapping providers means rewriting this file alone.
 *
 * Configuration is read at send time rather than at module load: reading it
 * eagerly would make an unconfigured environment fail at import, taking down
 * the whole page instead of the one submission that needs the variables.
 */
export function createResendTransport(
  createClient: (apiKey: string) => ResendClient = (apiKey) => new Resend(apiKey),
): EmailTransport {
  return {
    async send({ subject, html, text, from, to, replyTo }) {
      const { apiKey } = readContactEnv();
      const resend = createClient(apiKey);

      const { error } = await resend.emails.send({
        from,
        to,
        replyTo,
        subject,
        html,
        text,
      });

      // The SDK reports a rejected send in the payload rather than by
      // throwing. Confirmed delivery gates the Visitor's success state, so a
      // reported error has to become a rejection here or the action would
      // report success for mail that was never accepted.
      if (error) {
        throw new Error(`Resend rejected the contact message: ${error.message}`);
      }
    },
  };
}
