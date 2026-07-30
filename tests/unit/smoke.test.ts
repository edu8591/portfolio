import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("unit test harness", () => {
  it("runs a test", () => {
    expect(1 + 1).toBe(2);
  });

  it("resolves the @/* path alias", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
