/**
 * Property 2: Preservation - the `en-CA` daily counter keys are unchanged.
 *
 * **Validates: Requirements 3.7**
 *
 * Persisted clean and scan counters are keyed by
 * `new Date().toLocaleDateString("en-CA")` in `CleanerInterface.tsx`,
 * `c2pa-scanner/page.tsx` and `dashboard/page.tsx`. Task 3.11 pins the
 * *unpinned* formatting calls nearby, and the risk is that a broad
 * search-and-replace also rewrites these three, which would invalidate every
 * stored counter.
 *
 * Two checks. The behavioural one asserts the key derivation is byte-identical
 * under the ambient locales a non-English visitor actually runs, over generated
 * timestamps. The source one asserts the three pinned call sites still exist,
 * which is what actually protects the stored data.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { AMBIENT_LOCALES, withAmbientLocale } from "../support/ambientLocale";
import { baselineFor } from "../support/baseline";

const REPO_ROOT = path.resolve(__dirname, "../..");

const COUNTER_KEY_SITES = [
  "src/components/CleanerInterface.tsx",
  "src/app/c2pa-scanner/page.tsx",
  "src/app/dashboard/page.tsx",
];

/** The exact derivation the three call sites use. */
function counterKey(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-CA");
}

// A wide but realistic range: 2020-01-01 through 2035-01-01.
const timestamp = fc.integer({
  min: Date.UTC(2020, 0, 1),
  max: Date.UTC(2035, 0, 1),
});

describe("Property 2: en-CA counter keys are visitor independent", () => {
  it("derives byte-identical keys under every ambient locale", () => {
    fc.assert(
      fc.property(timestamp, (ts) => {
        const reference = withAmbientLocale("en-US", () => counterKey(ts));
        for (const locale of AMBIENT_LOCALES) {
          expect(
            withAmbientLocale(locale, () => counterKey(ts)),
            `ambient ${locale} changed the counter key`,
          ).toBe(reference);
        }
        // The pinned format is ISO-like, which is what stored keys look like.
        expect(reference).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }),
      { numRuns: 200 },
    );
  });

  it("keeps the recorded key format for fixed dates", () => {
    for (const ts of [
      Date.UTC(2024, 0, 5, 12),
      Date.UTC(2024, 10, 30, 12),
      Date.UTC(2025, 5, 9, 12),
    ]) {
      const key = counterKey(ts);
      expect(key).toEqual(baselineFor("locale", `counterKey|${ts}`, key));
    }
  });

  it("keeps the pinned en-CA call sites in place", () => {
    for (const relative of COUNTER_KEY_SITES) {
      const source = fs.readFileSync(path.join(REPO_ROOT, relative), "utf8");
      const occurrences = source.split(`toLocaleDateString("en-CA")`).length - 1;
      expect(occurrences, `${relative} lost its pinned en-CA counter keys`).toEqual(
        baselineFor("locale", `enCASites|${relative}`, occurrences),
      );
      expect(occurrences).toBeGreaterThan(0);
    }
  });
});
