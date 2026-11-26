/**
 * Technical SEO URL invariants (plan section 02, T01-T05).
 *
 * Everything the site advertises to crawlers (sitemap <loc>, robots Sitemap:,
 * metadataBase, JSON-LD) must be an absolute https://www.scrubai.app URL with
 * no repeated slash, query or fragment. HTTP-level checks (redirect hops,
 * 404s, <loc> answering 200, rendered canonicals) live in
 * tests/integration/seo.test.ts against a production build.
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));
vi.mock("@clerk/nextjs", () => ({ ClerkProvider: () => null }));
vi.mock("../../src/app/providers", () => ({ Providers: () => null }));

import { SITE_JSON_LD, SITE_URL, absoluteUrl } from "../../src/lib/url";
import sitemap, { LAST_MODIFIED } from "../../src/app/sitemap";
import robots from "../../src/app/robots";
import nextConfig from "../../next.config";
import { metadata as rootMetadata } from "../../src/app/layout";
import { DOCS } from "../../src/content/docs";

const ORIGIN = "https://www.scrubai.app";
const APP_DIR = path.resolve(__dirname, "../../src/app");

/**
 * The 12 paths Search Console reported with a doubled slash before the
 * URL-builder fix: about, scanner, docs, three articles, pricing, and the
 * legal/security routes.
 */
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

function assertCleanAbsolute(url: string) {
  const parsed = new URL(url);
  expect(parsed.origin, url).toBe(ORIGIN);
  expect(parsed.protocol, url).toBe("https:");
  expect(parsed.pathname, url).not.toMatch(/\/\//);
  expect(parsed.search, url).toBe("");
  expect(parsed.hash, url).toBe("");
  expect(url, url).not.toMatch(/^https:\/\/[^/]+\/.*\/\//);
  if (parsed.pathname !== "/") expect(parsed.pathname, url).not.toMatch(/\/$/);
}

/** Does the app actually serve this path (a page file, or a known doc slug)? */
function isServedRoute(pathname: string): boolean {
  if (pathname === "/") return fs.existsSync(path.join(APP_DIR, "page.tsx"));
  const doc = pathname.match(/^\/docs\/([^/]+)$/);
  if (doc) return DOCS.some((d) => d.slug === doc[1]);
  return fs.existsSync(path.join(APP_DIR, pathname.slice(1), "page.tsx"));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("absoluteUrl (T02 shared builder)", () => {
  it.each([
    // [input, expected] - neighbouring inputs around each normalization rule
    ["", `${ORIGIN}/`],
    ["/", `${ORIGIN}/`],
    ["//", `${ORIGIN}/`],
    ["///", `${ORIGIN}/`],
    ["about", `${ORIGIN}/about`],
    ["/about", `${ORIGIN}/about`],
    ["//about", `${ORIGIN}/about`],
    ["/about/", `${ORIGIN}/about`],
    ["//about//", `${ORIGIN}/about`],
    ["/docs//reach-penalties", `${ORIGIN}/docs/reach-penalties`],
    ["///docs///reach-penalties/", `${ORIGIN}/docs/reach-penalties`],
    ["/about?ref=x", `${ORIGIN}/about`],
    ["/about#team", `${ORIGIN}/about`],
    ["/about/?a=1#b", `${ORIGIN}/about`],
    ["/?ref=launches.uicomet.com", `${ORIGIN}/`],
    ["/#top", `${ORIGIN}/`],
    ["/sitemap.xml", `${ORIGIN}/sitemap.xml`],
  ])("%j -> %s", (input, expected) => {
    expect(absoluteUrl(input)).toBe(expected);
  });

  it("normalizes every former malformed path to its clean URL", () => {
    for (const clean of FORMER_MALFORMED_PATHS) {
      for (const malformed of [`/${clean}`, `${clean}/`, `//${clean}//`]) {
        expect(absoluteUrl(malformed), malformed).toBe(`${ORIGIN}${clean}`);
      }
    }
  });

  it("never emits a repeated slash, query or fragment for any path", () => {
    const segment = fc.stringMatching(/^[a-z0-9-]{0,8}$/);
    const junk = fc.constantFrom("", "/", "//", "?ref=x", "#h", "/?a=1#b");
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.constantFrom("/", "//", "///"), segment), {
          maxLength: 4,
        }),
        junk,
        (parts, tail) => {
          const input = parts.map(([s, seg]) => s + seg).join("") + tail;
          assertCleanAbsolute(absoluteUrl(input));
        },
      ),
      { numRuns: 300 },
    );
  });

  it("uses the canonical www host, not NEXT_PUBLIC_APP_URL", () => {
    expect(SITE_URL).toBe(ORIGIN);
  });
});

