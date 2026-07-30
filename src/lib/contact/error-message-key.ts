/** The `contact` translation keys the form can show under a field. */
export type ContactErrorMessageKey =
  | "nameTooShort"
  | "nameTooLong"
  | "emailInvalid"
  | "emailTooLong"
  | "messageTooShort"
  | "messageTooLong"
  | "invalid";

/** The part of a Zod issue this mapper reads. Kept structural so a plain object works. */
export type ContactIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
};

const KEYS_BY_FIELD: Record<string, Partial<Record<string, ContactErrorMessageKey>>> = {
  name: { too_small: "nameTooShort", too_big: "nameTooLong", invalid_type: "nameTooShort" },
  email: {
    invalid_format: "emailInvalid",
    too_big: "emailTooLong",
    too_small: "emailInvalid",
    invalid_type: "emailInvalid",
  },
  message: {
    too_small: "messageTooShort",
    too_big: "messageTooLong",
    invalid_type: "messageTooShort",
  },
};

/**
 * Turns a Zod issue into a translation key.
 *
 * The shared schema (#48) carries no messages, because a message in the schema
 * would be a single hard-coded language reaching both the Server Action and
 * three locales. Translating happens here instead, at the edge that has a
 * translator, and the key is all the schema's structure is asked to yield.
 *
 * Anything unrecognised falls back to a generic key rather than surfacing Zod's
 * untranslated English to a Visitor.
 */
export function errorMessageKey(issue: ContactIssue): ContactErrorMessageKey {
  const field = typeof issue.path[0] === "string" ? issue.path[0] : "";

  return KEYS_BY_FIELD[field]?.[issue.code] ?? "invalid";
}
