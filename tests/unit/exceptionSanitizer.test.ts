/**
 * Unit tests for the `before_send` backstop in `instrumentation-client.ts`.
 *
 * `capture_exceptions: true` auto-captures uncaught errors without going through
 * any app code, so the sanitizer is the only thing between a third-party error
 * message and the network. These tests pin both halves of the contract: an
 * `$exception` event is redacted, and everything else is left alone.
 *
 * **Validates: Requirements 2.5, 3.2**
 */
import { describe, expect, it, vi } from "vitest";
import type { CaptureResult } from "posthog-js";

const hoisted = vi.hoisted(() => ({
  initCalls: [] as { key: string; opts: Record<string, unknown> }[],
}));

vi.mock("posthog-js", async () => {
  const { posthogMock } = await import("../support/appMocks");
  const api = posthogMock().default as unknown as Record<string, unknown>;
  api.init = (key: string, opts: Record<string, unknown>) => {
    hoisted.initCalls.push({ key, opts });
  };
  return { ...api, default: api };
});

import { sanitizeExceptionEvent } from "../../instrumentation-client";
import {
  ERROR_MESSAGE_MAX_LENGTH,
  ERROR_NAME_MAX_LENGTH,
} from "@/lib/errorReporting";

function event(
  name: string,
  properties: Record<string, unknown>,
): CaptureResult {
  return {
    uuid: "01234567-89ab-cdef-0123-456789abcdef",
    event: name,
    properties,
  } as CaptureResult;
}

describe("sanitizeExceptionEvent", () => {
  it("redacts a blob URL and an image filename from an $exception event", () => {
    const result = sanitizeExceptionEvent(
      event("$exception", {
        $exception_message:
          "decode failed for blob:http://localhost:3000/a1b2c3d4-secret while reading holiday-beach.HEIC",
        $exception_list: [
          {
            type: "TypeError",
            value:
              "createImageBitmap: blob:http://localhost:3000/a1b2c3d4-secret (holiday-beach.HEIC)",
            mechanism: { type: "onerror", handled: false },
          },
        ],
      }),
    );

    const serialized = JSON.stringify(result?.properties);
    expect(serialized).not.toContain("blob:");
    expect(serialized).not.toContain("a1b2c3d4-secret");
    expect(serialized).not.toContain("holiday-beach");
    expect(serialized).not.toContain("HEIC");
    expect(serialized).toContain("[redacted-url]");
    expect(serialized).toContain("[redacted-file]");

    // The non-message parts of the entry survive, so grouping still works.
    const list = result?.properties.$exception_list as Record<string, unknown>[];
    expect(list[0].type).toBe("TypeError");
    expect(list[0].mechanism).toEqual({ type: "onerror", handled: false });
  });

  it("redacts EXIF values, paths, and dimensions from the legacy list fields", () => {
    const result = sanitizeExceptionEvent(
      event("$exception", {
        $exception_values: [
          "GPSLatitude: 51.5074",
          "C:\\Users\\mayan\\Pictures\\album\\shot.jpg failed at 4032x3024",
        ],
        $exception_types: ["NotFoundError"],
      }),
    );

    const values = result?.properties.$exception_values as string[];
    expect(values[0]).not.toContain("51.5074");
    expect(values[1]).not.toContain("mayan");
    expect(values[1]).not.toContain("4032x3024");
    expect(result?.properties.$exception_types).toEqual(["NotFoundError"]);
  });

  it("truncates the message to the message cap and the type to the name cap", () => {
    const result = sanitizeExceptionEvent(
      event("$exception", {
        $exception_message: "e".repeat(ERROR_MESSAGE_MAX_LENGTH + 500),
        $exception_type: "T".repeat(ERROR_NAME_MAX_LENGTH + 200),
      }),
    );

    expect(String(result?.properties.$exception_message).length).toBe(
      ERROR_MESSAGE_MAX_LENGTH,
    );
    expect(String(result?.properties.$exception_type).length).toBe(
      ERROR_NAME_MAX_LENGTH,
    );
  });

  it("leaves stack frames as the SDK produced them", () => {
    const stacktrace = {
      type: "raw",
      frames: [
        {
          filename: "http://localhost:3000/_next/static/chunks/main-app.js",
          function: "onClick",
          lineno: 12,
          colno: 34,
          in_app: true,
        },
      ],
    };

    const result = sanitizeExceptionEvent(
      event("$exception", {
        $exception_list: [{ type: "Error", value: "boom", stacktrace }],
      }),
    );

    const list = result?.properties.$exception_list as Record<string, unknown>[];
    expect(list[0].stacktrace).toEqual(stacktrace);
  });

  it("passes a non-exception event through unmodified", () => {
    const original = event("app_error", {
      error_name: "NotFoundError",
      error_message: "Failed to execute 'removeChild' on 'Node'",
      route: "/pricing",
    });

    expect(sanitizeExceptionEvent(original)).toBe(original);
  });

  it("passes an autocapture event with a path-like property through unmodified", () => {
    const original = event("$autocapture", {
      $current_url: "http://localhost:3000/docs/what-is-exif",
      $event_type: "click",
    });

    const result = sanitizeExceptionEvent(original);
    expect(result).toBe(original);
    expect(result?.properties.$current_url).toBe(
      "http://localhost:3000/docs/what-is-exif",
    );
  });

  it("passes a null event through as null", () => {
    expect(sanitizeExceptionEvent(null)).toBeNull();
  });

  it("does not mutate the event it was given", () => {
    const original = event("$exception", {
      $exception_message: "failed on holiday-beach.jpg",
    });

    sanitizeExceptionEvent(original);

    expect(original.properties.$exception_message).toBe(
      "failed on holiday-beach.jpg",
    );
  });

  it("tolerates an $exception event with no message fields at all", () => {
    const result = sanitizeExceptionEvent(
      event("$exception", { $exception_level: "error" }),
    );
    expect(result?.properties).toEqual({ $exception_level: "error" });
  });
});

describe("instrumentation-client wiring", () => {
  it("registers the sanitizer as the PostHog before_send hook", async () => {
    hoisted.initCalls.length = 0;
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    vi.resetModules();

    try {
      const mod = await import("../../instrumentation-client");

      expect(hoisted.initCalls).toHaveLength(1);
      const opts = hoisted.initCalls[0].opts;
      expect(opts.before_send).toBe(mod.sanitizeExceptionEvent);

      // Every other init option stays exactly as it was.
      expect(opts.api_host).toBe("/ingest");
      expect(opts.capture_exceptions).toBe(true);
      expect(opts.capture_pageview).toBe(false);
      expect(opts.capture_pageleave).toBe(true);
      expect(opts.persistence).toBe("localStorage+cookie");
      expect(typeof opts.on_request_error).toBe("function");
      expect(opts.capture_performance).toEqual({
        web_vitals: true,
        network_timing: true,
        web_vitals_allowed_metrics: ["CLS", "FCP", "INP", "LCP"],
      });
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