describe("sitemap (T01)", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists unique, clean, absolute https www URLs", () => {
    expect(urls.length).toBeGreaterThan(0);
    expect(new Set(urls).size, "duplicate <loc>").toBe(urls.length);
    urls.forEach(assertCleanAbsolute);
  });

  it("lists only routes the app serves", () => {
    for (const url of urls) {
      expect(isServedRoute(new URL(url).pathname), url).toBe(true);
    }
  });

  it("lists every docs article and every former malformed path", () => {
    const paths = urls.map((u) => new URL(u).pathname);
    for (const doc of DOCS) expect(paths).toContain(`/docs/${doc.slug}`);
    for (const p of FORMER_MALFORMED_PATHS) expect(paths).toContain(p);
    // Restored articles (plan T07).
    expect(paths).toContain("/docs/c2pa-explained");
    expect(paths).toContain("/docs/local-first-processing");
  });

  it("lists nothing robots.txt disallows (auth, dashboard, checkout, API)", () => {
    const rule = [robots().rules].flat()[0];
    const disallow = [rule.disallow ?? []].flat();
    for (const url of urls) {
      const p = new URL(url).pathname;
      for (const prefix of disallow) {
        expect(p === prefix || p.startsWith(prefix), `${p} vs ${prefix}`).toBe(false);
      }
    }
  });

  it("gives every route an explicit, fixed lastmod date", () => {
    for (const e of entries) {
      const p = new URL(e.url).pathname;
      expect(LAST_MODIFIED[p], `LAST_MODIFIED is missing ${p}`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(e.lastModified).toBe(LAST_MODIFIED[p]);
    }
    const sitemapPaths = new Set(urls.map((u) => new URL(u).pathname));
    for (const p of Object.keys(LAST_MODIFIED)) {
      expect(sitemapPaths.has(p), `stale LAST_MODIFIED entry ${p}`).toBe(true);
    }
  });

  it("does not move lastmod with the build clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    const first = sitemap();
    vi.setSystemTime(new Date("2031-06-15T12:34:56Z"));
    expect(sitemap()).toEqual(first);
  });
});

describe("robots (T05)", () => {
  const result = robots();
  const rule = [result.rules].flat()[0];

  it("declares the canonical sitemap URL", () => {
    expect(result.sitemap).toBe(`${ORIGIN}/sitemap.xml`);
  });

  it("allows public pages and rendering assets", () => {
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
    const disallow = [rule.disallow ?? []].flat();
    for (const p of [...FORMER_MALFORMED_PATHS, "/", "/_next/static/x.js", "/wasm/x.wasm", "/og-image.png"]) {
      expect(disallow.some((d) => p === d || p.startsWith(d)), p).toBe(false);
    }
  });

  it("keeps the intentional auth and dashboard exclusions", () => {
    const disallow = [rule.disallow ?? []].flat();
    for (const p of ["/dashboard", "/sign-in", "/sign-up", "/api/", "/thank-you"]) {
      expect(disallow).toContain(p);
    }
  });
});

describe("canonicalization (T03)", () => {
  it("resolves relative canonicals against the www metadataBase", () => {
    expect(String(rootMetadata.metadataBase)).toBe(`${ORIGIN}/`);
  });

  it("sets no global canonical in the root layout", () => {
    // A canonical here would be inherited by every route and point them all at
    // the homepage. Each page sets its own relative alternates.canonical.
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
  });

  it("canonicalizes /?ref=launches.uicomet.com to /", () => {
    // Per-page canonicals are static strings, so the referral query never
    // reaches them; the page keeps the query for attribution. Resolving the
    // homepage canonical against metadataBase drops nothing and adds nothing.
    const base = rootMetadata.metadataBase!;
    expect(new URL("/", base).href).toBe(`${ORIGIN}/`);
    expect(absoluteUrl("/?ref=launches.uicomet.com")).toBe(`${ORIGIN}/`);
  });
});

describe("site JSON-LD", () => {
  it("is valid WebSite + Organization data on the canonical host", () => {
    const json = JSON.parse(JSON.stringify(SITE_JSON_LD));
    const types = json["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite"]);
    const allUrls = JSON.stringify(json).match(/https:\/\/www\.scrubai\.app[^"]*/g) ?? [];
    expect(allUrls.length).toBeGreaterThan(0);
    for (const u of allUrls) assertCleanAbsolute(u.split("#")[0]);
  });
});

describe("redirects (T04)", () => {
  it("sends the bare apex to https www in one permanent hop, keeping the path", async () => {
    const rules = (await nextConfig.redirects!()) as Array<Record<string, unknown>>;
    expect(rules).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "scrubai.app" }],
      destination: "https://www.scrubai.app/:path*",
      permanent: true,
    });
  });

  it("does not redirect the www host or unknown paths to the homepage", async () => {
    const rules = (await nextConfig.redirects!()) as Array<{
      has?: Array<{ type: string; value?: string }>;
      destination: string;
    }>;
    for (const r of rules) {
      expect(r.has?.some((h) => h.value === "www.scrubai.app")).not.toBe(true);
      expect(r.destination).not.toMatch(/^(https:\/\/www\.scrubai\.app)?\/?$/);
    }
  });
});
