import { describe, expect, it } from "vitest";

import {
  MINIMUM_TIME_TO_SUBMIT_MS,
  isTooFast,
  isHoneypotTripped,
} from "@/lib/contact/spam-guards";

describe("isTooFast", () => {
  const renderedAt = new Date("2026-07-30T12:00:00.000Z");
  const afterRender = (elapsedMs: number) =>
    new Date(renderedAt.getTime() + elapsedMs);

  it("rejects a submission below the threshold", () => {
    expect(isTooFast(renderedAt, afterRender(MINIMUM_TIME_TO_SUBMIT_MS - 1))).toBe(
      true,
    );
  });

  it("accepts a submission exactly at the threshold", () => {
    // The threshold is the minimum acceptable elapsed time, not the first
    // rejected one — a Visitor who takes exactly that long is not a bot.
    expect(isTooFast(renderedAt, afterRender(MINIMUM_TIME_TO_SUBMIT_MS))).toBe(
      false,
    );
  });

  it("accepts a submission above the threshold", () => {
    expect(isTooFast(renderedAt, afterRender(MINIMUM_TIME_TO_SUBMIT_MS + 1))).toBe(
      false,
    );
  });

  it("rejects an instant submission", () => {
    expect(isTooFast(renderedAt, renderedAt)).toBe(true);
  });

  it("rejects a submission timestamped before the form was rendered", () => {
    // A negative elapsed time means the render time was forged or the clock
    // moved; neither is a Visitor typing, so it fails closed.
    expect(isTooFast(renderedAt, afterRender(-60_000))).toBe(true);
  });

  it("is pure — the same pair of timestamps always gives the same answer", () => {
    const now = afterRender(MINIMUM_TIME_TO_SUBMIT_MS * 2);

    expect(isTooFast(renderedAt, now)).toBe(isTooFast(renderedAt, now));
  });

  it("requires at least a couple of seconds, so a real Visitor is never caught", () => {
    expect(MINIMUM_TIME_TO_SUBMIT_MS).toBeGreaterThanOrEqual(2_000);
    expect(MINIMUM_TIME_TO_SUBMIT_MS).toBeLessThanOrEqual(10_000);
  });
});

describe("isHoneypotTripped", () => {
  it("is untripped when the field is absent", () => {
    expect(isHoneypotTripped(undefined)).toBe(false);
  });

  it("is untripped when the field is empty", () => {
    expect(isHoneypotTripped("")).toBe(false);
  });

  it("is untripped when the field holds only whitespace", () => {
    // Some browsers and password managers write stray whitespace into hidden
    // inputs; that is not a bot filling the trap in.
    expect(isHoneypotTripped("   ")).toBe(false);
  });

  it("is tripped when the field holds a value", () => {
    expect(isHoneypotTripped("https://spam.example.com")).toBe(true);
  });
});
