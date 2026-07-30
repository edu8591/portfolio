import type { EmailTransport, OutboundEmail } from "@/lib/contact/transport";

export type FakeTransport = EmailTransport & {
  /** Every email the transport accepted, in the order it accepted them. */
  readonly sent: readonly OutboundEmail[];
  /** Forgets every recorded email, so one test can't leak into the next. */
  reset(): void;
};

export type FakeTransportOptions = {
  /**
   * Whether a send should reject and record nothing. A predicate rather than a
   * flag, so a caller reading an environment variable can change the answer
   * between sends without rebuilding the transport.
   */
  failing?: boolean | (() => boolean);
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
  const isFailing = typeof failing === "function" ? failing : () => failing;

  return {
    sent,
    async send(email) {
      if (isFailing()) {
        throw new Error("Fake transport configured to fail");
      }

      sent.push(email);
    },
    reset() {
      sent.length = 0;
    },
  };
}
