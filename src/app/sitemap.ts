import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scrubai.app";
  return [
    {
      url: baseUrl,
      lastModified: "2026-05-25",
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: "2026-05-23",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/c2pa-scanner`,
      lastModified: "2026-05-24",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: "2026-05-23",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: "2026-05-25",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: "2026-05-25",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: "2026-05-25",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
