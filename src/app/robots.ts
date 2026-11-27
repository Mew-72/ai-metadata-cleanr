import { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/url";

/**
 * Allow public pages and rendering assets, and let crawlers follow the
 * dashboard sign-in redirect. Authentication is independent of these rules.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/ingest/",
          "/sign-up",
          "/sign-up/",
          "/thank-you",
          "/thank-you/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
