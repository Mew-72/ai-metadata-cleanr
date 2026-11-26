/**
 * Property 5, applied to the auto-capture path: PostHog's own `$exception`
 * events carry no image-derived data.
 *
 * The boundary path is covered by `privacy-error-telemetry.test.ts`. This file
 * covers the path the app does not author. `capture_exceptions: true` builds the
 * event from whatever text the browser, `heic2any`, `exifreader`, or the canvas
 * APIs put in the error, and PostHog has shipped several shapes for those
 * fields, so the property is asserted across every message carrier and every
 * field shape at once.
 *
 * **Validates: Requirements 2.5, 3.2**
 */
import { describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { posthogMock } from "../support/appMocks";

vi.mock("posthog-js", () => posthogMock());

import type { CaptureResult } from "posthog-js";
import { sanitizeExceptionEvent } from "../../instrumentation-client";
import {
  ERROR_MESSAGE_MAX_LENGTH,
  ERROR_NAME_MAX_LENGTH,
} from "@/lib/errorReporting";

/** An image-derived token that must never be transmitted. */
const secret = fc
  .stringMatching(/^[A-Za-z0-9]{8,24}$/)
  .filter((s) => s.length >= 8);

/** The carriers real errors use to smuggle image-derived text. */
const carriers: ((token: string) => string)[] = [
  (t) => `blob:http://localhost:3000/${t}`,
  (t) => `data:image/jpeg;base64,${t}`,
  (t) => `${t}.jpg`,
  (t) => `${t}.HEIC`,
  (t) => `/home/${t}/dcim/capture`,
  (t) => `C:\\Users\\${t}\\Pictures\\album`,
  (t) => `GPSLatitude: ${t}`,
  (t) => `DateTimeOriginal=${t}`,
  (t) => `LensModel: ${t}`,
];

const noise = fc.constantFrom(
  "Failed to execute 'removeChild' on 'Node'",
  "Uncaught TypeError",
  "decode failed",
  "The operation is insecure",
  "",
);

const exceptionType = fc.constantFrom(
  "Error",
  "TypeError",
  "NotFoundError",
  "InvalidStateError",
);

/**
 * The field shapes PostHog has used for `$exception`. Each generated event puts
 * the tainted message in one of them, so a shape change in the SDK is a test
 * failure rather than a silent leak.
 */
type Shape = "flat" | "list" | "legacy_arrays" | "all";

const shape = fc.constantFrom<Shape>("flat", "list", "legacy_arrays", "all");

const generatedException = fc
  .record({
    token: secret,
    carrierIndexes: fc.array(fc.nat(carriers.length - 1), {
      minLength: 1,
      maxLength: 4,
    }),
    prefix: noise,
    suffix: noise,
    type: exceptionType,
    typeCarrier: fc.option(fc.nat(carriers.length - 1), { nil: undefined }),
    shape,
    handled: fc.boolean(),
  })
  .map((spec) => {
    const message = [
      spec.prefix,
      ...spec.carrierIndexes.map((i) => carriers[i](spec.token)),
      spec.suffix,
    ]
      .filter(Boolean)
      .join(" ");

    const type =
      spec.typeCarrier === undefined
        ? spec.type
        : `${spec.type}: ${carriers[spec.typeCarrier](spec.token)}`;

    const properties: Record<string, unknown> = { $exception_level: "error" };

    if (spec.shape === "flat" || spec.shape === "all") {
      properties.$exception_message = message;
      properties.$exception_type = type;
    }
    if (spec.shape === "list" || spec.shape === "all") {
      properties.$exception_list = [
        {
          type,
          value: message,
          mechanism: { type: "onerror", handled: spec.handled },
          stacktrace: {
            type: "raw",
            frames: [
              {
                filename: "http://localhost:3000/_next/static/chunks/main-app.js",
                function: "handleChange",
                lineno: 1,
                colno: 2,
                in_app: true,
              },
            ],
          },
        },
      ];
    }
    if (spec.shape === "legacy_arrays" || spec.shape === "all") {
      properties.$exception_values = [message];
      properties.$exception_types = [type];
    }

    const event = {
      uuid: "01234567-89ab-cdef-0123-456789abcdef",
      event: "$exception",
      properties,
    } as CaptureResult;

    return { event, token: spec.token };
  });

/** Collect every string reachable from the sanitized event. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) strings(v, out);
  return out;
}

describe("Property 5: auto-captured exceptions carry no image-derived data", () => {
  it("never lets an image-derived token survive before_send, whatever field it arrives in", () => {
    fc.assert(
      fc.property(generatedException, ({ event, token }) => {
        const result = sanitizeExceptionEvent(event);
        expect(result).not.toBeNull();

        const serialized = JSON.stringify(result!.properties);
        expect(serialized.includes(token)).toBe(false);
        expect(serialized.toLowerCase().includes(token.toLowerCase())).toBe(
          false,
        );
        expect(serialized).not.toContain("blob:");
        expect(serialized).not.toContain("data:image");
      }),
      { numRuns: 400 },
    );
  });

  it("holds every sanitized message field to its length cap", () => {
    fc.assert(
      fc.property(generatedException, ({ event }) => {
        const props = sanitizeExceptionEvent(event)!.properties;

        const messages: unknown[] = [
          props.$exception_message,
          ...((props.$exception_values as unknown[]) ?? []),
          ...(((props.$exception_list as Record<string, unknown>[]) ?? []).map(
            (e) => e.value,
          )),
        ];
        for (const m of messages) {
          if (typeof m === "string") {
            expect(m.length).toBeLessThanOrEqual(ERROR_MESSAGE_MAX_LENGTH);
          }
        }

        const names: unknown[] = [
          props.$exception_type,
          ...((props.$exception_types as unknown[]) ?? []),
          ...(((props.$exception_list as Record<string, unknown>[]) ?? []).map(
            (e) => e.type,
          )),
        ];
        for (const n of names) {
          if (typeof n === "string") {
            expect(n.length).toBeLessThanOrEqual(ERROR_NAME_MAX_LENGTH);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  it("adds no property key that was not already on the event", () => {
    fc.assert(
      fc.property(generatedException, ({ event }) => {
        const before = Object.keys(event.properties).sort();
        const after = Object.keys(
          sanitizeExceptionEvent(event)!.properties,
        ).sort();
        expect(after).toEqual(before);
      }),
      { numRuns: 100 },
    );
  });

  it("leaves events the app authored or PostHog owns untouched", () => {
    const otherEvent = fc.constantFrom(
      "app_error",
      "$pageview",
      "$pageleave",
      "$autocapture",
      "$web_vitals",
      "pricing_page_viewed",
    );

    fc.assert(
      fc.property(otherEvent, generatedException, (name, { event, token }) => {
        const passthrough = { ...event, event: name } as CaptureResult;
        const result = sanitizeExceptionEvent(passthrough);

        expect(result).toBe(passthrough);
        // Untouched means untouched: the tainted text is still there, because
        // these events are sanitized at their source, not here.
        expect(strings(result!.properties).join(" ")).toContain(token);
      }),
      { numRuns: 100 },
    );
  });
});
