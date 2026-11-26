/**
 * Property 4: Fix Checking - locale-pinned formatting is visitor independent.
 *
 * **Validates: Requirements 1.6, 2.6, 3.7**
 *
 * The readouts in `CleanerInterface.tsx` and `c2pa-scanner/page.tsx` now go
 * through the pinned helpers in `src/lib/localeFormat.ts`. This test generates
 * pixel counts and timestamps across a wide range and asserts the formatted
 * output is invariant under the ambient locales a non-English visitor actually
 * runs, while the `en-CA` counter keys stay byte-identical.
 *
 * The control case matters as much as the property: the same generated inputs
 * are also run through the old unpinned calls, and at least some of them are
 * expected to drift. That is what proves the harness is really changing the
 * ambient locale rather than passing vacuously.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { formatPixelCount, formatSignatureTimestamp } from "@/lib/localeFormat";
import { AMBIENT_LOCALES, withAmbientLocale } from "../support/ambientLocale";

// Real images range from thumbnails to well past 100MP.
const pixelCount = fc.integer({ min: 0, max: 500_000_000 });

// C2PA signature times: 2000-01-01 through 2040-01-01.
const timestamp = fc.integer({
  min: Date.UTC(2000, 0, 1),
  max: Date.UTC(2040, 0, 1),
});

describe("Property 4: pinned formatting is visitor independent", () => {
  it("formats pixel counts identically under every ambient locale", () => {
    fc.assert(
      fc.property(pixelCount, (count) => {
        const reference = formatPixelCount(count);
        for (const locale of AMBIENT_LOCALES) {
          expect(
            withAmbientLocale(locale, () => formatPixelCount(count)),
            `ambient ${locale} changed the pixel readout for ${count}`,
          ).toBe(reference);
        }
        // en-US grouping only, never a dot or a narrow space separator.
        expect(reference).toMatch(/^\d{1,3}(,\d{3})*$/);
      }),
      { numRuns: 300 },
    );
  });

  it("formats signature timestamps identically under every ambient locale", () => {
    fc.assert(
      fc.property(timestamp, (ts) => {
        const reference = formatSignatureTimestamp(ts);
        for (const locale of AMBIENT_LOCALES) {
          expect(
            withAmbientLocale(locale, () => formatSignatureTimestamp(ts)),
            `ambient ${locale} changed the signature readout for ${ts}`,
          ).toBe(reference);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("keeps the en-CA counter keys byte-identical alongside the pinned calls", () => {
    fc.assert(
      fc.property(timestamp, (ts) => {
        const reference = new Date(ts).toLocaleDateString("en-CA");
        for (const locale of AMBIENT_LOCALES) {
          expect(
            withAmbientLocale(locale, () =>
              new Date(ts).toLocaleDateString("en-CA"),
            ),
            `ambient ${locale} changed the en-CA counter key`,
          ).toBe(reference);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("control: the unpinned calls the fix replaced do drift by locale", () => {
    // Not an assertion about app code, an assertion about the harness. If this
    // ever stops drifting, the invariance checks above prove nothing.
    const count = 2_073_600;
    const drifted = AMBIENT_LOCALES.map((locale) =>
      withAmbientLocale(locale, () => count.toLocaleString()),
    );
    expect(new Set(drifted).size).toBeGreaterThan(1);

    const ts = Date.UTC(2024, 10, 30, 15, 4, 5);
    const driftedDates = AMBIENT_LOCALES.map((locale) =>
      withAmbientLocale(locale, () => new Date(ts).toLocaleString()),
    );
    expect(new Set(driftedDates).size).toBeGreaterThan(1);
  });
});
