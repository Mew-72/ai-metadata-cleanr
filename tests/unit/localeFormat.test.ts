/**
 * Unit tests for the locale-pinned formatting helpers (task 3.11).
 *
 * The helpers exist so the cleaning and scanning readouts render the same
 * string for every visitor. These tests check the concrete outputs and that
 * forcing the ambient runtime locale to pt-BR or de-DE does not move them.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DISPLAY_LOCALE,
  formatPixelCount,
  formatSignatureTimestamp,
} from "@/lib/localeFormat";
import { AMBIENT_LOCALES, withAmbientLocale } from "../support/ambientLocale";

const REPO_ROOT = path.resolve(__dirname, "../..");

describe("formatPixelCount", () => {
  it("groups with the pinned en-US separator", () => {
    expect(formatPixelCount(999_999)).toBe("999,999");
    expect(formatPixelCount(1_234)).toBe("1,234");
    expect(formatPixelCount(0)).toBe("0");
  });

  it("rounds to whole pixels and rejects non-finite input", () => {
    expect(formatPixelCount(1_234.6)).toBe("1,235");
    expect(formatPixelCount(Number.NaN)).toBe("-");
    expect(formatPixelCount(Number.POSITIVE_INFINITY)).toBe("-");
  });

  it("returns the same string under every ambient locale", () => {
    for (const locale of AMBIENT_LOCALES) {
      expect(
        withAmbientLocale(locale, () => formatPixelCount(2_073_600)),
        `ambient ${locale} changed the pixel readout`,
      ).toBe("2,073,600");
    }
  });
});

describe("formatSignatureTimestamp", () => {
  const fixed = Date.UTC(2024, 10, 30, 15, 4, 5);

  it("accepts Date, string and number input", () => {
    const fromNumber = formatSignatureTimestamp(fixed);
    expect(formatSignatureTimestamp(new Date(fixed))).toBe(fromNumber);
    expect(formatSignatureTimestamp(new Date(fixed).toISOString())).toBe(fromNumber);
  });

  it("returns a dash for unusable values", () => {
    expect(formatSignatureTimestamp("not a date")).toBe("-");
    expect(formatSignatureTimestamp(Number.NaN)).toBe("-");
  });

  it("returns the same string under every ambient locale", () => {
    const reference = formatSignatureTimestamp(fixed);
    for (const locale of AMBIENT_LOCALES) {
      expect(
        withAmbientLocale(locale, () => formatSignatureTimestamp(fixed)),
        `ambient ${locale} changed the signature readout`,
      ).toBe(reference);
    }
    // Pinned to en-US with explicit options: month name, 24 hour clock.
    expect(reference).toMatch(/^[A-Z][a-z]{2} \d{2}, \d{4}, \d{2}:\d{2}:\d{2}$/);
  });
});

describe("pinned display locale", () => {
  it("is en-US, matching the English document the app serves", () => {
    expect(DISPLAY_LOCALE).toBe("en-US");
  });

  it("leaves no unpinned formatting call in the readout files", () => {
    // Guards against a regression re-introducing an ambient-locale call.
    // `toLocaleDateString("en-CA")` is pinned and must survive, so the check
    // looks for calls with no locale argument at all.
    for (const relative of [
      "src/components/CleanerInterface.tsx",
      "src/app/c2pa-scanner/page.tsx",
      "src/app/dashboard/page.tsx",
    ]) {
      const source = fs.readFileSync(path.join(REPO_ROOT, relative), "utf8");
      expect(
        source.match(/toLocale(String|DateString|TimeString)\(\s*\)/g),
        `${relative} has an unpinned toLocale* call`,
      ).toBeNull();
    }
  });
});
