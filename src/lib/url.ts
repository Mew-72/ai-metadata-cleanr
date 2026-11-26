/**
 * Shared absolute-URL builder for every URL the site advertises to crawlers:
 * sitemap entries, the robots sitemap reference, metadataBase and JSON-LD.
 *
 * The origin is a constant, not NEXT_PUBLIC_APP_URL. That variable points at
 * localhost in development and once carried a trailing slash in production,
 * which joined with "/about" into "https://scrubai.app//about". Search engines
 * must only ever see the canonical production host.
 */
export const SITE_URL = "https://www.scrubai.app";

/**
 * Builds the canonical absolute URL for a site path.
 *
 * - Repeated slashes collapse to one ("//about" -> "/about").
 * - Query strings and fragments are dropped: canonical URLs carry neither.
 * - A trailing slash is dropped (next.config sets trailingSlash: false), except
 *   for the root, which resolves to "https://www.scrubai.app/" exactly as Next
 *   resolves a "/" canonical against metadataBase.
 */
export function absoluteUrl(path: string = "/"): string {
  let pathname = path.split(/[?#]/, 1)[0];
  pathname = `/${pathname}`.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/$/, "");
  return new URL(pathname, SITE_URL).href;
}

/**
 * Site-wide WebSite + Organization structured data, rendered once by the root
 * layout. Page-level types (WebApplication, Article, BreadcrumbList) belong to
 * the pages themselves.
 */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "ScrubAI",
      url: absoluteUrl("/"),
    },
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      name: "ScrubAI",
      url: absoluteUrl("/"),
      inLanguage: "en",
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
    },
  ],
};
