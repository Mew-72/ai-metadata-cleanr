import { expect } from "@playwright/test";
import { performanceClassFor } from "../budgets.mjs";

const ANALYTICS_ROUTE = /\/ingest(?:\/|$)/;

export async function preparePerformancePage(page) {
  await page.route(ANALYTICS_ROUTE, async (route) => {
    await route.fulfill({
      status: 204,
      contentType: "application/json",
      body: "",
    });
  });

  await page.addInitScript(() => {
    const measurements = {
      cls: 0,
      lcpMs: null,
      longTaskCount: 0,
      longTaskDurationMs: 0,
    };
    const observers = [];

    Object.defineProperty(window, "__scrubAIPerformance", {
      configurable: true,
      value: measurements,
    });
    Object.defineProperty(window, "__scrubAIPerformanceObservers", {
      configurable: true,
      value: observers,
    });

    const supportsEntry = (entryType) =>
      Array.isArray(PerformanceObserver.supportedEntryTypes) &&
      PerformanceObserver.supportedEntryTypes.includes(entryType);

    if (supportsEntry("layout-shift")) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            measurements.cls += entry.value ?? 0;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      observers.push(observer);
    }

    if (supportsEntry("largest-contentful-paint")) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const latest = entries.at(-1);
        if (latest) {
          measurements.lcpMs = latest.startTime;
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(observer);
    }

    if (supportsEntry("longtask")) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          measurements.longTaskCount += 1;
          measurements.longTaskDurationMs += entry.duration;
        }
      });
      observer.observe({ type: "longtask", buffered: true });
      observers.push(observer);
    }
  });
}

export async function collectNavigationMetrics(page, readyLocator) {
  await readyLocator.waitFor({ state: "visible" });
  await page.waitForLoadState("load");
  await page.waitForTimeout(250);

  return page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!navigation) {
      throw new Error("Navigation Timing API did not return an entry");
    }

    const paints = performance.getEntriesByType("paint");
    const firstContentfulPaint = paints.find(
      (entry) => entry.name === "first-contentful-paint",
    );
    const resources = performance
      .getEntriesByType("resource")
      .filter((entry) => {
        try {
          return new URL(entry.name, window.location.href).origin === location.origin;
        } catch {
          return false;
        }
      });
    const observed = window.__scrubAIPerformance ?? {};

    return {
      ttfbMs: navigation.responseStart - navigation.startTime,
      domContentLoadedMs:
        navigation.domContentLoadedEventEnd - navigation.startTime,
      loadMs: navigation.loadEventEnd - navigation.startTime,
      readyMs: performance.now(),
      fcpMs: firstContentfulPaint?.startTime ?? null,
      lcpMs: observed.lcpMs ?? null,
      cls: observed.cls ?? null,
      longTaskCount: observed.longTaskCount ?? null,
      longTaskDurationMs: observed.longTaskDurationMs ?? null,
      firstPartyResourceCount: resources.length,
      firstPartyTransferBytes:
        (navigation.transferSize ?? 0) +
        resources.reduce((total, entry) => total + (entry.transferSize ?? 0), 0),
    };
  });
}

function expectAtMost(value, maximum, label) {
  expect
    .soft(value, `${label}: ${value} exceeded budget ${maximum}`)
    .toBeLessThanOrEqual(maximum);
}

export function assertNavigationBudget(metrics, budget, scenario) {
  expectAtMost(metrics.ttfbMs, budget.ttfbMs, `${scenario} TTFB (ms)`);
  expectAtMost(
    metrics.domContentLoadedMs,
    budget.domContentLoadedMs,
    `${scenario} DOMContentLoaded (ms)`,
  );
  expectAtMost(metrics.loadMs, budget.loadMs, `${scenario} load (ms)`);
  expectAtMost(metrics.readyMs, budget.readyMs, `${scenario} ready (ms)`);
  expectAtMost(
    metrics.firstPartyResourceCount,
    budget.firstPartyResourceCount,
    `${scenario} first-party resource count`,
  );

  if (metrics.firstPartyTransferBytes > 0) {
    expectAtMost(
      metrics.firstPartyTransferBytes,
      budget.firstPartyTransferBytes,
      `${scenario} first-party transfer bytes`,
    );
  }
  if (metrics.fcpMs !== null) {
    expectAtMost(metrics.fcpMs, budget.fcpMs, `${scenario} FCP (ms)`);
  }
  if (metrics.lcpMs !== null) {
    expectAtMost(metrics.lcpMs, budget.lcpMs, `${scenario} LCP (ms)`);
  }
  if (metrics.cls !== null) {
    expectAtMost(metrics.cls, budget.cls, `${scenario} CLS`);
  }
}

export function assertWorkflowBudget(metrics, budget, scenario) {
  expectAtMost(metrics.auditMs, budget.auditMs, `${scenario} sample audit (ms)`);
  expectAtMost(metrics.cleanMs, budget.cleanMs, `${scenario} canvas clean (ms)`);
  expectAtMost(metrics.totalMs, budget.totalMs, `${scenario} total workflow (ms)`);
}

export async function attachPerformanceMetrics(
  testInfo,
  {
    scenario,
    metrics,
    compareMetrics,
    maxRelativeRatio,
    comparisonFloorMs = 100,
  },
) {
  const payload = {
    scenario,
    projectName: testInfo.project.name,
    performanceClass: performanceClassFor(testInfo),
    metrics,
    compareMetrics,
    maxRelativeRatio,
    comparisonFloorMs,
  };

  await testInfo.attach("performance-metrics", {
    body: Buffer.from(JSON.stringify(payload, null, 2)),
    contentType: "application/json",
  });

  console.log(`PERF ${scenario} ${testInfo.project.name} ${JSON.stringify(metrics)}`);
}
