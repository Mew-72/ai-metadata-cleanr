/**
 * Unit coverage for the error telemetry sanitizer and capture.
 *
 * The privacy invariant under test: nothing image-derived can reach PostHog.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { posthogMock } from "../support/appMocks";

vi.mock("posthog-js", () => posthogMock());

import posthog from "posthog-js";
import {
  ALLOWED_ERROR_FIELDS,
  APP_ERROR_EVENT,
  ERROR_MESSAGE_MAX_LENGTH,
  buildAppErrorPayload,
  isTranslationActive,
  normalizeRoute,
  reportAppError,
  sanitizeErrorMessage,
} from "@/lib/errorReporting";

type Captured = { event: string; props?: Record<string, unknown> }[];
const captured = (posthog as unknown as { __captured: Captured }).__captured;

beforeEach(() => {
  captured.length = 0;
  document.documentElement.className = "";
  document.documentElement.setAttribute("lang", "en");
});

describe("sanitizeErrorMessage", () => {
  it("strips blob: URLs", () => {
    const out = sanitizeErrorMessage(
      "Failed to decode blob:http://localhost:3000/8f4c-11ee-secret",
    );
    expect(out).not.toContain("blob:");
    expect(out).not.toContain("8f4c-11ee-secret");
    expect(out).toContain("[redacted-url]");
  });

  it("strips data: URLs including their payload", () => {
    const out = sanitizeErrorMessage(
      "bad source data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ",
    );
    expect(out).not.toContain("data:");
    expect(out).not.toContain("9j/4AAQSkZJRgABAQAAAQ");
  });

  it("strips image filenames with extensions", () => {
    const out = sanitizeErrorMessage("could not read holiday-beach-2019.HEIC");
    expect(out).not.toContain("holiday-beach-2019");
    expect(out).not.toContain("HEIC");
    expect(out).toContain("[redacted-file]");
  });

  it("collapses path-like tokens", () => {
    const out = sanitizeErrorMessage(
      "read failed at C:\\Users\\marina\\Pictures\\private and /home/marina/dcim/set",
    );
    expect(out).not.toContain("marina");
    expect(out).not.toContain("Pictures");
    expect(out).toContain("[redacted-path]");
  });

  it("redacts EXIF style key and value pairs and dimensions", () => {
    const out = sanitizeErrorMessage(
      "GPSLatitude: 37.7749 Model=NIKON_D850 at 6048x4024",
    );
    expect(out).not.toContain("37.7749");
    expect(out).not.toContain("NIKON_D850");
    expect(out).not.toContain("6048x4024");
  });

  it("truncates to the length cap", () => {
    const out = sanitizeErrorMessage("x".repeat(5000));
    expect(out.length).toBe(ERROR_MESSAGE_MAX_LENGTH);
    expect(out.endsWith("...")).toBe(true);
  });

  it("returns an empty string for non-string input", () => {
    expect(sanitizeErrorMessage(undefined)).toBe("");
    expect(sanitizeErrorMessage({ message: "nope" })).toBe("");
  });

  it("leaves plain diagnostic text readable", () => {
    expect(
      sanitizeErrorMessage(
        "Failed to execute 'removeChild' on 'Node': node is not a child",
      ),
    ).toContain("removeChild");
  });
});

describe("normalizeRoute", () => {
  it("keeps the pathname and drops query and hash", () => {
    expect(normalizeRoute("/pricing?utm_source=x#plans")).toBe("/pricing");
  });
});

describe("isTranslationActive", () => {
  it("detects the translation engine class markers", () => {
    expect(isTranslationActive(document)).toBe(false);
    document.documentElement.classList.add("translated-ltr");
    expect(isTranslationActive(document)).toBe(true);
  });

  it("detects a lang attribute that no longer reads en", () => {
    document.documentElement.setAttribute("lang", "pt-BR");
    expect(isTranslationActive(document)).toBe(true);
  });
});

describe("reportAppError", () => {
  it("emits exactly the allowed field set for the route boundary", () => {
    const error = Object.assign(new Error("boom at /a/b/c/photo.jpg"), {
      digest: "1a2b3c4d",
    });

    reportAppError(error, { boundary: "route", route: "/pricing?q=1" });

    expect(captured).toHaveLength(1);
    expect(captured[0].event).toBe(APP_ERROR_EVENT);

    const props = captured[0].props as Record<string, unknown>;
    for (const key of Object.keys(props)) {
      expect(ALLOWED_ERROR_FIELDS as readonly string[]).toContain(key);
    }
    expect(Object.keys(props).sort()).toEqual(
      [...ALLOWED_ERROR_FIELDS].sort(),
    );
    expect(props.boundary).toBe("route");
    expect(props.route).toBe("/pricing");
    expect(props.error_digest).toBe("1a2b3c4d");
    expect(String(props.error_message)).not.toContain("photo.jpg");
  });

  it("emits the allowed field set for the global boundary and sends no stack", () => {
    reportAppError(new Error("root layout failed"), { boundary: "global" });

    const props = captured[0].props as Record<string, unknown>;
    for (const key of Object.keys(props)) {
      expect(ALLOWED_ERROR_FIELDS as readonly string[]).toContain(key);
    }
    expect(props).not.toHaveProperty("error_stack");
    expect(props).not.toHaveProperty("stack");
    expect(props.boundary).toBe("global");
  });

  it("drops a digest that is not an opaque token", () => {
    const payload = buildAppErrorPayload(
      Object.assign(new Error("x"), { digest: "/Users/marina/dcim/img.jpg" }),
      { boundary: "route", route: "/" },
    );
    expect(payload.error_digest).toBeUndefined();
  });
});
