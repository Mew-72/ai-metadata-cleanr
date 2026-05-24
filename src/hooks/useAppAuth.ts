"use client";

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";

export function useAppAuth() {
  const clerkAuth = useClerkAuth();
  return {
    isSignedIn: clerkAuth.isSignedIn,
    userId: clerkAuth.userId,
    has: clerkAuth.has,
    isLoaded: clerkAuth.isLoaded,
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
