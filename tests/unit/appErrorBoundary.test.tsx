/**
 * Unit tests for the route-level error boundary `src/app/error.tsx`.
 *
 * Covers the Fix Checking pseudocode for a client throw: the document is not
 * empty, it was rendered by the app, and it carries a working recovery
 * affordance. Telemetry is asserted through the real `errorReporting` module
 * with only the PostHog transport replaced.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { posthogMock } from "../support/appMocks";

vi.mock("posthog-js", () => posthogMock());

import posthog from "posthog-js";
import RouteError from "@/app/error";
import { APP_ERROR_EVENT } from "@/lib/errorReporting";

type Captured = { event: string; props?: Record<string, unknown> }[];
const captured = (posthog as unknown as { __captured: Captured }).__captured;

function boundaryError() {
  return Object.assign(new Error("heic2any decode failed"), {
    digest: "abc123",
  }) as Error & { digest?: string };
}

beforeEach(() => {
  captured.length = 0;
  document.documentElement.className = "";
  document.documentElement.setAttribute("lang", "en");
});

describe("app/error.tsx", () => {
  it("renders the shared ErrorFallback with a recovery affordance", () => {
    render(<RouteError error={boundaryError()} unstable_retry={() => {}} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /this page stopped loading/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("invokes the unstable_retry prop when the retry control is clicked", async () => {
    const retry = vi.fn();
    render(<RouteError error={boundaryError()} unstable_retry={retry} />);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("falls back to reset when only reset is supplied", async () => {
    const reset = vi.fn();
    render(<RouteError error={boundaryError()} reset={reset} />);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("reports the error once with boundary level route", () => {
    render(<RouteError error={boundaryError()} unstable_retry={() => {}} />);

    expect(captured).toHaveLength(1);
    expect(captured[0].event).toBe(APP_ERROR_EVENT);
    expect(captured[0].props?.boundary).toBe("route");
    expect(captured[0].props?.error_digest).toBe("abc123");
  });
});
