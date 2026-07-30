import { afterEach, describe, expect, it } from "vitest";

import {
  fakeTransport,
  shouldUseFakeTransport,
} from "@/lib/contact/select-transport";

afterEach(() => {
  delete process.env.CONTACT_USE_FAKE_TRANSPORT;
  delete process.env.CONTACT_FAKE_TRANSPORT_FAILS;
  fakeTransport.reset();
});

describe("shouldUseFakeTransport", () => {
  it("is off when the flag is unset", () => {
    expect(shouldUseFakeTransport()).toBe(false);
  });

  it("is on when the flag is exactly \"true\"", () => {
    process.env.CONTACT_USE_FAKE_TRANSPORT = "true";

    expect(shouldUseFakeTransport()).toBe(true);
  });

  it.each(["", "false", "1", "yes", "TRUE"])(
    "is off for the value %o",
    (value) => {
      // Only the exact string opts in. Anything else — including values that
      // look truthy — leaves production on the real transport, so a typo can
      // never silently stop the owner's mail from being sent.
      process.env.CONTACT_USE_FAKE_TRANSPORT = value;

      expect(shouldUseFakeTransport()).toBe(false);
    },
  );
});

describe("fakeTransport", () => {
  it("records a send", async () => {
    await fakeTransport.send({
      from: "portfolio@owner.example.com",
      to: "owner@owner.example.com",
      replyTo: "ada@example.com",
      subject: "New contact message from Ada Lovelace",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(fakeTransport.sent).toHaveLength(1);
  });

  it("is a single shared instance, so an E2E run can inspect what was sent", async () => {
    const { fakeTransport: reimported } = await import(
      "@/lib/contact/select-transport"
    );

    expect(reimported).toBe(fakeTransport);
  });
});
