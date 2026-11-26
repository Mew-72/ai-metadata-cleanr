/**
 * Property 5: Fix Checking - error telemetry carries no image-derived data.
 *
 * The generated input is the point here. Error text reaching a boundary is not
 * app-authored: `heic2any`, `exifreader`, the canvas APIs, and the browser
 * itself all interpolate filenames, object URLs, and metadata values into
 * messages. This property asserts that whatever carrier the image-derived token
 * arrives in, it never reaches the captured payload, and that the payload never
 * grows a key outside the allowed set.
 *
 * **Validates: Requirements 1.5, 2.5, 3.2**
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { posthogMock } from "../support/appMocks";

vi.mock("posthog-js", () => posthogMock());

import posthog from "posthog-js";
import {
  ALLOWED_ERROR_FIELDS,
  ERROR_MESSAGE_MAX_LENGTH,
  reportAppError,
} from "@/lib/errorReporting";

type Captured = { event: string; props?: Record<string, unknown> }[];
const captured = (posthog as unknown as { __captured: Captured }).__captured;

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
  "Minified React error #418",
  "decode failed",
  "The operation is insecure",
  "",
);

const errorName = fc.constantFrom(
  "Error",
  "TypeError",
  "NotFoundError",
  "InvalidStateError",
);

const generatedError = fc
  .record({
    token: secret,
    carrierIndexes: fc.array(fc.nat(carriers.length - 1), {
      minLength: 1,
      maxLength: 4,
    }),
    prefix: noise,
    suffix: noise,
    name: errorName,
    nameCarrier: fc.option(fc.nat(carriers.length - 1), { nil: undefined }),
    digest: fc.option(fc.stringMatching(/^[a-f0-9]{8,32}$/), { nil: undefined }),
    boundary: fc.constantFrom("route" as const, "global" as const),
    route: fc.constantFrom("/", "/pricing", "/docs", "/dashboard", "/c2pa-scanner"),
  })
  .map((spec) => {
    const parts = spec.carrierIndexes.map((i) => carriers[i](spec.token));
    const message = [spec.prefix, ...parts, spec.suffix]
      .filter(Boolean)
      .join(" ");
    const name =
      spec.nameCarrier === undefined
        ? spec.name
        : `${spec.name}: ${carriers[spec.nameCarrier](spec.token)}`;

    const error = Object.assign(new Error(message), { name });
    if (spec.digest) Object.assign(error, { digest: spec.digest });

    return {
      error,
      token: spec.token,
      boundary: spec.boundary,
      route: spec.route,
    };
  });

beforeEach(() => {
  captured.length = 0;
  document.documentElement.className = "";
  document.documentElement.setAttribute("lang", "en");
});

describe("Property 5: error telemetry carries no image-derived data", () => {
  it("never transmits an image-derived token and never adds a key outside the allowed set", () => {
    fc.assert(
      fc.property(generatedError, ({ error, token, boundary, route }) => {
        captured.length = 0;

        reportAppError(error, { boundary, route, doc: document });

        expect(captured).toHaveLength(1);
        const props = captured[0].props as Record<string, unknown>;

        for (const key of Object.keys(props)) {
          expect(ALLOWED_ERROR_FIELDS as readonly string[]).toContain(key);
        }

        const serialized = JSON.stringify(props);
        expect(serialized.includes(token)).toBe(false);
        expect(serialized.toLowerCase().includes(token.toLowerCase())).toBe(false);

        expect(String(props.error_message).length).toBeLessThanOrEqual(
          ERROR_MESSAGE_MAX_LENGTH,
        );
        expect(props.route).toBe(route);
        expect(props.boundary).toBe(boundary);
      }),
      { numRuns: 400 },
    );
  });

  it("never transmits a stack trace", () => {
    fc.assert(
      fc.property(generatedError, ({ error, boundary, route }) => {
        captured.length = 0;
        reportAppError(error, { boundary, route, doc: document });

        const serialized = JSON.stringify(captured[0].props);
        expect(serialized).not.toContain("at Object.");
        expect(serialized).not.toContain(".test.ts");
      }),
      { numRuns: 100 },
    );
  });
});
