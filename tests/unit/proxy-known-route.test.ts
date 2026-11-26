/**
 * Unit tests for the `isKnownRoute` classification added to `src/proxy.ts`.
 *
 * **Validates: Requirements 1.3, 2.3, 3.4**
 *
 * One case per branch of the new decision order: public, known but protected,
 * and unknown. HTTP status codes are checked against a built app in the
 * integration suite - jsdom cannot run middleware.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const calls = vi.hoisted(() => ({ protect: 0 }));

vi.mock("@clerk/nextjs/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clerk/nextjs/server")>();
  return {
    ...actual,
    // Return the raw handler so the routing decision can be driven directly.
    clerkMiddleware: (handler: unknown) => handler,
  };
});

import proxy, { isKnownRoute } from "../../src/proxy";

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

describe("isKnownRoute", () => {
  it("classifies a public route as known", () => {
    expect(isKnownRoute(makeRequest("/pricing") as never)).toBe(true);
  });

  it("classifies a known-but-protected route as known", () => {
    expect(isKnownRoute(makeRequest("/dashboard") as never)).toBe(true);
  });

  it("classifies an unknown locale-prefixed path as unknown", () => {
    expect(isKnownRoute(makeRequest("/pt-br/pricing") as never)).toBe(false);
  });
});

describe("middleware decision order", () => {
  it("lets a public route through without auth.protect()", async () => {
    expect(await protectCalledFor("/pricing")).toBe(false);
  });

  it("protects a known non-public route", async () => {
    expect(await protectCalledFor("/dashboard")).toBe(true);
  });

  it("lets an unknown path fall through to the 404 without auth.protect()", async () => {
    expect(await protectCalledFor("/pt-br/pricing")).toBe(false);
  });
});
