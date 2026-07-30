import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * The failure path needs a transport that rejects, and the flag driving that is
 * read from the server's environment. Rather than mutate a running server, the
 * failing case gets a second one on its own port, and the specs that need it
 * live under `*.failing.spec.ts`.
 */
const FAILING_PORT = PORT + 1;
const failingBaseURL = `http://localhost:${FAILING_PORT}`;

const fakeTransportEnv = {
  // The recorder stands in for Resend (ADR-0001), so the browser-to-action path
  // is exercised end to end without real mail, provider quota, or any of the
  // real transport's configuration.
  CONTACT_USE_FAKE_TRANSPORT: "true",
};

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
      testIgnore: "**/*.failing.spec.ts",
    },
    {
      name: "chromium-failing-transport",
      use: { ...devices["Desktop Chrome"], baseURL: failingBaseURL },
      testMatch: "**/*.failing.spec.ts",
    },
  ],
  webServer: [
    {
      command: `pnpm dev --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: fakeTransportEnv,
    },
    {
      command: `pnpm dev --port ${FAILING_PORT}`,
      url: failingBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...fakeTransportEnv,
        CONTACT_FAKE_TRANSPORT_FAILS: "true",
        NEXT_DIST_DIR: ".next-failing-transport",
      },
    },
  ],
});
