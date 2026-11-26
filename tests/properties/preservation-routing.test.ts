/**
 * Property 2: Preservation - middleware decisions for known paths are
 * unchanged.
 *
 * **Validates: Requirements 3.4**
 *
 * The fix adds an `isKnownRoute` matcher to `src/proxy.ts` so unknown paths
 * fall through to the app 404 instead of being swept into `auth.protect()`.
 * The regression risk is obvious: an over-broad matcher that stops protecting
 * `/dashboard`, or one that starts gating a public route.
 *
 * So this records the decision the UNFIXED middleware makes for every public
 * route and for the protected routes the app actually serves, then asserts the
 * fixed middleware makes the same decision. Unknown paths are deliberately NOT
 * covered here - they are the bug condition, and task 1 owns them.
 *
 * jsdom cannot run real middleware, so the handler is driven directly with the
 * real `createRouteMatcher` and a recording `auth` stub, the same way the
 * task 1 routing test does. HTTP status codes are checked against a built app
 * in the integration suite.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import fc from "fast-check";

import { baselineFor } from "../support/baseline";

const calls = vi.hoisted(() => ({ protect: 0 }));

vi.mock("@clerk/nextjs/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clerk/nextjs/server")>();
  return {
    ...actual,
    clerkMiddleware: (handler: unknown) => handler,
  };
});

import proxy from "../../src/proxy";

/** Every path listed in `isPublicRoute`, in source order. */
const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
  "/cookies",
  "/refund",
  "/c2pa-scanner",
  "/about",
  "/docs",
  "/robots.txt",
  "/sitemap.xml",
  "/ingest",
  "/api/paypal/create-order",
];

/** Prefixes whose `(.*)` suffix means arbitrary subpaths are public too. */
const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
  "/cookies",
  "/refund",
  "/c2pa-scanner",
  "/about",
  "/docs",
  "/ingest",
];

/** Known routes the app serves that are NOT public and must stay protected. */
const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/dashboard/settings",
  "/thank-you",
  "/api/paypal/capture-order",
];

function makeRequest(pathname: string) {
  const url = new URL(`https://scrubai.app${pathname}`);
  return {
    url: url.toString(),
    nextUrl: url,
    headers: new Headers(),
    method: "GET",
    cookies: { get: () => undefined },
  };
}

async function protectCalledFor(pathname: string): Promise<boolean> {
  calls.protect = 0;
  const auth = Object.assign(async () => ({ userId: null }), {
    protect: async () => {
      calls.protect += 1;
      return { redirectedTo: "/sign-in" };
    },
  });
  const handler = proxy as unknown as (
    auth: unknown,
    req: unknown,
  ) => Promise<unknown>;
  await handler(auth, makeRequest(pathname));
  return calls.protect > 0;
}

beforeEach(() => {
  calls.protect = 0;
});

describe("Property 2: middleware decisions for known paths", () => {
  it("keeps every public route passing through without auth.protect()", async () => {
    for (const pathname of PUBLIC_PATHS) {
      const decision = await protectCalledFor(pathname);
      expect(decision, pathname).toEqual(
        baselineFor("routing", `public|${pathname}`, decision),
      );
      expect(decision, `${pathname} must stay public`).toBe(false);
    }
  });

  it("keeps generated public subpaths passing through", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PUBLIC_PREFIXES),
        fc.stringMatching(/^[a-z0-9-]{1,12}$/),
        async (prefix, segment) => {
          const pathname = `${prefix}/${segment}`;
          expect(
            await protectCalledFor(pathname),
            `${pathname} is a public subtree and must not be protected`,
          ).toBe(false);
        },
      ),
      { numRuns: 60 },
    );
  });

  it("keeps protecting the known non-public routes", async () => {
    for (const pathname of PROTECTED_PATHS) {
      const decision = await protectCalledFor(pathname);
      expect(decision, pathname).toEqual(
        baselineFor("routing", `protected|${pathname}`, decision),
      );
      expect(decision, `${pathname} must stay protected`).toBe(true);
    }
  });

  it("keeps the middleware matcher config unchanged", async () => {
    const { config } = (await import("../../src/proxy")) as unknown as {
      config: { matcher: string[] };
    };
    expect(config.matcher).toEqual(
      baselineFor("routing", "config.matcher", config.matcher),
    );
  });
});
