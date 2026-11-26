import { MetadataRoute } from "next";
import { DOCS } from "../content/docs";
import { absoluteUrl } from "../lib/url";

/**
 * Date each public route's content last meaningfully changed (YYYY-MM-DD).
 * Bump an entry only when that page's content really changes: a lastmod that
 * moves on every build teaches crawlers to ignore it. Every sitemap path must
 * have an entry here (tests/unit/sitemap.test.ts enforces it); a path without
 * one is emitted with no lastmod rather than a made-up date.
 */
export const LAST_MODIFIED: Record<string, string> = {
  "/": "2026-11-26",
  "/pricing": "2026-06-23",
  "/about": "2026-06-06",
  "/c2pa-scanner": "2026-11-26",
  "/docs": "2026-06-06",
  "/docs/reach-penalties": "2026-06-06",
  "/docs/pixel-redraw-technique": "2026-06-06",
  "/docs/platforms-cheatsheet": "2026-06-06",
  "/privacy": "2026-06-06",
  "/terms": "2026-06-06",
  "/security": "2026-06-06",
  "/refund": "2026-06-06",
  "/cookies": "2026-06-06",
};

type Entry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  changeFrequency: Entry["changeFrequency"],
  priority: number,
): Entry {
  const date = LAST_MODIFIED[path];
  return {
    url: absoluteUrl(path),
    ...(date ? { lastModified: date } : {}),
    changeFrequency,
    priority,
  };
}

/**
 * Only public, indexable, canonical routes that answer 200. Auth, dashboard,
 * thank-you and API routes stay out (robots.ts disallows them).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", "daily", 1.0),
    entry("/pricing", "weekly", 0.9),
    entry("/about", "monthly", 0.7),
    entry("/c2pa-scanner", "weekly", 0.8),
    entry("/docs", "weekly", 0.7),
    ...DOCS.map((doc) => entry(`/docs/${doc.slug}`, "weekly", 0.7)),
    entry("/privacy", "monthly", 0.3),
    entry("/terms", "monthly", 0.3),
    entry("/security", "monthly", 0.3),
    entry("/refund", "monthly", 0.3),
    entry("/cookies", "monthly", 0.3),
  ];
}
