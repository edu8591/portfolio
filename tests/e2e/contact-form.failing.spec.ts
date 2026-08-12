import { expect, test } from "@playwright/test";

import { FORCED_FAILURE_ADDRESS } from "@/constants/contact";
import {
  fields,
  fillValidMessage,
  validMessage,
  waitOutTheSpamGuard,
} from "./contact-form.helpers";

/**
 * The delivery-failure path, driven by submitting a reserved address the action
 * refuses before Resend is ever called. No quota, no network, no second server.
 */
test.describe("when delivery fails", () => {
  /**
   * Nothing persists a Contact Message (ADR-0001), which makes the values still
   * sitting in the form the Visitor's only copy — losing them here would lose
   * the message outright.
   */
  test("keeps every typed value and shows the error inline", async ({ page }) => {
    await page.goto("/en#contact");
    await fillValidMessage(page);

    const { name, email, message, submit } = fields(page);
    await email.fill(FORCED_FAILURE_ADDRESS);
    await waitOutTheSpamGuard(page);

    await submit.click();

    await expect(
      page.getByText("Something went wrong. Please try again."),
    ).toBeVisible({ timeout: 15_000 });

    // The form is still the form — no success state, and nothing was cleared.
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
    await expect(name).toHaveValue(validMessage.name);
    await expect(email).toHaveValue(FORCED_FAILURE_ADDRESS);
    await expect(message).toHaveValue(validMessage.message);
    await expect(submit).toBeEnabled();
  });

  /**
   * A bot fills the decoy the only way it can — writing to the DOM node, which
   * fires no React event — and must be told the same thing a Visitor is told,
   * so it learns nothing about having been caught.
   *
   * The failing address is what makes this provable. Submitted on its own it
   * returns an error, so a success here can only mean the honeypot guard
   * tripped first and the delivery path was never reached.
   */
  test("silently discards a submission whose honeypot is filled", async ({
    page,
  }) => {
    await page.goto("/en#contact");
    await fillValidMessage(page);
    await fields(page).email.fill(FORCED_FAILURE_ADDRESS);
    await waitOutTheSpamGuard(page);

    await page
      .locator('input[name="website"]')
      .evaluate((input: HTMLInputElement) => {
        input.value = "https://bot.example";
      });

    await fields(page).submit.click();

    await expect(page.getByTestId("contact-success")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText("Something went wrong. Please try again."),
    ).toHaveCount(0);
  });
});
