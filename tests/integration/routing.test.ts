/**
 * Integration check for the `isKnownRoute` middleware change (task 3.8).
 *
 * **Validates: Requirements 1.3, 2.3, 3.4**
 *
 * jsdom cannot observe HTTP status codes or run real middleware, so this drives
 * a production build over HTTP: unknown locale-prefixed paths must answer 404
 * with no sign-in redirect, and `/dashboard` signed out must still redirect.
 *
 * The rendered 404 body comes from `src/app/not-found.tsx`, which task 3.5
 * adds. Until that file exists, Next serves its built-in 404 at the same
 * status, so the body assertion is gated on the file being present while the
 * status assertion always runs.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { startBuiltApp, type BuiltApp } from "./support/builtApp";

const LOCALE_PREFIXED_UNKNOWN_PATHS = ["/pt-br/", "/pt/pricing", "/es/docs"];

const appNotFoundPath = path.resolve(
  __dirname,
  "../../src/app/not-found.tsx",
);
const hasAppNotFound = fs.existsSync(appNotFoundPath);

let app: BuiltApp;

/**
 * Next normalizes a trailing slash with a 308 before the page resolves, so
 * `/pt-br/` answers 308 to `/pt-br`. That hop is not a sign-in redirect, so it
 * is followed once and the final answer is what gets asserted.
 */
async function requestResolvingTrailingSlash(pathname: string) {
  const response = await app.request(pathname);
  const location = response.headers.get("location");
  if (
    response.status === 308 &&
    location &&
    new URL(location, app.origin).pathname === pathname.replace(/\/$/, "")
  ) {
    return app.request(new URL(location, app.origin).pathname);
  }
  return response;
}

beforeAll(async () => {
  app = await startBuiltApp();
});

afterAll(async () => {
  await app?.stop();
});

describe("unknown locale-prefixed paths", () => {
  for (const pathname of LOCALE_PREFIXED_UNKNOWN_PATHS) {
    it(`${pathname} answers 404 with no sign-in redirect`, async () => {
      const response = await requestResolvingTrailingSlash(pathname);

      expect(response.status, pathname).toBe(404);
      expect(
        response.headers.get("location"),
        `${pathname} must not redirect`,
      ).toBeNull();

      // A 404 body carries the Clerk provider payload, which legitimately
      // includes the configured signInUrl, so the "no sign-in redirect" half of
      // requirement 2.3 is asserted on the status and Location header above,
      // not on a substring of the markup.
      const body = await response.text();
      expect(body).toContain("404");

      if (hasAppNotFound) {
        // Task 3.5 renders ErrorFallback 404 copy with a link home.
        expect(body).toMatch(/href="\/"/);
      }
    });
  }
});

describe("known non-public routes", () => {
  it("/dashboard signed out still redirects to sign-in", async () => {
    const response = await app.request("/dashboard");

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("location") ?? "").toMatch(/sign-in/);
  });

  it("/pricing still serves normally", async () => {
    const response = await app.request("/pricing");
    expect(response.status).toBe(200);
  });
});
