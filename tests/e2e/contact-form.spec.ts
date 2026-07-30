import { expect, test, type Page } from "@playwright/test";

import { MINIMUM_TIME_TO_SUBMIT_MS } from "@/lib/contact/spam-guards";

const validMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I saw your portfolio and would like to talk about a project.",
};

function fields(page: Page) {
  return {
    name: page.getByLabel("Name", { exact: true }),
    email: page.getByLabel("Email", { exact: true }),
    message: page.getByLabel("Message", { exact: true }),
    submit: page.getByRole("button", { name: "Send Message" }),
  };
}

async function fillValidMessage(page: Page) {
  const { name, email, message } = fields(page);

  await name.fill(validMessage.name);
  await email.fill(validMessage.email);
  await message.fill(validMessage.message);
}

/**
 * The too-fast spam guard rejects anything submitted within
 * `MINIMUM_TIME_TO_SUBMIT_MS` of the form rendering. A Visitor typing a real
 * message clears it comfortably; Playwright does not, so the happy path has to
 * wait it out rather than mock the clock — the guard is part of what these
 * tests exist to prove works.
 */
async function waitOutTheSpamGuard(page: Page) {
  await page.waitForTimeout(MINIMUM_TIME_TO_SUBMIT_MS + 500);
}

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

    await expect(page.getByText("Please enter your name (at least 2 characters).")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(
      page.getByText("Please write a message of at least 10 characters."),
    ).toBeVisible();

    // Invalidity is wired to the control, not just painted on.
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(message).toHaveAttribute("aria-invalid", "true");

    // Nothing was sent: the form is still here, with every value intact.
    await expect(submit).toBeEnabled();
    await expect(name).toHaveValue("A");
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
  });

  test("renders the section in every locale", async ({ page }) => {
    for (const [locale, label] of [
      ["es", "Enviar Mensaje"],
      ["jp", "メッセージを送信"],
    ]) {
      await page.goto(`/${locale}#contact`);

      await expect(page.locator("#contact")).toBeVisible();
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });
});
