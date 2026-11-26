import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number.parseInt(process.env.PERFORMANCE_PORT ?? "3000", 10);
const managedBaseUrl = `http://127.0.0.1:${port}`;
const baseURL = process.env.PERFORMANCE_BASE_URL ?? managedBaseUrl;
const repeatEach = Number.parseInt(process.env.PERFORMANCE_REPEATS ?? "1", 10);
const useManagedServer = !process.env.PERFORMANCE_BASE_URL;

export default defineConfig({
  testDir: "./specs",
  outputDir: "./test-results/artifacts",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  repeatEach: Number.isFinite(repeatEach) && repeatEach > 0 ? repeatEach : 1,
  reporter: [
    ["list"],
    [
      path.join(currentDirectory, "reporters", "cross-browser-reporter.mjs"),
      {
        outputFile: path.join(
          currentDirectory,
          "test-results",
          "performance-summary.json",
        ),
      },
    ],
  ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: useManagedServer
    ? {
        command: "node support/start-app.mjs",
        cwd: currentDirectory,
        url: managedBaseUrl,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          PERFORMANCE_PORT: String(port),
        },
      }
    : undefined,
  projects: [
    {
      name: "chromium-desktop",
      metadata: { performanceClass: "desktop" },
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox-desktop",
      metadata: { performanceClass: "desktop" },
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-desktop",
      metadata: { performanceClass: "desktop" },
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "chromium-mobile",
      metadata: { performanceClass: "mobile" },
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "webkit-mobile",
      metadata: { performanceClass: "mobile" },
      use: { ...devices["iPhone 13"] },
    },
  ],
});
