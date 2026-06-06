import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scrubai.app";
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
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
