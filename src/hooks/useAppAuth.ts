"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";

const hasClerkKey = false;

export function useAppAuth() {
  if (hasClerkKey) {
    try {
      const clerkAuth = useClerkAuth();
      return {
        isSignedIn: clerkAuth.isSignedIn,
        userId: clerkAuth.userId,
        has: clerkAuth.has,
        isLoaded: clerkAuth.isLoaded,
      };
    } catch (e) {
      console.warn("Clerk Auth failed to load, falling back to simulated MVP session:", e);
    }
  }

  // Simulated / Mock Authentication for MVP
  return {
    isSignedIn: true,
    userId: "mock_user_123",
    has: () => true, // Treat as Pro for smooth batch cleaning testing!
    isLoaded: true,
  };
}

export function useAppUser() {
  if (hasClerkKey) {
    try {
      const clerkUser = useClerkUser();
      return {
        isSignedIn: clerkUser.isSignedIn,
        user: clerkUser.user,
        isLoaded: clerkUser.isLoaded,
      };
    } catch (e) {
      console.warn("Clerk User hook failed to load, falling back to simulated MVP user details:", e);
    }
  }

  // Simulated / Mock User for MVP
  return {
    isSignedIn: true,
    user: {
      id: "mock_user_123",
      primaryEmailAddress: { emailAddress: "mvp-test@scrubai.com" },
      publicMetadata: { tier: "pro", role: "pro" }, // Defaults to Pro tier in MVP mode
    },
    isLoaded: true,
  };
}
