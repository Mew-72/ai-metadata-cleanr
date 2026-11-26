import { expect, test } from "@playwright/test";
import { workflowBudgetFor } from "../budgets.mjs";
import {
  assertWorkflowBudget,
  attachPerformanceMetrics,
  preparePerformancePage,
} from "../support/performance.mjs";

test("sample audit and canvas cleaning stay within each browser budget @performance @workflow", async ({
  page,
}, testInfo) => {
  await preparePerformancePage(page);

  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response, "The home page did not return a document response").not.toBeNull();
  expect(
    response?.status() ?? 500,
    "The home page returned an error status",
  ).toBeLessThan(400);

  await expect(
    page.getByRole("button", { name: "Browse files to clean" }),
  ).toBeVisible();

  const workflowStartedAt = Date.now();
  const auditStartedAt = Date.now();
  await page.getByRole("button", { name: "Try a sample", exact: true }).click();

  const cleanButton = page.getByRole("button", {
    name: "Clean 1 image",
    exact: true,
  });
  await expect(cleanButton).toBeVisible();
  await expect(page.getByText("Ready", { exact: true }).first()).toBeVisible();
  const auditMs = Date.now() - auditStartedAt;

  const cleanStartedAt = Date.now();
  await cleanButton.click();
  await expect(
    page.getByRole("button", { name: "Download image", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Image cleaned", exact: true }),
  ).toBeVisible();
  const cleanMs = Date.now() - cleanStartedAt;

  const metrics = {
    auditMs,
    cleanMs,
    totalMs: Date.now() - workflowStartedAt,
  };
  const scenario = "workflow:sample-audit-and-clean";

  await attachPerformanceMetrics(testInfo, {
    scenario,
    metrics,
    compareMetrics: ["auditMs", "cleanMs", "totalMs"],
    maxRelativeRatio: 3,
    comparisonFloorMs: 100,
  });

  assertWorkflowBudget(metrics, workflowBudgetFor(testInfo), scenario);
});
