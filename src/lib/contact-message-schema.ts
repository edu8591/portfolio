import { z } from "zod";

/**
 * The single source of truth for what a valid Contact Message is. Both the form
 * (client) and the Server Action (server trust boundary) parse with this schema.
 *
 * Every field is trimmed before its length is checked, so whitespace-only input
 * fails rather than passing on raw length. The email is trimmed and lowercased
 * before the format check, so a padded or mixed-case address is normalised
 * rather than rejected.
 */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional(), // Honeypot field, should be empty
  renderedAt: z.string(), // Timestamp of when the form was rendered
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export type VisibleContactMessageFields = Omit<
  ContactMessage,
  "website" | "renderedAt"
>;
