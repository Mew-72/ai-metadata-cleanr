/**
 * Locale-pinned formatting helpers.
 *
 * ScrubAI serves English only and declares `<html lang="en">`. Formatting
 * calls that omit a locale resolve against the *visitor's* ambient locale
 * instead, so the same value renders differently per visitor and drifts the
 * moment any of that markup moves to the server. Every formatting call in the
 * cleaning and scanning UI goes through one of these helpers so its output is
 * visitor independent (Property 4, requirements 1.6 / 2.6).
 *
 * Not in scope here: the `new Date().toLocaleDateString("en-CA")` calls that
 * key the persisted daily clean and scan counters. Those are already pinned
 * and their exact output is stored data, so they stay where they are and keep
 * their own locale (requirement 3.7).
 */

/** The single display locale for app-formatted numbers and dates. */
export const DISPLAY_LOCALE = "en-US";

const pixelCountFormatter = new Intl.NumberFormat(DISPLAY_LOCALE, {
  style: "decimal",
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const signatureTimestampFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * Formats a pixel count with grouping separators, pinned so a non-English
 * visitor sees the same string an English visitor does.
 */
export function formatPixelCount(pixelCount: number): string {
  if (!Number.isFinite(pixelCount)) return "-";
  return pixelCountFormatter.format(Math.round(pixelCount));
}

/**
 * Formats a C2PA signature timestamp with explicit date and time options.
 * Returns "-" for values that are not a usable date, which is what the
 * scanner readout already treats as unknown.
 */
export function formatSignatureTimestamp(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) return "-";
  return signatureTimestampFormatter.format(date);
}
