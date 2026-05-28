"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from "@clerk/nextjs";

export function useAppAuth() {
  const clerkAuth = useClerkAuth();
  const clerkUser = useClerkUser();

  // Pro status is determined by publicMetadata set after PayPal payment,
  // instead of Clerk Billing's has({ plan }) / has({ feature }) checks.
  const publicMeta = clerkUser.user?.publicMetadata as
    | { plan?: string }
    | undefined;
  const isPro = publicMeta?.plan === "pro";

  /**
   * Force-refresh the Clerk user object so callers can detect a recently
   * applied upgrade (e.g. PayPal capture finished in another tab) without
   * needing a full page reload. Safe to call repeatedly — Clerk dedupes
   * in-flight reload requests internally.
   */
  const refreshAuth = useCallback(async () => {
    if (clerkUser.user) {
      try {
        await clerkUser.user.reload();
      } catch (err) {
        console.warn("[useAppAuth] Clerk user.reload() failed:", err);
      }
    }
  }, [clerkUser.user]);

  return {
    isSignedIn: clerkAuth.isSignedIn,
    userId: clerkAuth.userId,
    isPro,
    isLoaded: clerkAuth.isLoaded && clerkUser.isLoaded,
    refreshAuth,
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

/**
 * Watches for an upgrade event happening outside the current tab — e.g.
 * a user finishes PayPal checkout in `/pricing`, returns to the workspace,
 * and we want their queue to switch to Pro entitlements without losing
 * the in-progress files.
 *
 * Strategy:
 *   - When the tab becomes visible, ask Clerk to reload the user.
 *   - When the BroadcastChannel `scrubai-auth` posts an upgrade event,
 *     also reload.
 *   - When the user is signed-in but not Pro and the caller opts in via
 *     `enabled`, poll once every 30s as a safety net.
 *
 * Returns the latest `isPro` value (so callers can re-render).
 */
export function useUpgradeWatcher(enabled: boolean = true) {
  const { isPro, isSignedIn, refreshAuth } = useAppAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !isSignedIn || isPro) return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshAuth();
    };

    document.addEventListener("visibilitychange", onVisibility);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("scrubai-auth");
      bc.onmessage = (e) => {
        if (e?.data?.type === "upgrade") refreshAuth();
      };
    } catch {
      // BroadcastChannel unsupported — visibility listener is enough.
    }

    intervalRef.current = setInterval(() => {
      refreshAuth();
    }, 30_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (bc) bc.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, isSignedIn, isPro, refreshAuth]);

  return { isPro };
}
