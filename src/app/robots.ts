import { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/url";

/**
 * Public pages and rendering assets (/_next, /wasm, images) are allowed by
 * "/". The disallows are intentional: auth, dashboard, checkout return and
 * API/analytics endpoints are not search landing pages.
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
          "/dashboard",
          "/dashboard/",
          "/sign-in",
          "/sign-in/",
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
