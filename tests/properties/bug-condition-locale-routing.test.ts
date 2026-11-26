/**
 * Property 1, Case C: locale-prefixed path routing.
 *
 * **Validates: Requirements 1.3, 2.3**
 *
 * Exercises the `src/proxy.ts` decision for unknown locale-prefixed paths.
 * Expected behaviour: the request falls through to the app's 404 without
 * `auth.protect()` being invoked. On unfixed code the default-protect matcher
 * calls `auth.protect()`, which is the sign-in redirect (307/302) visitors
 * report.
 *
 * jsdom cannot run real middleware, so this drives the middleware handler
 * directly with the real `createRouteMatcher` from Clerk and a recording
 * `auth` stub. The HTTP-status half of requirement 2.3 is checked against a
 * built app in the integration suite (task 3.8).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import fc from "fast-check";

const calls = vi.hoisted(() => ({ protect: 0 }));

vi.mock("@clerk/nextjs/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clerk/nextjs/server")>();
  return {
    ...actual,
    // Return the raw handler so the routing decision can be driven directly.
    clerkMiddleware: (handler: unknown) => handler,
  };
});

import proxy from "../../src/proxy";

type Decision = { protectCalled: boolean; result: unknown };

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

async function decide(pathname: string): Promise<Decision> {
  calls.protect = 0;
  const auth = Object.assign(async () => ({ userId: null }), {
    protect: async () => {
      calls.protect += 1;
      // Stand-in for the 307 to /sign-in that auth.protect() produces.
      return { redirectedTo: "/sign-in" };
    },
  });

  const handler = proxy as unknown as (
    auth: unknown,
    req: unknown,
  ) => Promise<unknown>;
  const result = await handler(auth, makeRequest(pathname));
  return { protectCalled: calls.protect > 0, result };
}

const LOCALE_PREFIXED_UNKNOWN_PATHS = ["/pt-br/", "/pt/pricing", "/es/docs"];

beforeEach(() => {
  calls.protect = 0;
});

describe("Case C: unknown locale-prefixed paths", () => {
  it("reach the app 404 instead of an auth.protect() sign-in redirect", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...LOCALE_PREFIXED_UNKNOWN_PATHS),
        async (pathname) => {
          const { protectCalled } = await decide(pathname);
          expect(
            protectCalled,
            `${pathname} was swept into auth.protect() and redirected to sign-in instead of returning the app 404`,
          ).toBe(false);
        },
      ),
      { numRuns: 9 },
    );
  });

  it("still protects known non-public routes", async () => {
    const { protectCalled } = await decide("/dashboard");
    expect(protectCalled).toBe(true);
  });

  it("still allows known public routes through", async () => {
    for (const pathname of ["/", "/pricing", "/docs", "/c2pa-scanner"]) {
      const { protectCalled } = await decide(pathname);
      expect(protectCalled, pathname).toBe(false);
    }
  });
});
