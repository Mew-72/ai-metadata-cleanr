import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Integration suite, invoked explicitly with `npm run test:integration`.
 *
 * Middleware (`src/proxy.ts`) and HTTP status behavior cannot run under jsdom,
 * so those checks talk to a built app over HTTP instead: `next build` then
 * `next start`, then direct requests. Node environment, no jsdom, no
 * `tests/setup.ts`, and generous timeouts because a production build runs
 * inside the suite lifecycle.
 *
 * This config is separate from `vitest.config.ts` on purpose: `npm test` must
 * stay fast and never shell out to a build.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 600_000,
    // A single built app is shared by the suite, so files must not race.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
