import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // Server-only modules guard themselves with `import "server-only"`, whose
    // default export throws. Resolving the `react-server` condition gives the
    // tests the same empty module Next's server build sees, so the guard can
    // protect production without making the modules untestable. Test files are
    // loaded through Vite's SSR pipeline, so the condition belongs here.
    resolve: {
      conditions: ["react-server", "node", "import"],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
  },
});
