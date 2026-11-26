"use client";

import { useEffect } from "react";

import ErrorFallback from "@/components/ErrorFallback";
import { reportAppError } from "@/lib/errorReporting";

/**
 * Route-level error boundary.
 *
 * Wraps every segment below the root layout, so one file covers `/`,
 * `/pricing`, `/docs`, `/dashboard`, `/c2pa-scanner` and the rest. Without it
 * an uncaught client error unmounts the tree to an empty document and the
 * browser fills the void with its own localized "could not load" screen, which
 * is the reported symptom for non-English visitors.
 *
 * `unstable_retry` (Next 16.2.0) is preferred over `reset`: it re-fetches as
 * well as re-renders the boundary's children, which is the right recovery for a
 * translation-induced reconciliation failure. `reset` is accepted as a fallback
 * so the boundary still offers retry if only that prop is supplied.
 */
export default function Error({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    // Sanitized in `errorReporting`: no stack, no image-derived data.
    reportAppError(error, { boundary: "route" });
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <ErrorFallback
      title="This page stopped loading"
      description="Something went wrong while rendering this page. Trying again usually fixes it, and nothing you dropped here was uploaded."
      onRetry={retry ? () => retry() : undefined}
    />
  );
}
