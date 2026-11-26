/**
 * Property 2: Preservation - Unaffected page loads behave identically.
 *
 * **Validates: Requirements 3.1, 3.6**
 *
 * Observation-first: rendered markup for `/`, `/pricing`, `/docs`,
 * `/dashboard` and `/c2pa-scanner` is recorded from the UNFIXED code across
 * the generated domain route x auth state x theme, with no translation
 * active. Later runs assert byte-equality against those recordings.
 *
 * Generated cases are the point. The regression this fix is most likely to
 * introduce is an over-broad translation marking that changes what English
 * visitors see, and that shows up as a markup diff on a combination nobody
 * would have enumerated by hand.
 *
 * Only third-party SDKs that need a live browser or network are stood in for
 * (Clerk session UI, PostHog transport, the PayPal script). Every ScrubAI
 * module renders for real.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import fc from "fast-check";

import { baselineFor, normalizeMarkup } from "../support/baseline";
import { resetTranslationMarkers } from "../support/simulateTranslation";

vi.mock("next/navigation", async () =>
  (await import("../support/appMocks")).nextNavigationMock(),
);
vi.mock("@clerk/nextjs", async () =>
  (await import("../support/appMocks")).clerkMock(),
);
vi.mock("posthog-js", async () =>
  (await import("../support/appMocks")).posthogMock(),
);
vi.mock("@paypal/react-paypal-js", async () =>
  (await import("../support/appMocks")).paypalMock(),
);

import { appState, resetAppState } from "../support/appMocks";
import Home from "../../src/app/page";
import PricingPage from "../../src/app/pricing/page";
import DocsIndexPage from "../../src/app/docs/page";
import DashboardPage from "../../src/app/dashboard/page";
import C2paScannerPage from "../../src/app/c2pa-scanner/page";

const PAGES: Record<string, React.ComponentType> = {
  "/": Home,
  "/pricing": PricingPage,
  "/docs": DocsIndexPage,
  "/dashboard": DashboardPage,
  "/c2pa-scanner": C2paScannerPage,
};

const ROUTES = Object.keys(PAGES);
const AUTH_STATES = [
  { signedIn: false, pro: false },
  { signedIn: true, pro: false },
  { signedIn: true, pro: true },
] as const;
const THEMES = ["light", "dark"] as const;

interface LoadCase {
  route: string;
  auth: (typeof AUTH_STATES)[number];
  theme: (typeof THEMES)[number];
}

const loadCase = fc.record({
  route: fc.constantFrom(...ROUTES),
  auth: fc.constantFrom(...AUTH_STATES),
  theme: fc.constantFrom(...THEMES),
});

function keyFor({ route, auth, theme }: LoadCase) {
  return `${route}|signedIn=${auth.signedIn}|pro=${auth.pro}|theme=${theme}`;
}

function renderCase(load: LoadCase): string {
  const { route, auth, theme } = load;
  appState.pathname = route;
  appState.signedIn = auth.signedIn;
  appState.pro = auth.pro;
  window.localStorage.setItem("scrubai-theme", theme);

  const Page = PAGES[route];
  let root: HTMLElement | null = null;
  // The outer act() flushes mount effects (theme read, scroll listener, auth
  // resolution) before the markup is read, so the baseline is the settled
  // render rather than the first commit.
  act(() => {
    root = render(<Page />).container;
  });
  return normalizeMarkup(root!.innerHTML);
}

beforeEach(() => {
  resetAppState();
  window.localStorage.clear();
  resetTranslationMarkers(document);
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
});

describe("Property 2: English page loads render identically", () => {
  it("matches the recorded baseline across route x auth state x theme", () => {
    fc.assert(
      fc.property(loadCase, (load) => {
        try {
          // The bug condition must NOT hold for these cases.
          expect(document.documentElement.getAttribute("lang")).toBe("en");
          expect(
            document.documentElement.classList.contains("translated-ltr"),
          ).toBe(false);

          const markup = renderCase(load);
          const key = keyFor(load);

          expect(markup.length, `${key} rendered nothing`).toBeGreaterThan(0);
          expect(markup, key).toEqual(baselineFor("render", key, markup));
        } finally {
          cleanup();
          window.localStorage.clear();
          document.documentElement.removeAttribute("data-theme");
        }
      }),
      { numRuns: 40 },
    );
  });

  it("renders every route x auth x theme combination at least once", () => {
    for (const route of ROUTES) {
      for (const auth of AUTH_STATES) {
        for (const theme of THEMES) {
          const load = { route, auth, theme };
          try {
            const markup = renderCase(load);
            const key = keyFor(load);
            expect(markup, key).toEqual(baselineFor("render", key, markup));
          } finally {
            cleanup();
            window.localStorage.clear();
            document.documentElement.removeAttribute("data-theme");
          }
        }
      }
    }
  });
});
