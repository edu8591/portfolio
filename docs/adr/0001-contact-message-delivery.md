# 1. Deliver Contact Messages as email through a swappable transport

Date: 2026-07-30

## Status

Accepted

## Context

The portfolio needs a contact form. A Visitor submits a Contact Message and the
site owner needs to receive it and be able to reply.

The site is statically-oriented Next.js deployed on Netlify. It has no database,
no authentication, and no server-side state. Adding any of those for a contact
form would be the largest architectural change the project has ever made.

Two further constraints shaped the decision:

- Email providers reject mail whose `from` address is on an unverified domain, so
  the Visitor's own address cannot be the sender.
- Automated tests must be able to exercise the whole submission path without
  sending real mail or consuming provider quota.

## Decision

Contact Messages are **delivered as email and never persisted**. There is no
database record, no queue, and no admin UI.

Delivery goes through **Resend**, reached via a **transport seam** — a small
module interface that the Server Action depends on rather than calling the Resend
SDK directly. Three implementations exist:

- the real Resend client in production,
- a fake that records what it would have sent, selected by an environment flag
  for end-to-end tests,
- the same fake injected directly in unit tests.

Sender identity is resolved by putting the owner's verified domain in `from` and
the Visitor's address in `replyTo`, so replying from a mail client answers the
Visitor directly.

**Confirmed delivery gates the UI.** Because nothing is persisted, the only
evidence a Contact Message survived is the transport resolving successfully. The
Server Action therefore **awaits** the send and returns its outcome, and the form
is cleared and replaced by the success state **only** on a successful result.

This rules out optimistic UI for this form. Clearing the fields on submit — or on
"request accepted" rather than "email sent" — would destroy the Visitor's only
copy of a message that was never stored anywhere. On any failure (validation, a
spam guard, or a transport error) the form is left exactly as it was with all
values intact, and the error is surfaced inline for the Visitor to retry.

## Consequences

**Accepted willingly:**

- A failed send is unrecoverable. If Resend is down or rejects the message, the
  Contact Message is lost and the Visitor sees an error asking them to retry.
  There is no retry queue and no record to recover from. For a portfolio contact
  form this is an acceptable failure mode; for anything transactional it would
  not be.
- The owner's inbox is the only store. Deleting the email deletes the message.
- Resend is a hard third-party dependency for a core feature, and its free-tier
  limits (100/day) are an effective ceiling on submissions.

**Gained:**

- No database, no schema, no migrations, no data-retention obligation. A form
  that stores nothing has far less to get wrong under GDPR-style scrutiny than
  one that keeps records.
- The transport seam makes the action testable without network access, which is
  what allows unit and end-to-end tests to cover the real submission path.
- Swapping Resend for another provider means writing one new transport
  implementation, not touching the action, the schema, or the form.

## Alternatives considered

- **Persist to a database, notify separately.** Rejected: introduces the
  project's first database purely to hold messages that would be read once and
  never queried. Solves a durability problem the project does not have.
- **A third-party form service (Formspree, Web3Forms).** Rejected: least code,
  but puts an external party between the owner and their messages, and gives up
  control of validation, spam handling, and email formatting.
- **Nodemailer over Gmail SMTP.** Rejected: requires an app password in the
  environment, is prone to throttling and spam-flagging, and Gmail is not
  designed to be an application's outbound mail provider.
- **Calling the Resend SDK directly from the Server Action.** Rejected: it is
  the obvious implementation, but it makes the action untestable without either
  network access or module-level mocking. The seam was chosen specifically so the
  tests could be honest.
