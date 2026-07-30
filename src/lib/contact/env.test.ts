import { afterEach, describe, expect, it } from "vitest";

import { readContactEnv } from "@/lib/contact/env";

const VARIABLES = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const;

const withEnv = (values: Partial<Record<(typeof VARIABLES)[number], string>>) => {
  for (const name of VARIABLES) {
    const value = values[name];

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
};

const complete = {
  RESEND_API_KEY: "re_test_key",
  CONTACT_FROM_EMAIL: "portfolio@owner.example.com",
  CONTACT_TO_EMAIL: "owner@owner.example.com",
} as const;

afterEach(() => {
  withEnv({});
});

describe("readContactEnv", () => {
  it("reads the api key, from address, and to address", () => {
    withEnv(complete);

    expect(readContactEnv()).toEqual({
      apiKey: "re_test_key",
      from: "portfolio@owner.example.com",
      to: "owner@owner.example.com",
    });
  });

  it.each(VARIABLES)("throws when %s is missing", (missing) => {
    withEnv({ ...complete, [missing]: undefined });

    expect(() => readContactEnv()).toThrow(missing);
  });

  it.each(VARIABLES)("throws when %s is blank", (blank) => {
    withEnv({ ...complete, [blank]: "   " });

    expect(() => readContactEnv()).toThrow(blank);
  });

  it("names every missing variable at once", () => {
    withEnv({});

    // Configuring Netlify is easier when one failed boot lists everything
    // that is missing rather than one variable per attempt.
    expect(() => readContactEnv()).toThrow(
      /RESEND_API_KEY[^]*CONTACT_FROM_EMAIL[^]*CONTACT_TO_EMAIL/,
    );
  });

  it("ignores NEXT_PUBLIC_ variables of the same name", () => {
    // These three carry a secret and the owner's personal address, so they must
    // come only from server-only names — a NEXT_PUBLIC_ variable would be
    // inlined into the client bundle and must never be able to supply them.
    withEnv({});
    process.env.NEXT_PUBLIC_RESEND_API_KEY = "leaked_key";
    process.env.NEXT_PUBLIC_CONTACT_FROM_EMAIL = "leaked@example.com";
    process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL = "leaked@example.com";

    expect(() => readContactEnv()).toThrow();

    delete process.env.NEXT_PUBLIC_RESEND_API_KEY;
    delete process.env.NEXT_PUBLIC_CONTACT_FROM_EMAIL;
    delete process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL;
  });
});
