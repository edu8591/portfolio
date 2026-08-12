import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Real Resend, so the suite proves the delivery path that ships rather
      // than a stand-in. `delivered@resend.dev` is Resend's own test recipient:
      // it accepts and confirms the send without mail reaching an inbox.
      // Failure is driven from the browser instead, by submitting an address
      // the action refuses before Resend is called.
      CONTACT_TO_EMAIL: "delivered@resend.dev",
    },
  },
});
