"use client";

import React from "react";
import Link from "next/link";
import { TriangleAlert, RotateCw, House } from "lucide-react";

export interface ErrorFallbackProps {
  /** Short headline for the failure state. */
  title: string;
  /** One or two plain sentences explaining what happened and what to try. */
  description: string;
  /** When supplied, a retry control is rendered and wired to this callback. */
  onRetry?: () => void;
}

/**
 * Shared recovery screen for the route error boundary, the global error
 * boundary, and the app 404.
 *
 * Presentational only: no telemetry, no browser APIs beyond the click
 * handler the caller supplies. Colors come from the Tailwind v4 tokens in
 * `src/app/globals.css`, so this stays legible in both themes.
 */
export function ErrorFallback({ title, description, onRetry }: ErrorFallbackProps) {
  return (
    <main className="bg-bg text-ink flex min-h-[70vh] w-full items-center justify-center px-4 py-16 sm:px-6">
      <div
        role="alert"
        className="border-muted-border bg-surface w-full max-w-md rounded-2xl border p-8 text-center shadow-sm sm:p-10"
      >
        <span
          aria-hidden="true"
          className="bg-accent-soft text-accent mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        >
          <TriangleAlert size={22} strokeWidth={2} />
        </span>

        <h1 className="font-sans mt-6 text-[20px] font-semibold tracking-tight">
          {title}
        </h1>

        <p className="font-sans text-n500 mt-3 text-[14px] leading-relaxed">
          {description}
        </p>

        <p className="font-sans text-n600 mt-4 text-[13px] leading-relaxed">
          If your browser is translating this page, viewing the original English
          version can help. Your images stay on your device either way.
        </p>

        <div
          data-recovery="true"
          className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
        >
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="bg-accent hover:bg-accent-strong focus-visible:outline-accent font-sans inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <RotateCw size={15} strokeWidth={2.2} aria-hidden="true" />
              Try again
            </button>
          ) : null}

          <Link
            href="/"
            className="border-muted-border text-ink hover:border-accent focus-visible:outline-accent font-sans inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[14px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <House size={15} strokeWidth={2.2} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ErrorFallback;
