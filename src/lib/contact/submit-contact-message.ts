import { contactMessageSchema } from "@/lib/contact-message-schema";
import { buildContactEmail } from "@/lib/contact/email";
import { isHoneypotTripped, isTooFast } from "@/lib/contact/spam-guards";
import type { EmailTransport } from "@/lib/contact/transport";

/** The name of the decoy field. A Visitor never sees it; bots fill it in. */
export const HONEYPOT_FIELD = "website";

/** The name of the hidden field carrying the time the form was rendered. */
export const RENDERED_AT_FIELD = "renderedAt";

/**
 * What the Server Action tells the form. `success` is the only outcome that
 * clears the Visitor's text, and it is returned exclusively after a transport
 * has confirmed the send (ADR-0001) — or after a spam guard tripped, which is
 * deliberately indistinguishable.
 */
export type SubmitContactMessageResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "error" };

export type SubmitContactMessageDependencies = {
  transport: EmailTransport;
  /** Injected rather than read from the clock, so timing is testable. */
  now: () => Date;
  from: string;
  to: string;
};

function readField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);

  return typeof value === "string" ? value : undefined;
}

/**
 * The submission path, with every dependency injected so the whole thing is
 * exercised in unit tests without network access.
 *
 * Order matters: the spam guards run before anything is built or sent, so a bot
 * costs nothing, and the schema re-parses the raw input because this is the
 * trust boundary — whatever the browser validated is not evidence.
 */
export async function submitContactMessage(
  formData: FormData,
  { transport, now, from, to }: SubmitContactMessageDependencies,
): Promise<SubmitContactMessageResult> {
  const submittedAt = now();

  if (isHoneypotTripped(readField(formData, HONEYPOT_FIELD))) {
    return { status: "success" };
  }

  // An absent or unparseable render time yields an invalid Date, whose elapsed
  // time is NaN — `isTooFast` fails closed on it rather than letting a bot skip
  // the guard by omitting the field.
  const renderedAt = new Date(readField(formData, RENDERED_AT_FIELD) ?? Number.NaN);

  if (isTooFast(renderedAt, submittedAt)) {
    return { status: "success" };
  }

  const parsed = contactMessageSchema.safeParse({
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    message: readField(formData, "message"),
  });

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const email = buildContactEmail({ ...parsed.data, submittedAt });

  try {
    await transport.send({ ...email, from, to, replyTo: parsed.data.email });
  } catch {
    // The Contact Message is lost — nothing persists it (ADR-0001) — so the
    // Visitor is told to retry while the form keeps every value they typed.
    return { status: "error" };
  }

  return { status: "success" };
}
