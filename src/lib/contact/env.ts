import "server-only";

export type ContactEnv = {
  apiKey: string;
  from: string;
  to: string;
};

/**
 * The three server-only variables the real transport needs. None is prefixed
 * `NEXT_PUBLIC_`: the API key is a secret and the two addresses are the owner's,
 * so a public name would inline all three into the client bundle.
 */
const VARIABLE_NAMES = {
  apiKey: "RESEND_API_KEY",
  from: "CONTACT_FROM_EMAIL",
  to: "CONTACT_TO_EMAIL",
} as const;

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value === "" ? undefined : value;
}

/**
 * Resolves the transport's configuration, throwing if any variable is missing
 * or blank. Every missing name is reported at once so a misconfigured
 * deployment is diagnosed in one failure rather than one variable at a time.
 */
export function readContactEnv(): ContactEnv {
  const resolved = {
    apiKey: read(VARIABLE_NAMES.apiKey),
    from: read(VARIABLE_NAMES.from),
    to: read(VARIABLE_NAMES.to),
  };

  const missing = (
    Object.keys(VARIABLE_NAMES) as (keyof typeof VARIABLE_NAMES)[]
  )
    .filter((key) => resolved[key] === undefined)
    .map((key) => VARIABLE_NAMES[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required contact environment variables: ${missing.join(", ")}`,
    );
  }

  return resolved as ContactEnv;
}
