"use server";

import { readContactEnv } from "@/lib/contact/env";
import { selectTransport, shouldUseFakeTransport } from "@/lib/contact/select-transport";
import {
  submitContactMessage,
  type SubmitContactMessageResult,
} from "@/lib/contact/submit-contact-message";

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
  formData: FormData,
): Promise<SubmitContactMessageResult> {
  let transport;
  let addresses;

  try {
    transport = await selectTransport();
    addresses = shouldUseFakeTransport()
      ? { from: "fake-from@example.test", to: "fake-to@example.test" }
      : readContactEnv();
  } catch {
    // A misconfigured environment is the owner's problem, not the Visitor's.
    // They get the same inline retry error as a transport failure, with every
    // value they typed still in the form, rather than a crashed page.
    return { status: "error" };
  }

  return submitContactMessage(formData, {
    transport,
    now: () => new Date(),
    from: addresses.from,
    to: addresses.to,
  });
}
