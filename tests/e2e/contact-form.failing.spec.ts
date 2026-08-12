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

/**
 * A bot fills the decoy the only way it can — writing to the DOM node, which
 * fires no React event — and must be told the same thing a Visitor is told, so
 * it learns nothing about having been caught.
 *
 * The failing transport is what makes this provable. Against a working one, a
 * discarded submission and a delivered one both render the success state and
 * are indistinguishable. Here a real send returns an error, so success can only
 * mean the guard tripped before the transport was ever reached.
 */
test("silently discards a submission whose honeypot is filled", async ({ page }) => {
  await page.goto("/en#contact");
  await fillValidMessage(page);
  await waitOutTheSpamGuard(page);

  await page
    .locator('input[name="website"]')
    .evaluate((input: HTMLInputElement) => {
      input.value = "https://bot.example";
    });

  await fields(page).submit.click();

  await expect(page.getByTestId("contact-success")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(
    0,
  );
});
