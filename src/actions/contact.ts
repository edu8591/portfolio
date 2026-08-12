"use server";

import {
  ContactMessage,
  contactMessageSchema,
} from "@/lib/contact-message-schema";
import { buildContactEmail } from "@/lib/contact/email";
import { readContactEnv } from "@/lib/contact/env";
import {
  selectTransport,
  shouldUseFakeTransport,
} from "@/lib/contact/select-transport";
import { isTooFast } from "@/lib/contact/spam-guards";
import { type SubmitContactMessageResult } from "@/lib/contact/transport";

/**
 * The form's entry point. Everything worth testing lives in
 * `submitContactMessage`; this wrapper only resolves the real environment's
 * dependencies and hands them over.
 *
 * A fake-transport run must not require Resend's configuration, so the
 * addresses fall back to placeholders when the flag is on — the recorder never
 * looks at them beyond recording what it was handed.
 */
export async function sendContactMessage(
  data: ContactMessage,
): Promise<SubmitContactMessageResult> {
  let transport;
  let addresses;
  const now = new Date();
  const renderedAt = new Date(data.renderedAt) ?? Number.NaN;
  const isHoneypotTripped = data.website !== "";

  if (isHoneypotTripped || isTooFast(renderedAt, now)) {
    return { status: "success" };
  }

  const parsed = contactMessageSchema.safeParse(data);
  if (!parsed.success) {
    console.log("Validation failed:", parsed.error.flatten().fieldErrors);
    return {
      status: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    transport = await selectTransport();
    console.log("===================");
    console.log("===================");
    console.log("===================");
    console.log("Selected transport:", transport.constructor.name);
    addresses = shouldUseFakeTransport()
      ? { from: "fake-from@example.test", to: "fake-to@example.test" }
      : readContactEnv();
    console.log(addresses);
  } catch {
    console.error("Failed to read contact environment or select transport");
    return { status: "error" };
  }

  const email = buildContactEmail({ ...parsed.data, submittedAt: now });

  try {
    await transport.send({
      ...email,
      from: addresses.from,
      to: addresses.to,
      replyTo: parsed.data.email,
    });
  } catch {
    console.log("Failed to send contact message via transport");
    return { status: "error" };
  }
  return { status: "success" };
}
