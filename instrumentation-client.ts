import posthog from "posthog-js";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Route all traffic through our Next.js rewrite proxy at /ingest
    // This bypasses ad blockers since requests go to our own domain first,
    // then get proxied to PostHog's servers via next.config.ts rewrites:
    //   /ingest/static/* → https://us-assets.i.posthog.com/static/*
    //   /ingest/*        → https://us.i.posthog.com/*
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",

    // ── Event tracking ──────────────────────────────────────────────
    capture_pageview: false,   // We capture manually via PostHogPageView for SPA routing
    capture_pageleave: true,   // Track $pageleave for bounce rate & session duration
    capture_exceptions: true,  // Auto-capture JS errors

    // ── Performance ─────────────────────────────────────────────────
    capture_performance: {
      web_vitals: true,          // Track Core Web Vitals (LCP, INP, CLS)
      network_timing: true,     // Track network request timing
      web_vitals_allowed_metrics: ["CLS", "FCP", "INP", "LCP"],
    },

    // ── Privacy safeguards ──────────────────────────────────────────
    // NOTE: The privacy policy (scrubai.app/privacy) MUST disclose PostHog
    // usage, data types collected, and PostHog's data residency (US).
    // As a privacy-focused tool, this is a reputational requirement.
    mask_all_text: false,                  // Keep text visible for heatmaps
    mask_all_element_attributes: false,    // Keep attributes for heatmaps
    // Do NOT enable respect_dnt — we need event tracking and heatmaps

    // ── Storage & reliability ───────────────────────────────────────
    persistence: "localStorage+cookie",
    debug: false,

    // Gracefully handle network failures (offline, proxy cold-start, etc.)
    on_request_error: () => {
      // Silently swallow — the SDK will retry on the next event
    },
  });
}
