import type { EmailTransport, OutboundEmail } from "@/lib/contact/transport";

export type FakeTransport = EmailTransport & {
  /** Every email the transport accepted, in the order it accepted them. */
  readonly sent: readonly OutboundEmail[];
  /** Forgets every recorded email, so one test can't leak into the next. */
  reset(): void;
};

export type FakeTransportOptions = {
  /** When true, every send rejects and records nothing. */
  failing?: boolean;
};

/**
 * A transport that records what it would have sent instead of sending it
 * (ADR-0001). Injected directly in unit tests, and selected by an environment
 * flag in end-to-end runs so the browser-to-action path is exercised without
 * real mail or provider quota.
 */
export function createFakeTransport({
  failing = false,
}: FakeTransportOptions = {}): FakeTransport {
  const sent: OutboundEmail[] = [];

  return {
    sent,
    async send(email) {
      if (failing) {
        throw new Error("Fake transport configured to fail");
      }

      sent.push(email);
    },
    reset() {
      sent.length = 0;
    },
  };
}
