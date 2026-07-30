import "server-only";

import { Resend } from "resend";

import { readContactEnv } from "@/lib/contact/env";
import type { EmailTransport } from "@/lib/contact/transport";

/**
 * The production transport (ADR-0001). Nothing outside this module imports the
 * Resend SDK, so swapping providers means rewriting this file alone.
 *
 * Configuration is read at send time rather than at module load: reading it
 * eagerly would make an unconfigured environment fail at import, taking down
 * the whole page instead of the one submission that needs the variables.
 */
export function createResendTransport(): EmailTransport {
  return {
    async send({ subject, html, text, from, to, replyTo }) {
      const { apiKey } = readContactEnv();
      const resend = new Resend(apiKey);

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
