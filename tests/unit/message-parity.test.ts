import { describe, expect, it } from "vitest";

import en from "@/../messages/en.json";
import es from "@/../messages/es.json";
import jp from "@/../messages/jp.json";
import { routing } from "@/i18n/routing";

type Messages = Record<string, unknown>;

/** Every leaf path in a message tree, e.g. `contact.errors.nameTooShort`. */
function leafPaths(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? leafPaths(value as Messages, path)
      : [path];
  });
}

const catalogues: Record<string, Messages> = { en, es, jp };

describe("message catalogues", () => {
  it("covers every configured locale", () => {
    expect(Object.keys(catalogues).sort()).toEqual([...routing.locales].sort());
  });

  it.each(["es", "jp"])(
    "gives %s exactly the keys en has, so a missing translation fails here rather than rendering a raw key",
    (locale) => {
      expect(leafPaths(catalogues[locale]).sort()).toEqual(leafPaths(en).sort());
    },
  );
});
