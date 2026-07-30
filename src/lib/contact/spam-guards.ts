/**
 * The shortest time a genuine Visitor could plausibly take to read the form,
 * type a name, an address, and at least ten characters of message, and submit.
 * Naive bots post the moment they parse the markup and fall well under it.
 */
export const MINIMUM_TIME_TO_SUBMIT_MS = 3_000;

/**
 * Whether a submission arrived faster than a human could have produced it.
 *
 * A pure function of two timestamps rather than a reader of the clock, so the
 * boundary cases are testable in milliseconds without sleeping. A submission
 * timestamped before its own form render is treated as too fast: the elapsed
 * time is not evidence of a Visitor typing, so the guard fails closed.
 */
export function isTooFast(renderedAt: Date, now: Date): boolean {
  const elapsedMs = now.getTime() - renderedAt.getTime();

  return !(elapsedMs >= MINIMUM_TIME_TO_SUBMIT_MS);
}

/**
 * Whether the hidden decoy field came back filled in. A Visitor never sees the
 * field, so anything but empty means something automated filled the form.
 */
export function isHoneypotTripped(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== "";
}
