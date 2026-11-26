/**
 * HTTP-level technical SEO checks (plan section 02, T01-T05) against a
 * production build. Unit-level URL invariants live in tests/unit/seo-urls.test.ts.
 *
 * Raw node:http is used instead of fetch for two reasons: fetch cannot set the
 * Host header (needed for the apex -> www redirect), and it would read a path
 * such as "//about" as a protocol-relative URL instead of sending it as-is.
 */
import http from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startBuiltApp, type BuiltApp } from "./support/builtApp";

const ORIGIN = "https://www.scrubai.app";

const FORMER_MALFORMED_PATHS = [
  "/about",
  "/c2pa-scanner",
  "/docs",
  "/docs/reach-penalties",
  "/docs/pixel-redraw-technique",
  "/docs/platforms-cheatsheet",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
  "/refund",
  "/cookies",
];

type RawResponse = { status: number; location: string | null; type: string; body: string };

let app: BuiltApp;

function raw(rawPath: string, host?: string): Promise<RawResponse> {
  const { hostname, port } = new URL(app.origin);
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname, port, path: rawPath, method: "GET", headers: host ? { host } : {} },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            location: (res.headers.location as string | undefined) ?? null,
            type: String(res.headers["content-type"] ?? ""),
            body,
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function canonicalOf(html: string): string | null {
  const tag = html.match(/<link[^>]*rel="canonical"[^>]*>/);
  return tag?.[0].match(/href="([^"]+)"/)?.[1] ?? null;
}

beforeAll(async () => {
  app = await startBuiltApp();
});

afterAll(async () => {
  await app?.stop();
});

describe("T01 sitemap.xml", () => {
  it("answers 200 with XML whose every <loc> answers 200, indexable, matching its canonical", async () => {
    const res = await raw("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/xml/);
    expect(res.body).toMatch(/^<\?xml/);

    const locs = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    expect(new Set(locs).size).toBe(locs.length);

    for (const loc of locs) {
      const url = new URL(loc);
      expect(url.origin, loc).toBe(ORIGIN);
      const page = await raw(url.pathname);
      expect(page.status, loc).toBe(200);
      expect(page.location, loc).toBeNull();
      expect(page.body, `${loc} is noindex`).not.toMatch(
        /<meta[^>]*name="robots"[^>]*noindex/,
      );
      const canonical = canonicalOf(page.body);
      if (canonical) expect(canonical, `${loc} canonical`).toBe(loc);
    }
  });
});

describe("T02 former malformed paths", () => {
  for (const clean of FORMER_MALFORMED_PATHS) {
    it(`/${clean} redirects permanently to ${clean} in one hop`, async () => {
      const res = await raw(`/${clean}`);
      expect(res.status).toBe(308);
      expect(new URL(res.location!, app.origin).pathname).toBe(clean);
      expect((await raw(clean)).status).toBe(200);
    });
  }
});

describe("T03 canonicalization", () => {
  it("/?ref=launches.uicomet.com is served (attribution kept) and canonicalizes to /", async () => {
    const res = await raw("/?ref=launches.uicomet.com");
    expect(res.status).toBe(200);
    const canonical = canonicalOf(res.body);
    if (canonical) expect(canonical).toBe(`${ORIGIN}/`);
  });

  it("no inner page inherits the homepage canonical", async () => {
    for (const p of FORMER_MALFORMED_PATHS) {
      const canonical = canonicalOf((await raw(p)).body);
      if (canonical) expect(canonical, p).toBe(`${ORIGIN}${p}`);
    }
  });
});

describe("T04 redirects", () => {
  it.each([
    ["/", `${ORIGIN}/`],
    ["/about", `${ORIGIN}/about`],
    ["/about?ref=x&utm_source=y", `${ORIGIN}/about?ref=x&utm_source=y`],
    ["/?ref=launches.uicomet.com", `${ORIGIN}/?ref=launches.uicomet.com`],
    ["/docs/reach-penalties", `${ORIGIN}/docs/reach-penalties`],
    ["/no-such-page", `${ORIGIN}/no-such-page`],
  ])("apex %s -> %s (308, path and query kept)", async (p, target) => {
    const res = await raw(p, "scrubai.app");
    expect(res.status).toBe(308);
    // Next writes the root as "https://www.scrubai.app?ref=..." (no slash),
    // which is the same URL; compare parsed forms.
    expect(new URL(res.location!).href).toBe(new URL(target).href);
  });

  it("www host is not redirected", async () => {
    const res = await raw("/about", "www.scrubai.app");
    expect(res.status).toBe(200);
  });

  it.each(["/no-such-page", "/docs/does-not-exist", "/pt-br/pricing", "/about-us"])(
    "%s is a genuine 404, not a homepage or sign-in redirect",
    async (p) => {
      const res = await raw(p);
      expect(res.status, p).toBe(404);
      expect(res.location, p).toBeNull();
    },
  );
});

describe("T05 robots.txt", () => {
  it("answers 200, allows /, declares the sitemap, keeps auth disallows", async () => {
    const res = await raw("/robots.txt");
    expect(res.status).toBe(200);
    expect(res.body).toMatch(/^Allow: \/$/m);
    expect(res.body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    for (const p of ["/dashboard", "/sign-in", "/sign-up", "/api/"]) {
      expect(res.body).toContain(`Disallow: ${p}`);
    }
  });
});
