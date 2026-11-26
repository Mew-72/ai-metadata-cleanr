/**
 * Property 2: Preservation - the sitemap and robots URL sets are unchanged and
 * carry no locale-prefixed entries.
 *
 * **Validates: Requirements 3.8**
 *
 * The fix makes unknown locale-prefixed paths resolve to the app 404. A
 * plausible over-correction is to start advertising locale URLs, which would
 * both contradict requirement 3.8 and invite crawlers to paths that 404.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { baselineFor } from "../support/baseline";
import sitemap from "../../src/app/sitemap";
import robots from "../../src/app/robots";

const LANGUAGE_TAGS = [
  "pt",
  "pt-br",
  "es",
  "fr",
  "fr-ca",
  "de",
  "de-DE",
  "zh",
  "zh-hans",
  "ja",
  "ar",
  "en",
  "en-us",
];

function sitemapUrls(): string[] {
  return sitemap().map((entry) => entry.url);
}

function pathnameOf(url: string): string {
  return new URL(url).pathname;
}

describe("Property 2: sitemap and robots output", () => {
  it("serves the recorded URL set", () => {
    const urls = sitemapUrls();
    expect(urls).toEqual(baselineFor("seo", "sitemap.urls", urls));
    expect(new Set(urls).size, "sitemap has duplicate URLs").toBe(urls.length);
  });

  it("serves the recorded robots rules", () => {
    const rules = robots();
    expect(rules).toEqual(baselineFor("seo", "robots.rules", rules));
  });

  it("advertises no locale-prefixed URL for any language tag", () => {
    const pathnames = sitemapUrls().map(pathnameOf);
    fc.assert(
      fc.property(fc.constantFrom(...LANGUAGE_TAGS), (tag) => {
        for (const pathname of pathnames) {
          expect(
            pathname === `/${tag}` || pathname.startsWith(`/${tag}/`),
            `${pathname} is locale prefixed with ${tag}`,
          ).toBe(false);
        }
      }),
      { numRuns: LANGUAGE_TAGS.length * 2 },
    );

    const sitemapRef = robots().sitemap;
    const sitemapRefs = Array.isArray(sitemapRef)
      ? sitemapRef
      : sitemapRef
        ? [sitemapRef]
        : [];
    for (const ref of sitemapRefs) {
      expect(pathnameOf(ref)).toBe("/sitemap.xml");
    }
  });
});
