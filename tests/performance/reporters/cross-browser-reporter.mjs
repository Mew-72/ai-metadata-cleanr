import fs from "node:fs";
import path from "node:path";

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
};

export default class CrossBrowserReporter {
  constructor(options = {}) {
    this.outputFile =
      options.outputFile ??
      path.resolve("test-results", "performance-summary.json");
    this.records = [];
  }

  onTestEnd(test, result) {
    for (const attachment of result.attachments) {
      if (attachment.name !== "performance-metrics" || !attachment.body) {
        continue;
      }

      try {
        this.records.push({
          ...JSON.parse(attachment.body.toString("utf8")),
          testTitle: test.titlePath().join(" > "),
          testStatus: result.status,
          retry: result.retry,
        });
      } catch (error) {
        console.error(`Could not parse performance attachment: ${error.message}`);
      }
    }
  }

  async onEnd() {
    const comparableRecords = this.records.filter(
      (record) => record.testStatus === "passed",
    );
    const grouped = new Map();

    for (const record of comparableRecords) {
      const key = `${record.performanceClass}:${record.scenario}`;
      const existing = grouped.get(key) ?? [];
      existing.push(record);
      grouped.set(key, existing);
    }

    const comparisons = [];
    const violations = [];

    for (const [group, records] of grouped) {
      const metricNames = new Set(records.flatMap((record) => record.compareMetrics));

      for (const metricName of metricNames) {
        const valuesByProject = new Map();

        for (const record of records) {
          const value = record.metrics[metricName];
          if (!Number.isFinite(value)) {
            continue;
          }

          const projectValues = valuesByProject.get(record.projectName) ?? [];
          projectValues.push(value);
          valuesByProject.set(record.projectName, projectValues);
        }

        if (valuesByProject.size < 2) {
          continue;
        }

        const projectMedians = Object.fromEntries(
          [...valuesByProject].map(([projectName, values]) => [
            projectName,
            median(values),
          ]),
        );
        const medians = Object.values(projectMedians);
        const fastestMs = Math.min(...medians);
        const slowestMs = Math.max(...medians);
        const comparisonFloorMs = Math.max(
          ...records.map((record) => record.comparisonFloorMs ?? 100),
        );
        const maxRelativeRatio = Math.min(
          ...records.map((record) => record.maxRelativeRatio),
        );
        const relativeRatio = slowestMs / Math.max(fastestMs, comparisonFloorMs);
        const comparison = {
          group,
          metricName,
          projectMedians,
          fastestMs,
          slowestMs,
          relativeRatio,
          maxRelativeRatio,
          passed: relativeRatio <= maxRelativeRatio,
        };

        comparisons.push(comparison);
        if (!comparison.passed) {
          violations.push(comparison);
        }
      }
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      records: this.records,
      comparisons,
      violations,
    };

    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, `${JSON.stringify(summary, null, 2)}\n`);

    if (violations.length > 0) {
      for (const violation of violations) {
        console.error(
          `PERF DRIFT ${violation.group} ${violation.metricName}: ` +
            `${violation.relativeRatio.toFixed(2)}x exceeds ` +
            `${violation.maxRelativeRatio.toFixed(2)}x`,
        );
      }
      return { status: "failed" };
    }

    console.log(`Performance summary written to ${this.outputFile}`);
    return undefined;
  }
}
