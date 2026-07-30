import { createFakeTransport, type FakeTransport } from "@/lib/contact/fake-transport";
import type { EmailTransport, OutboundEmail } from "@/lib/contact/transport";

/**
 * The one fake instance the whole process shares, so an end-to-end run can
 * assert on what the action actually handed the transport.
 */
const recorder = createFakeTransport();

/**
 * Whether the send should fail. Read per send rather than fixed when the
 * transport is built, so an end-to-end spec can drive the failure path without
 * restarting the dev server.
 */
function isConfiguredToFail(): boolean {
  return process.env.CONTACT_FAKE_TRANSPORT_FAILS === "true";
}

export const fakeTransport: FakeTransport = {
  get sent(): readonly OutboundEmail[] {
    return recorder.sent;
  },
  async send(email) {
    if (isConfiguredToFail()) {
      throw new Error("Fake transport configured to fail");
    }

    await recorder.send(email);
  },
  reset() {
    recorder.reset();
  },
};

/**
 * Whether to swap the real Resend client for the recorder (ADR-0001).
 *
 * Only the exact string `"true"` opts in. A loose truthiness check would let a
 * stray value in the production environment silently stop the owner's mail from
 * ever being sent — a failure that looks exactly like success.
 */
export function shouldUseFakeTransport(): boolean {
  return process.env.CONTACT_USE_FAKE_TRANSPORT === "true";
}

/**
 * Resolves the transport for this environment. The real client is imported
 * lazily so that a fake-transport run never loads the Resend SDK or touches its
 * configuration.
 */
export async function selectTransport(): Promise<EmailTransport> {
  if (shouldUseFakeTransport()) {
    return fakeTransport;
  }

  const { createResendTransport } = await import("@/lib/contact/resend-transport");

  return createResendTransport();
}
