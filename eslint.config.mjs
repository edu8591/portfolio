import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    // `eslint-config-next` ignores `.next` by name, so the end-to-end run's
    // second build directory has to be named here as well.
    ignores: [".next-failing-transport/**"],
  },
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],
  },
]);