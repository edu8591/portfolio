import { afterEach, describe, expect, it } from "vitest";

import {
  createResendTransport,
  type ResendClient,
} from "@/lib/contact/resend-transport";
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

type SentPayload = Parameters<ResendClient["emails"]["send"]>[0];

const stubClient = (error: { message: string } | null = null) => {
  const calls: { apiKey: string; payload: SentPayload }[] = [];

  const createClient = (apiKey: string): ResendClient => ({
    emails: {
      async send(payload) {
        calls.push({ apiKey, payload });
        return { error };
      },
    },
  });

  return { calls, createClient };
};

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.CONTACT_TO_EMAIL;
});

const configure = () => {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_FROM_EMAIL = "portfolio@owner.example.com";
  process.env.CONTACT_TO_EMAIL = "owner@owner.example.com";
};

describe("createResendTransport", () => {
  it("resolves when the provider accepts the email", async () => {
    configure();
    const { createClient } = stubClient();

    await expect(
      createResendTransport(createClient).send(outboundEmail()),
    ).resolves.toBeUndefined();
  });

  it("passes the email through to the provider", async () => {
    configure();
    const { calls, createClient } = stubClient();

    await createResendTransport(createClient).send(outboundEmail());

    expect(calls[0].payload).toMatchObject({
      from: "portfolio@owner.example.com",
      to: "owner@owner.example.com",
      replyTo: "ada@example.com",
      subject: "New contact message from Ada Lovelace",
      html: "<p>Hello</p>",
      text: "Hello",
    });
  });

  it("builds the client with the api key from the environment", async () => {
    configure();
    const { calls, createClient } = stubClient();

    await createResendTransport(createClient).send(outboundEmail());

    expect(calls[0].apiKey).toBe("re_test_key");
  });

  it("rejects when the provider reports an error in the payload", async () => {
    // The SDK reports a rejected send in the payload rather than by throwing.
    // Confirmed delivery gates the Visitor's success state (ADR-0001), so this
    // has to become a rejection or the action would report success for mail
    // that was never accepted.
    configure();
    const { createClient } = stubClient({ message: "Domain is not verified" });

    await expect(
      createResendTransport(createClient).send(outboundEmail()),
    ).rejects.toThrow("Domain is not verified");
  });

  it("rejects when the environment is not configured", async () => {
    const { calls, createClient } = stubClient();

    await expect(
      createResendTransport(createClient).send(outboundEmail()),
    ).rejects.toThrow("RESEND_API_KEY");

    expect(calls).toEqual([]);
  });
});
