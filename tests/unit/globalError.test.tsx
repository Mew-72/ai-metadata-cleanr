/**
 * Unit tests for the global error boundary.
 *
 * Two things matter here and neither is cosmetic. The boundary replaces the
 * root layout, so it has to emit a complete document on its own, and it does
 * not inherit the app's global styles, so it has to stay legible without them.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { posthogMock } from "../support/appMocks";

vi.mock("posthog-js", () => posthogMock());

import GlobalError from "@/app/global-error";

const error = Object.assign(new Error("boom"), { digest: "abc123" });

describe("global-error.tsx", () => {
  it("renders a complete document with <html lang=\"en\"> and <body>", () => {
    const markup = renderToStaticMarkup(<GlobalError error={error} />);

    expect(markup).toContain('<html lang="en"');
    expect(markup).toContain("<body");
    expect(markup).toContain("</body></html>");
    // Metadata exports are unsupported in a boundary, so the title is markup.
    expect(markup).toContain("<title>");
  });

  it("renders app-owned recovery content, not an empty document", () => {
    const markup = renderToStaticMarkup(<GlobalError error={error} />);

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('data-recovery="true"');
    expect(markup).toContain("Something went wrong");
    expect(markup).toContain('href="/"');
  });

  it("stays legible with only light-theme token defaults available", () => {
    const markup = renderToStaticMarkup(<GlobalError error={error} />);

    // Tokens first, literal light-theme values as the fallback, so stripping
    // the globals.css import cannot leave unstyled text on an unset canvas.
    expect(markup).toContain("background-color:var(--bg, #f7f8fa)");
    expect(markup).toContain("color:var(--ink, #0b1220)");
  });

  it("offers retry only when the boundary supplies one", async () => {
    const { unmount } = render(<GlobalError error={error} />);
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    unmount();

    const retry = vi.fn();
    render(<GlobalError error={error} unstable_retry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("reports the failure at the global boundary level", async () => {
    const posthog = (await import("posthog-js")).default as unknown as {
      __captured: { event: string; props?: Record<string, unknown> }[];
    };
    posthog.__captured.length = 0;

    render(<GlobalError error={error} />);

    const captured = posthog.__captured.filter((e) => e.event === "app_error");
    expect(captured).toHaveLength(1);
    expect(captured[0].props?.boundary).toBe("global");
  });
});
