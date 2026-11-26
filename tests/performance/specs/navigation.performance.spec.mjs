import { expect, test } from "@playwright/test";
import { navigationBudgetFor } from "../budgets.mjs";
import {
  assertNavigationBudget,
  attachPerformanceMetrics,
  collectNavigationMetrics,
  preparePerformancePage,
} from "../support/performance.mjs";

const ROUTES = [
  {
    name: "home workspace",
    path: "/",
    ready: (page) => page.getByRole("button", { name: "Browse files to clean" }),
  },
  {
    name: "pricing",
    path: "/pricing",
    ready: (page) => page.getByRole("heading", { name: /Pay once/i }),
  },
  {
    name: "C2PA scanner",
    path: "/c2pa-scanner",
    ready: (page) => page.getByRole("button", { name: "Upload image to scan" }),
  },
  {
    name: "docs index",
    path: "/docs",
    ready: (page) =>
      page.getByRole("heading", { name: /Guides on metadata, reach/i }),
  },
  {
    name: "dynamic docs article",
    path: "/docs/pixel-redraw-technique",
    ready: (page) =>
      page.getByRole("heading", { name: /Pixel Redraw Technique/i }).first(),
  },
  {
    name: "privacy policy",
    path: "/privacy",
    ready: (page) => page.locator("h1").first(),
  },
];

test.describe("public route performance", () => {
  for (const route of ROUTES) {
    test(`${route.name} renders within its browser budget @performance`, async ({
      page,
    }, testInfo) => {
      await preparePerformancePage(page);

      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
      });

      expect(response, `${route.path} did not return a document response`).not.toBeNull();
      expect(
        response?.status() ?? 0,
        `${route.path} returned an error status`,
      ).toBeGreaterThanOrEqual(200);
      expect(
        response?.status() ?? 500,
        `${route.path} returned an error status`,
      ).toBeLessThan(400);

      const metrics = await collectNavigationMetrics(page, route.ready(page));
      const scenario = `navigation:${route.path}`;

      await attachPerformanceMetrics(testInfo, {
        scenario,
        metrics,
        compareMetrics: ["readyMs", "domContentLoadedMs"],
        maxRelativeRatio: 2.75,
      });

      assertNavigationBudget(metrics, navigationBudgetFor(testInfo), scenario);
    });
  }
});
