/**
 * Forces the *ambient* runtime locale for the duration of a callback.
 *
 * "Ambient locale" is the locale a formatting call resolves to when no
 * explicit locale argument is passed. That is exactly the difference between
 * `pixelCount.toLocaleString()` (visitor dependent) and
 * `new Date().toLocaleDateString("en-CA")` (pinned, and load bearing for the
 * persisted daily counter keys in requirement 3.7).
 *
 * The helper only changes the default. Calls that pass a locale explicitly
 * keep resolving against that locale, which is what a real non-English
 * visitor's runtime does, so a test can prove pinned output is unaffected
 * while unpinned output drifts.
 */

type AnyFn = (...args: unknown[]) => unknown;

export const AMBIENT_LOCALES = ["en-US", "pt-BR", "de-DE"] as const;
export type AmbientLocale = (typeof AMBIENT_LOCALES)[number];

export function withAmbientLocale<T>(locale: string, fn: () => T): T {
  const OrigDateTimeFormat = Intl.DateTimeFormat;
  const OrigNumberFormat = Intl.NumberFormat;
  const origNumberToLocaleString = Number.prototype.toLocaleString;
  const origDateToLocaleDateString = Date.prototype.toLocaleDateString;
  const origDateToLocaleString = Date.prototype.toLocaleString;
  const origDateToLocaleTimeString = Date.prototype.toLocaleTimeString;

  const patchIntl = (
    name: "DateTimeFormat" | "NumberFormat",
    Orig: typeof Intl.DateTimeFormat | typeof Intl.NumberFormat,
  ) => {
    const patched = function (
      locales?: string | string[],
      options?: Record<string, unknown>,
    ) {
      const Ctor = Orig as unknown as new (
        l?: string | string[],
        o?: Record<string, unknown>,
      ) => unknown;
      return new Ctor(locales ?? locale, options);
    } as unknown as typeof Intl.DateTimeFormat;
    (patched as unknown as { supportedLocalesOf: AnyFn }).supportedLocalesOf = (
      Orig as unknown as { supportedLocalesOf: AnyFn }
    ).supportedLocalesOf.bind(Orig);
    Object.defineProperty(Intl, name, {
      configurable: true,
      writable: true,
      value: patched,
    });
  };

  const patchProto = (
    proto: object,
    key: string,
    orig: (this: unknown, ...args: unknown[]) => string,
  ) => {
    Object.defineProperty(proto, key, {
      configurable: true,
      writable: true,
      value: function (
        this: unknown,
        locales?: string | string[],
        options?: Record<string, unknown>,
      ) {
        return orig.call(this, locales ?? locale, options);
      },
    });
  };

  patchIntl("DateTimeFormat", OrigDateTimeFormat);
  patchIntl("NumberFormat", OrigNumberFormat);
  patchProto(
    Number.prototype,
    "toLocaleString",
    origNumberToLocaleString as unknown as (this: unknown) => string,
  );
  patchProto(
    Date.prototype,
    "toLocaleDateString",
    origDateToLocaleDateString as unknown as (this: unknown) => string,
  );
  patchProto(
    Date.prototype,
    "toLocaleString",
    origDateToLocaleString as unknown as (this: unknown) => string,
  );
  patchProto(
    Date.prototype,
    "toLocaleTimeString",
    origDateToLocaleTimeString as unknown as (this: unknown) => string,
  );

  try {
    return fn();
  } finally {
    Object.defineProperty(Intl, "DateTimeFormat", {
      configurable: true,
      writable: true,
      value: OrigDateTimeFormat,
    });
    Object.defineProperty(Intl, "NumberFormat", {
      configurable: true,
      writable: true,
      value: OrigNumberFormat,
    });
    Object.defineProperty(Number.prototype, "toLocaleString", {
      configurable: true,
      writable: true,
      value: origNumberToLocaleString,
    });
    Object.defineProperty(Date.prototype, "toLocaleDateString", {
      configurable: true,
      writable: true,
      value: origDateToLocaleDateString,
    });
    Object.defineProperty(Date.prototype, "toLocaleString", {
      configurable: true,
      writable: true,
      value: origDateToLocaleString,
    });
    Object.defineProperty(Date.prototype, "toLocaleTimeString", {
      configurable: true,
      writable: true,
      value: origDateToLocaleTimeString,
    });
  }
}
