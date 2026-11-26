/**
 * Property 3: Fix Checking - unknown locale-prefixed paths resolve to the
 * app's 404, and `auth.protect()` fires only for known non-public routes.
 *
 * **Validates: Requirements 1.3, 2.3, 3.4**
 *
 * Generated over three path families: valid routes, valid routes carrying a
 * language-tag prefix, and random unknown paths. The invariant is one
 * biconditional - protect is called if and only if the path is a known route
 * that is not public - so an over-broad `isKnownRoute` (unknown paths getting
 * protected again) and an under-broad one (`/dashboard` losing protection) both
 * fail here.
 *
 * jsdom cannot run real middleware, so the handler is driven directly with the
 * real `createRouteMatcher` and a recording `auth` stub. The HTTP-status half
 * of requirement 2.3 lives in the integration suite.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import fc from "fast-check";

const calls = vi.hoisted(() => ({ protect: 0 }));

vi.mock("@clerk/nextjs/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clerk/nextjs/server")>();
  return {
    ...actual,
    clerkMiddleware: (handler: unknown) => handler,
  };
});

import proxy from "../../src/proxy";

/** Known routes that are public: protect must never fire. */
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
  "/cookies",
  "/refund",
  "/c2pa-scanner",
  "/about",
  "/docs",
  "/docs/metadata-basics",
  "/sign-in",
  "/sign-up",
  "/robots.txt",
  "/sitemap.xml",
  "/api/paypal/create-order",
];

/** Known routes that are not public: protect must always fire. */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/",
  "/dashboard/settings",
  "/thank-you",
  "/api/paypal/capture-order",
];

/** Language tags a translated link or hreflang guess is likely to prepend. */
const LANGUAGE_TAGS = ["pt", "pt-br", "es", "de", "fr", "ja", "zh-cn"];

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

describe("Property 3: unknown paths never reach auth.protect()", () => {
  it("holds for known public routes", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...PUBLIC_ROUTES), async (pathname) => {
        expect(await protectCalledFor(pathname), pathname).toBe(false);
      }),
      { numRuns: 48 },
    );
  });

  it("holds for known non-public routes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...PROTECTED_ROUTES),
        async (pathname) => {
          expect(await protectCalledFor(pathname), pathname).toBe(true);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("holds for valid routes carrying a language-tag prefix", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...LANGUAGE_TAGS),
        fc.constantFrom(...PUBLIC_ROUTES, ...PROTECTED_ROUTES),
        async (tag, route) => {
          const pathname = `/${tag}${route === "/" ? "/" : route}`;
          expect(
            await protectCalledFor(pathname),
            `${pathname} does not exist and must fall through to the 404`,
          ).toBe(false);
        },
      ),
      { numRuns: 120 },
    );
  });

  it("holds for random unknown paths", async () => {
    const knownPrefixes = [
      "sign-in",
      "sign-up",
      "pricing",
      "privacy",
      "terms",
      "security",
      "cookies",
      "refund",
      "c2pa-scanner",
      "about",
      "docs",
      "ingest",
      "dashboard",
      "thank-you",
      "api",
      "__clerk",
      "robots.txt",
      "sitemap.xml",
    ];
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(fc.stringMatching(/^[a-z0-9-]{1,10}$/), {
            minLength: 1,
            maxLength: 3,
          })
          .filter((segments) => !knownPrefixes.includes(segments[0])),
        async (segments) => {
          const pathname = `/${segments.join("/")}`;
          expect(
            await protectCalledFor(pathname),
            `${pathname} does not exist and must fall through to the 404`,
          ).toBe(false);
        },
      ),
      { numRuns: 150 },
    );
  });
});
