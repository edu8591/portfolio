import { describe, expect, it } from "vitest";

import { createFakeTransport } from "@/lib/contact/fake-transport";
import type { OutboundEmail } from "@/lib/contact/transport";

const outboundEmail = (overrides: Partial<OutboundEmail> = {}): OutboundEmail => ({
  from: "portfolio@owner.example.com",
  to: "owner@owner.example.com",
  replyTo: "ada@example.com",
  subject: "New contact message from Ada Lovelace",
  html: "<p>Hello</p>",
  text: "Hello",
  ...overrides,
});

describe("createFakeTransport", () => {
  it("records nothing before anything is sent", () => {
    const transport = createFakeTransport();

    expect(transport.sent).toEqual([]);
  });

  it("resolves and records the email it was given", async () => {
    const transport = createFakeTransport();
    const email = outboundEmail();

    await transport.send(email);

    expect(transport.sent).toEqual([email]);
  });

  it("records each send in order", async () => {
    const transport = createFakeTransport();

    await transport.send(outboundEmail({ subject: "first" }));
    await transport.send(outboundEmail({ subject: "second" }));

    expect(transport.sent.map((email) => email.subject)).toEqual([
      "first",
      "second",
    ]);
  });

  it("rejects when configured to fail", async () => {
    const transport = createFakeTransport({ failing: true });

    await expect(transport.send(outboundEmail())).rejects.toThrow();
  });

  it("re-reads a failing predicate on every send", async () => {
    // The E2E flag can flip between sends, so the answer must not be fixed at
    // construction.
    let failing = false;
    const transport = createFakeTransport({ failing: () => failing });

    await transport.send(outboundEmail());

    failing = true;
    await expect(transport.send(outboundEmail())).rejects.toThrow();

    failing = false;
    await transport.send(outboundEmail());

    expect(transport.sent).toHaveLength(2);
  });

  it("records nothing when configured to fail", async () => {
    // A failing transport must look like a provider that never accepted the
    // email, so a test asserting "nothing was sent" can trust the recording.
    const transport = createFakeTransport({ failing: true });

    await expect(transport.send(outboundEmail())).rejects.toThrow();

    expect(transport.sent).toEqual([]);
  });
});
