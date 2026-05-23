"use client";

import React from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ClerkProvider } from "@clerk/nextjs";

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (posthogKey && !posthogKey.includes("placeholder")) {
    posthog.init(posthogKey, {
      api_host: posthogHost || "/ingest",
      person_profiles: "identified_only",
      capture_pageview: false, // We will handle tracking or let user track custom events
    });
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const posthogProvider = (
    <PostHogProvider client={posthog}>{children}</PostHogProvider>
  );

  const hasClerkKey = false;

  if (hasClerkKey) {
    return (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        {posthogProvider}
      </ClerkProvider>
    );
  }

  return posthogProvider;
}
