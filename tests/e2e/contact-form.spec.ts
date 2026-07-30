import { expect, test } from "@playwright/test";

import {
  expectDescribedError,
  fields,
  fillValidMessage,
  validMessage,
  waitOutTheSpamGuard,
} from "./contact-form.helpers";

test.describe("contact form", () => {
  test("is reachable via the #contact anchor", async ({ page }) => {
    await page.goto("/en#contact");

    await expect(page.locator("#contact")).toBeVisible();
    await expect(fields(page).submit).toBeVisible();
  });

  test("renders last on the page", async ({ page }) => {
    await page.goto("/en");

    const sectionIds = await page
      .locator("section[id]")
      .evaluateAll((sections) => sections.map((section) => section.id));

    expect(sectionIds.at(-1)).toBe("contact");
  });

  test("shows translated inline errors and submits nothing when invalid", async ({
    page,
  }) => {
    await page.goto("/en#contact");

    const { name, email, message, submit } = fields(page);

    await name.fill("A");
    await email.fill("not-an-email");
    await message.fill("short");
    await submit.click();

    await expectDescribedError(
      page,
      "name",
      "Please enter your name (at least 2 characters).",
    );
    await expectDescribedError(page, "email", "Please enter a valid email address.");
    await expectDescribedError(
      page,
      "message",
      "Please write a message of at least 10 characters.",
    );

    // Nothing was sent: the form is still here, with every value intact.
    await expect(submit).toBeEnabled();
    await expect(name).toHaveValue("A");
  });

  test("keeps focus and caret in the field while the Visitor types", async ({ page }) => {
    await page.goto("/en#contact");

    const { message } = fields(page);

    // Typed key by key rather than filled, so a control that remounts per
    // keystroke — the failure mode of defining a component during render —
    // shows up as lost focus or a scrambled value.
    await message.click();
    await page.keyboard.type("Hello there, this is a real message.", { delay: 10 });

    await expect(message).toBeFocused();
    await expect(message).toHaveValue("Hello there, this is a real message.");
  });

  test("disables the submit control and shows a pending state while sending", async ({
    page,
  }) => {
    await page.goto("/en#contact");
    await fillValidMessage(page);
    await waitOutTheSpamGuard(page);

    const { submit } = fields(page);

    // The action resolves quickly against the recorder, so the pending state is
    // caught by holding the response until both assertions have run.
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });

    await page.route("**/en**", async (route) => {
      if (route.request().method() !== "POST") {
        return route.fallback();
      }

      await held;
      return route.fallback();
    });

    await submit.click();

    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText("Sending...");

    release();
    await expect(page.getByTestId("contact-success")).toBeVisible({ timeout: 15_000 });
  });

  test("replaces the form with a persistent success state once the send is confirmed", async ({
    page,
  }) => {
    await page.goto("/en#contact");
    await fillValidMessage(page);
    await waitOutTheSpamGuard(page);

    await fields(page).submit.click();

    const success = page.getByTestId("contact-success");
    await expect(success).toBeVisible({ timeout: 15_000 });
    await expect(success).toContainText("Message sent");
    await expect(fields(page).submit).toHaveCount(0);

    // Persistent: no auto-dismiss returns the Visitor to the form.
    await page.waitForTimeout(5_000);
    await expect(success).toBeVisible();
  });

  test("restores an empty form from the send-another affordance", async ({ page }) => {
    await page.goto("/en#contact");
    await fillValidMessage(page);
    await waitOutTheSpamGuard(page);
    await fields(page).submit.click();

    await expect(page.getByTestId("contact-success")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Send another message" }).click();

    const { name, email, message } = fields(page);
    await expect(name).toHaveValue("");
    await expect(email).toHaveValue("");
    await expect(message).toHaveValue("");
  });

  test("keeps the honeypot out of the Visitor's way while still submitting it", async ({
    page,
  }) => {
    await page.goto("/en#contact");

    const honeypot = page.locator('input[name="website"]');

    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");

    // Tabbing from the last real control never lands on it.
    await fields(page).message.focus();
    await page.keyboard.press("Tab");
    await expect(honeypot).not.toBeFocused();

    // Present in the submission: a bot that fills it in gets the same success
    // state as a Visitor, and the transport is never reached. Proven here by
    // submitting inside the spam-guard window with the decoy filled — a send
    // that would otherwise be rejected as too fast still reports success.
    await fillValidMessage(page);

    // Set through the DOM rather than `fill()`, which refuses invisible
    // elements — the very property that makes this a honeypot. A bot driving
    // the markup directly has no such scruples.
    await honeypot.evaluate((input: HTMLInputElement) => {
      input.value = "https://bot.example";
    });

    await fields(page).submit.click();

    await expect(page.getByTestId("contact-success")).toBeVisible({ timeout: 15_000 });
  });

  test("translates errors and the success state in every locale", async ({ page }) => {
    const locales = [
      {
        locale: "es",
        submit: "Enviar Mensaje",
        nameError: "Por favor ingresa tu nombre (mínimo 2 caracteres).",
        success: "Mensaje enviado",
        sendAnother: "Enviar otro mensaje",
      },
      {
        locale: "jp",
        submit: "メッセージを送信",
        nameError: "お名前を入力してください（2文字以上）。",
        success: "送信完了",
        sendAnother: "別のメッセージを送信",
      },
    ];

    for (const { locale, submit, nameError, success, sendAnother } of locales) {
      await page.goto(`/${locale}#contact`);

      await expect(page.locator("#contact")).toBeVisible();

      const submitButton = page.getByRole("button", { name: submit });
      await expect(submitButton).toBeVisible();

      // A translated inline error.
      await page.locator("#contact-name").fill("A");
      await submitButton.click();
      await expect(page.locator("#contact-name-error")).toHaveText(nameError);

      // And a translated success state.
      await page.locator("#contact-name").fill(validMessage.name);
      await page.locator("#contact-email").fill(validMessage.email);
      await page.locator("#contact-message").fill(validMessage.message);
      await waitOutTheSpamGuard(page);
      await submitButton.click();

      const successState = page.getByTestId("contact-success");
      await expect(successState).toContainText(success, { timeout: 15_000 });
      await expect(page.getByRole("button", { name: sendAnother })).toBeVisible();
    }
  });
});
