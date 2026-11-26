/**
 * Privacy-safe error reporting for the app error boundaries.
 *
 * ScrubAI's product invariant is that image bytes never leave the browser.
 * Error telemetry is the one outbound path an error boundary adds, so every
 * field it can carry is enumerated here and every free-text field is redacted
 * before capture. Redaction runs over messages the app did not author too, so
 * a third-party library that echoes a filename into an error cannot leak it.
 *
 * No stack traces are sent. Stacks in a client bundle can carry interpolated
 * values and buy little for this class of failure.
 */
import posthog from "posthog-js";

/** PostHog event name, snake_case to match the existing UI events. */
export const APP_ERROR_EVENT = "app_error";

/** Hard length cap applied to every sanitized string. */
export const ERROR_MESSAGE_MAX_LENGTH = 300;

/** Shorter cap for the error name, which is a class name in practice. */
export const ERROR_NAME_MAX_LENGTH = 80;

/** The complete set of property keys `reportAppError` is allowed to emit. */
export const ALLOWED_ERROR_FIELDS = [
  "error_name",
  "error_message",
  "error_digest",
  "route",
  "boundary",
  "translation_active",
  "browser_language",
] as const;

export type AllowedErrorField = (typeof ALLOWED_ERROR_FIELDS)[number];

/** Which boundary caught the error. */
export type BoundaryLevel = "route" | "global";

export interface AppErrorContext {
  boundary: BoundaryLevel;
  /** Pathname override. Defaults to `window.location.pathname`. */
  route?: string;
  /** Document override, for tests. Defaults to the ambient document. */
  doc?: Document;
}

export interface AppErrorPayload {
  error_name: string;
  error_message: string;
  error_digest?: string;
  route: string;
  boundary: BoundaryLevel;
  translation_active: boolean;
  browser_language: string;
}

/* ------------------------------------------------------------------ *
 * Redaction
 * ------------------------------------------------------------------ */

const REDACTED_URL = "[redacted-url]";
const REDACTED_FILE = "[redacted-file]";
const REDACTED_PATH = "[redacted-path]";
const REDACTED_VALUE = "[redacted-value]";
const REDACTED_SIZE = "[redacted-size]";

/**
 * Object, data, and filesystem URLs. These can embed an entire image, so they
 * are stripped first and stripped whole.
 */
const URL_PATTERN = /\b(?:blob|data|filesystem):[^\s"'`<>)\]]*/gi;

/** Raster, vector, and camera-raw extensions, plus the archive we export. */
const IMAGE_EXTENSIONS =
  "jpg|jpeg|jpe|jfif|png|gif|webp|avif|heic|heif|hif|tif|tiff|bmp|ico|svg|dng|cr2|cr3|nef|nrw|arw|srf|sr2|orf|rw2|raf|raw|pef|srw|x3f|zip";

/** A filename token ending in an image extension. Spaces are not consumed. */
const IMAGE_FILENAME_PATTERN = new RegExp(
  `[\\w\\-.()\\[\\]%~+@]*\\.(?:${IMAGE_EXTENSIONS})\\b`,
  "gi",
);

/**
 * Path-like tokens: at least two separators, so plain routes such as
 * `/pricing` survive while `/Users/me/holiday` and `C:\photos\a\b` do not.
 */
const PATH_PATTERN =
  /(?:[A-Za-z]:)?[\\/](?:[^\s\\/"'`<>|]+[\\/])+[^\s\\/"'`<>|]*/g;

/**
 * EXIF, GPS, IPTC, and XMP key names, together with whatever value follows.
 * The key is informative on its own but the value is the leak, and there is no
 * safe way to keep one without the other in free text.
 */
const EXIF_PATTERN =
  /\b(?:GPS[A-Za-z]*|Exif[A-Za-z]*|IPTC[A-Za-z]*|XMP[A-Za-z]*|C2PA[A-Za-z]*|Make|Model|LensMake|LensModel|BodySerialNumber|SerialNumber|Artist|Author|Creator|Copyright|Software|HostComputer|UserComment|ImageDescription|DateTimeOriginal|DateTimeDigitized|CreateDate|ModifyDate|OffsetTime|SubSecTime|Latitude|Longitude|Altitude|Orientation|WhiteBalance|FNumber|ApertureValue|ExposureTime|ShutterSpeedValue|FocalLength|FocalLengthIn35mmFilm|ISO|ISOSpeed|ISOSpeedRatings|ColorSpace|ImageWidth|ImageHeight|ImageLength|PixelXDimension|PixelYDimension|PixelWidth|PixelHeight|ThumbnailOffset|ThumbnailLength)\b\s*[:=]?\s*[^\s,;)\]}]*/gi;

