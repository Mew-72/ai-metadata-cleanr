const requestedMultiplier = Number.parseFloat(
  process.env.PERFORMANCE_BUDGET_MULTIPLIER ?? "1",
);

const multiplier =
  Number.isFinite(requestedMultiplier) && requestedMultiplier > 0
    ? requestedMultiplier
    : 1;

const scaled = (value) => Math.round(value * multiplier);

export const PERFORMANCE_BUDGETS = Object.freeze({
  desktop: Object.freeze({
    navigation: Object.freeze({
      ttfbMs: scaled(1_800),
      domContentLoadedMs: scaled(3_500),
      loadMs: scaled(5_000),
      readyMs: scaled(5_500),
      fcpMs: scaled(3_000),
      lcpMs: scaled(4_000),
      cls: 0.15,
      firstPartyResourceCount: 120,
      firstPartyTransferBytes: scaled(4_000_000),
    }),
    workflow: Object.freeze({
      auditMs: scaled(3_500),
      cleanMs: scaled(3_500),
      totalMs: scaled(6_000),
    }),
  }),
  mobile: Object.freeze({
    navigation: Object.freeze({
      ttfbMs: scaled(2_200),
      domContentLoadedMs: scaled(4_500),
      loadMs: scaled(6_500),
      readyMs: scaled(7_000),
      fcpMs: scaled(4_000),
      lcpMs: scaled(5_500),
      cls: 0.15,
      firstPartyResourceCount: 120,
      firstPartyTransferBytes: scaled(4_000_000),
    }),
    workflow: Object.freeze({
      auditMs: scaled(4_500),
      cleanMs: scaled(4_500),
      totalMs: scaled(8_000),
    }),
  }),
});

export function performanceClassFor(testInfo) {
  const performanceClass = testInfo.project.metadata.performanceClass;
  return performanceClass === "mobile" ? "mobile" : "desktop";
}

export function navigationBudgetFor(testInfo) {
  return PERFORMANCE_BUDGETS[performanceClassFor(testInfo)].navigation;
}

export function workflowBudgetFor(testInfo) {
  return PERFORMANCE_BUDGETS[performanceClassFor(testInfo)].workflow;
}
