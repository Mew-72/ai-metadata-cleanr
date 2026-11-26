"use client";

/**
 * Global error boundary: the last resort.
 *
 * This file replaces the root layout when it renders, which drives every
 * decision below:
 *
 * - It owns the whole document, so it renders its own `<html lang="en">` and
 *   `<body>`. `lang` stays `en` because the content served here is English.
 * - It does not inherit the app's global styles, so `./globals.css` is
 *   imported explicitly. The inline `var(--token, #fallback)` styles keep the
 *   screen legible even if that import is ever stripped or the stylesheet is
 *   the thing that failed.
 * - `next/font` is not available here, so the type stack falls back to the
 *   system sans font rather than Geist.
 * - The app's `data-theme` attribute is never applied at this level, so this
 *   screen renders the light token defaults and offers no theme toggle. That
 *   is an accepted limitation, documented in the design.
 * - Metadata exports are not supported in an error boundary, so the document
 *   title is set with the React `<title>` component.
 */

import { useEffect, type CSSProperties } from "react";

import "./globals.css";
import ErrorFallback from "@/components/ErrorFallback";
import { reportAppError } from "@/lib/errorReporting";

const TITLE = "Something went wrong - ScrubAI";

const DESCRIPTION =
  "ScrubAI could not finish loading this page. Reloading usually fixes it. " +
  "Your images never left your device.";

/**
 * Token-first colors with literal fallbacks. The tokens come from
 * `globals.css`; the literals are what keeps this readable without it.
 */
const documentStyle: CSSProperties = {
  backgroundColor: "var(--bg, #f7f8fa)",
  color: "var(--ink, #0b1220)",
  fontFamily:
    'var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif)',
};

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    reportAppError(error, { boundary: "global" });
  }, [error]);

  return (
    <html lang="en" style={documentStyle}>
      <body style={documentStyle}>
        <title>{TITLE}</title>
        <ErrorFallback
          title="Something went wrong"
          description={DESCRIPTION}
          onRetry={unstable_retry}
        />
      </body>
    </html>
  );
}
