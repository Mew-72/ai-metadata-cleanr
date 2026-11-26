import posthog from "posthog-js";
import type { CaptureResult } from "posthog-js";
import {
  ERROR_MESSAGE_MAX_LENGTH,
  ERROR_NAME_MAX_LENGTH,
  sanitizeErrorMessage,
} from "@/lib/errorReporting";

/**
 * PostHog's auto-capture event for uncaught errors.
 *
 * `capture_exceptions: true` fires this independently of the app's error
 * boundaries, so it is the one error path the app does not author. It has to be
 * held to the same privacy standard as `reportAppError`.
 */
const EXCEPTION_EVENT = "$exception";

/**
 * Free-text fields PostHog puts on an `$exception` event. String fields carry a
 * single message, list fields carry one entry per chained cause.
 *
 * `$exception_message` / `$exception_type` are the flat pair. `$exception_values`
 * / `$exception_types` are their array counterparts. `$exception_list` is the
 * structured form actually built by the SDK today, an array of
 * `{ type, value, mechanism, stacktrace? }`. All five are handled so an SDK
 * upgrade that switches shapes cannot silently open the path back up.
 */
const MESSAGE_FIELDS = ["$exception_message"] as const;
const NAME_FIELDS = ["$exception_type"] as const;
const MESSAGE_LIST_FIELDS = ["$exception_values"] as const;
const NAME_LIST_FIELDS = ["$exception_types"] as const;

function sanitizeList(value: unknown, maxLength: number): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((entry) => sanitizeErrorMessage(entry, maxLength));
}

/**
 * Redact the message-bearing fields of an `$exception` event.
 *
 * Exported for unit and property tests. Registered as PostHog's `before_send`
 * hook below.
 *
 * Non-exception events are returned untouched, by identity, so autocapture,
 * pageviews, web vitals, and the app's own `app_error` event (already sanitized
 * at the source) flow through unchanged.
 *
 * Stack frames are left as the SDK produced them. They are bundle URLs with line
 * and column numbers, and running them through the message sanitizer would
 * redact every one of them as a path-like token, which would remove the only
 * debugging value the auto-capture path has.
 */
export function sanitizeExceptionEvent(
  event: CaptureResult | null,
): CaptureResult | null {
  if (!event || event.event !== EXCEPTION_EVENT) return event;

  try {
    const properties = { ...(event.properties ?? {}) };

    for (const field of MESSAGE_FIELDS) {
      if (field in properties) {
        properties[field] = sanitizeErrorMessage(
          properties[field],
          ERROR_MESSAGE_MAX_LENGTH,
        );
      }
    }

    for (const field of NAME_FIELDS) {
      if (field in properties) {
        properties[field] = sanitizeErrorMessage(
          properties[field],
          ERROR_NAME_MAX_LENGTH,
        );
      }
    }

    for (const field of MESSAGE_LIST_FIELDS) {
      if (field in properties) {
        properties[field] = sanitizeList(
          properties[field],
          ERROR_MESSAGE_MAX_LENGTH,
        );
      }
    }

    for (const field of NAME_LIST_FIELDS) {
      if (field in properties) {
        properties[field] = sanitizeList(
          properties[field],
          ERROR_NAME_MAX_LENGTH,
        );
      }
    }

    if (Array.isArray(properties.$exception_list)) {
      properties.$exception_list = properties.$exception_list.map((entry) => {
        if (!entry || typeof entry !== "object") return entry;
        const exception = entry as Record<string, unknown>;
        const next: Record<string, unknown> = { ...exception };

        if ("value" in exception) {
          next.value = sanitizeErrorMessage(
            exception.value,
            ERROR_MESSAGE_MAX_LENGTH,
          );
        }
        if ("type" in exception) {
          next.type = sanitizeErrorMessage(
            exception.type,
            ERROR_NAME_MAX_LENGTH,
          );
        }

        return next;
      });
    }

    return { ...event, properties };
  } catch {
    // Sanitization is the only thing standing between an unsanitized message and
    // the network, so a failure here drops the event rather than sending it.
    return null;
  }
}

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Route all traffic through our Next.js rewrite proxy at /ingest
    // This bypasses ad blockers since requests go to our own domain first,
    // then get proxied to PostHog's servers via next.config.ts rewrites:
    //   /ingest/static/* → https://us-assets.i.posthog.com/static/*
    //   /ingest/*        → https://us.i.posthog.com/*
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",

    // ── Event tracking ──────────────────────────────────────────────
    capture_pageview: false,   // We capture manually via PostHogPageView for SPA routing
    capture_pageleave: true,   // Track $pageleave for bounce rate & session duration
    capture_exceptions: true,  // Auto-capture JS errors

    // ── Performance ─────────────────────────────────────────────────
    capture_performance: {
      web_vitals: true,          // Track Core Web Vitals (LCP, INP, CLS)
      network_timing: true,     // Track network request timing
      web_vitals_allowed_metrics: ["CLS", "FCP", "INP", "LCP"],
    },

    // ── Privacy safeguards ──────────────────────────────────────────
    // NOTE: The privacy policy (scrubai.app/privacy) MUST disclose PostHog
    // usage, data types collected, and PostHog's data residency (US).
    // As a privacy-focused tool, this is a reputational requirement.
    mask_all_text: false,                  // Keep text visible for heatmaps
    mask_all_element_attributes: false,    // Keep attributes for heatmaps
    // Do NOT enable respect_dnt — we need event tracking and heatmaps

    // Backstop for the one error path the app does not author. Auto-captured
    // exception messages are third-party text and can echo a filename, a blob
    // URL, or an EXIF value, so they are redacted before they leave the browser.
    before_send: sanitizeExceptionEvent,

    // ── Storage & reliability ───────────────────────────────────────
    persistence: "localStorage+cookie",
    debug: false,

    // Gracefully handle network failures (offline, proxy cold-start, etc.)
    on_request_error: () => {
      // Silently swallow — the SDK will retry on the next event
    },
  });
}
