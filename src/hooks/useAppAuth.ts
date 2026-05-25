"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";

export function useAppAuth() {
  const clerkAuth = useClerkAuth();
  const clerkUser = useClerkUser();

  // Pro status is now determined by publicMetadata set after PayPal payment,
  // instead of Clerk Billing's has({ plan }) / has({ feature }) checks.
  const publicMeta = clerkUser.user?.publicMetadata as
    | { plan?: string }
    | undefined;
  const isPro = publicMeta?.plan === "pro";

  return {
    isSignedIn: clerkAuth.isSignedIn,
    userId: clerkAuth.userId,
    isPro,
    isLoaded: clerkAuth.isLoaded && clerkUser.isLoaded,
  };
}

export function useAppUser() {
  const clerkUser = useClerkUser();
  return {
    isSignedIn: clerkUser.isSignedIn,
    user: clerkUser.user,
    isLoaded: clerkUser.isLoaded,
  };
}
