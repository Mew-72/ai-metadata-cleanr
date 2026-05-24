"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { ClerkProvider, useUser } from "@clerk/nextjs";

function PostHogUserIdentifier() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    }
  }, [user, isLoaded]);

  return null;
}

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <PostHogUserIdentifier />
      {children}
    </>
  );

  if (hasClerkKey) {
    return (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
