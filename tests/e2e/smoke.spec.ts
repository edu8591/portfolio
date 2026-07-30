import { expect, test } from "@playwright/test";

test("the portfolio page loads in the default locale", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("main")).toBeVisible();
});
