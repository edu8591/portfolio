"use server";

import {
  ContactMessage,
  contactMessageSchema,
} from "@/lib/contact-message-schema";
import { buildContactEmail } from "@/lib/contact/email";
import { isTooFast } from "@/lib/contact/spam-guards";
import { FORCED_FAILURE_ADDRESS } from "@/constants/contact";
import { type SubmitContactMessageResult } from "@/types/contact-message";
import { Resend } from "resend";


/**
 * The form's entry point: guards, then validation, then delivery.
 *
 * Per ADR-0001 nothing persists a Contact Message, so `success` is returned
 * only once Resend has confirmed the send — never optimistically.
 */
export async function sendContactMessage(
  data: ContactMessage,
): Promise<SubmitContactMessageResult> {
  const now = new Date();
  const renderedAt = new Date(data.renderedAt);
  const isHoneypotTripped = data.website !== "";

  if (isHoneypotTripped || isTooFast(renderedAt, now)) {
    return { status: "success" };
  }

  const parsed = contactMessageSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  if (parsed.data.email === FORCED_FAILURE_ADDRESS) {
    return { status: "error" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    // A misconfigured environment is the owner's problem, not the Visitor's.
    // They get the same inline retry error as a delivery failure, with every
    // value they typed still in the form, rather than a crashed page — so the
    // reason is logged here or it is lost.
    console.error(
      "Contact form is misconfigured: RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL must all be set.",
    );

    return { status: "error" };
  }

  const email = buildContactEmail({ ...parsed.data, submittedAt: now });
  const resend = new Resend(apiKey);

  try {
    // The SDK reports API rejections in `error` rather than throwing, so the
    // catch below only covers network faults. Returning success without
    // checking `error` would tell the Visitor their message was delivered
    // while it was in fact refused — and nothing kept a copy.
    const { error } = await resend.emails.send({
      ...email,
      from,
      to,
      replyTo: parsed.data.email,
    });

    if (error) {
      return { status: "error" };
    }
  } catch {
    return { status: "error" };
  }

  return { status: "success" };
}
