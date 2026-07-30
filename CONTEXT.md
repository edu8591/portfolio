# Context

Glossary for the portfolio site's domain language. Terms here are the canonical
vocabulary — code, tickets, and commits should use these words and avoid the
listed synonyms.

## Visitor

Someone browsing the portfolio. Never a "user" — there are no accounts, no
authentication, and no sessions on this site, so "user" implies state that does
not exist. A Visitor is anonymous by definition.

## Contact Message

The name, email address, and message body a Visitor submits through the contact
form, together with the time it was submitted.

A Contact Message is **not persisted**. It exists only long enough to be
validated and delivered as an email; the site has no database and keeps no
record of it. This is deliberate — see `docs/adr/0001-contact-message-delivery.md`.

Avoid "submission" and "enquiry" as synonyms; both blur the distinction between
the Visitor's action and the data it produces.

## Section

A top-level content block on the single-page layout — About Me, Work Experience,
Technologies, Projects, Contact. Each Section owns a DOM `id` so it can be an
anchor target.