/** Dimension pairs such as `1920x1080`, which are image-derived. */
const DIMENSION_PATTERN = /\b\d{2,6}\s?[x\u00d7]\s?\d{2,6}\b/gi;

/**
 * Redact and truncate a message so it is safe to transmit.
 *
 * Accepts `unknown` because error messages reach us from third-party code and
 * are not guaranteed to be strings.
 */
export function sanitizeErrorMessage(
  message: unknown,
  maxLength: number = ERROR_MESSAGE_MAX_LENGTH,
): string {
  if (typeof message !== "string" || message.length === 0) return "";

  const redacted = message
    .replace(URL_PATTERN, REDACTED_URL)
    .replace(IMAGE_FILENAME_PATTERN, REDACTED_FILE)
    .replace(PATH_PATTERN, REDACTED_PATH)
    .replace(EXIF_PATTERN, REDACTED_VALUE)
    .replace(DIMENSION_PATTERN, REDACTED_SIZE)
    .replace(/\s+/g, " ")
    .trim();

  return truncate(redacted, maxLength);
}

function truncate(value: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;
  if (maxLength <= 3) return value.slice(0, maxLength);
  return `${value.slice(0, maxLength - 3)}...`;
}

/* ------------------------------------------------------------------ *
 * Payload construction
 * ------------------------------------------------------------------ */

/** Next.js digests are opaque tokens. Anything else is not a digest. */
const DIGEST_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** BCP 47 shaped tags only, so a hostile `navigator.language` cannot ride along. */
const LANGUAGE_TAG_PATTERN = /^[A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8}){0,4}$/;

function resolveDoc(doc?: Document): Document | undefined {
  if (doc) return doc;
  return typeof document === "undefined" ? undefined : document;
}

/**
 * True when a translation engine has rewritten the document. Derived from DOM
 * markers only, never from visitor content.
 */
export function isTranslationActive(doc?: Document): boolean {
  const target = resolveDoc(doc);
  const html = target?.documentElement;
  if (!html) return false;

  if (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl")
  ) {
    return true;
  }

  const lang = html.getAttribute("lang");
  return typeof lang === "string" && lang.length > 0
    ? !lang.toLowerCase().startsWith("en")
    : false;
}

/** Pathname only. Query strings and hashes are dropped, never transmitted. */
export function normalizeRoute(route?: string): string {
  const raw =
    typeof route === "string" && route.length > 0
      ? route
      : typeof window === "undefined"
        ? ""
        : window.location.pathname;

  if (!raw) return "";

  const pathname = raw.split("#")[0].split("?")[0];
  return truncate(pathname, ERROR_MESSAGE_MAX_LENGTH);
}

function browserLanguage(): string {
  if (typeof navigator === "undefined") return "";
  const lang = navigator.language;
  return typeof lang === "string" && LANGUAGE_TAG_PATTERN.test(lang) ? lang : "";
}

/**
 * Build the exact payload `reportAppError` captures. Exported so boundaries and
 * tests can inspect what would be sent without emitting an event.
 *
 * `error_name` is sanitized as well as `error_message`. The design describes the
 * name as passed through, but a name is still attacker- or library-controlled
 * free text, and the privacy invariant outranks the extra fidelity.
 */
export function buildAppErrorPayload(
  error: unknown,
  context: AppErrorContext,
): AppErrorPayload {
  const source = (error ?? {}) as {
    name?: unknown;
    message?: unknown;
    digest?: unknown;
  };

  const name = sanitizeErrorMessage(source.name, ERROR_NAME_MAX_LENGTH);
  const digest = source.digest;

  const payload: AppErrorPayload = {
    error_name: name || "Error",
    error_message: sanitizeErrorMessage(source.message),
    route: normalizeRoute(context.route),
    boundary: context.boundary,
    translation_active: isTranslationActive(context.doc),
    browser_language: browserLanguage(),
  };

  if (typeof digest === "string" && DIGEST_PATTERN.test(digest)) {
    payload.error_digest = digest;
  }

  return payload;
}

/**
 * Capture a boundary-caught error as a sanitized `app_error` event.
 *
 * Never throws. Telemetry failing is not a reason for a recovery screen to fail.
 */
export function reportAppError(
  error: unknown,
  context: AppErrorContext,
): AppErrorPayload | undefined {
  const payload = buildAppErrorPayload(error, context);

  if (typeof window === "undefined") return payload;

  try {
    posthog.capture(APP_ERROR_EVENT, payload);
  } catch {
    // Swallow. A failed capture must not break the error boundary.
  }

  return payload;
}
