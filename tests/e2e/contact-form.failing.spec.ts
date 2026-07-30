import { expect, test } from "@playwright/test";

import {
  fields,
  fillValidMessage,
  validMessage,
  waitOutTheSpamGuard,
} from "./contact-form.helpers";

/**
 * Runs against the dev server whose fake transport is configured to reject, so
 * the Visitor-facing consequence of a lost Contact Message is proven rather than
 * assumed. Nothing persists a Contact Message (ADR-0001), which makes the values
 * still sitting in the form the Visitor's only copy — losing them here would
 * lose the message outright.
 */
test("keeps every typed value and shows the error inline when the send fails", async ({
  page,
}) => {
  await page.goto("/en#contact");
  await fillValidMessage(page);
  await waitOutTheSpamGuard(page);

  const { name, email, message, submit } = fields(page);
  await submit.click();

  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible({
    timeout: 15_000,
  });

  // The form is still the form — no success state, and nothing was cleared.
  await expect(page.getByTestId("contact-success")).toHaveCount(0);
  await expect(name).toHaveValue(validMessage.name);
  await expect(email).toHaveValue(validMessage.email);
  await expect(message).toHaveValue(validMessage.message);
  await expect(submit).toBeEnabled();
});
