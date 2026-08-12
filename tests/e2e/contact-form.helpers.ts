import { expect, type Page } from "@playwright/test";

import { MINIMUM_TIME_TO_SUBMIT_MS } from "@/lib/contact/spam-guards";

export const validMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I saw your portfolio and would like to talk about a project.",
};

/** The form's controls, found the way a Visitor finds them. */
export function fields(page: Page) {
  return {
    name: page.getByLabel("Name", { exact: true }),
    email: page.getByLabel("Email", { exact: true }),
    message: page.getByLabel("Message", { exact: true }),
    submit: page.getByRole("button", { name: /Send Message|Sending/ }),
  };
}

export async function fillValidMessage(page: Page) {
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
export async function waitOutTheSpamGuard(page: Page) {
  await page.waitForTimeout(MINIMUM_TIME_TO_SUBMIT_MS + 500);
}

/**
 * Asserts a field is marked invalid *and* that its error text is wired to it by
 * `aria-describedby` — the half most likely to rot, since the visible message
 * looks correct either way.
 */
export async function expectDescribedError(
  page: Page,
  field: "name" | "email" | "message",
  text: string,
) {
  const control = fields(page)[field];

  await expect(control).toHaveAttribute("aria-invalid", "true");

  const describedBy = await control.getAttribute("aria-describedby");
  expect(describedBy).toBe(`contact-${field}-error`);

  await expect(page.locator(`#${describedBy}`)).toHaveText(text);
}
