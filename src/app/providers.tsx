"use client";

import React, { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

// Ensure PostHog is initialized on the client side immediately
import "../../instrumentation-client";

// 1. Clerk Identity Sync component
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

// 2. SPA Route Change / Pageview tracking component
function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== "undefined") {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      // Send standard $pageview event to PostHog
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}

// 3. Web Vitals performance tracking component
function PostHogWebVitals() {
  useReportWebVitals((metric) => {
    posthog.capture(metric.name, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      $current_url: typeof window !== "undefined" ? window.location.href : "",
    });
  });

  return null;
}

// 4. Scroll depth tracking component
function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const thresholds = [25, 50, 75, 100];
    const triggered = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Get maximum scrollable height
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percentage = Math.round((scrollTop / docHeight) * 100);

      for (const t of thresholds) {
        if (percentage >= t && !triggered.has(t)) {
          triggered.add(t);
          posthog.capture("scroll_depth", {
            depth_percentage: t,
            $current_url: window.location.href,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]); // Reset listener on route change

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogUserIdentifier />
      <PostHogPageView />
      <PostHogWebVitals />
      <ScrollDepthTracker />
      {children}
    </>
  );
}
