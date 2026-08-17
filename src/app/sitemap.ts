import type { MetadataRoute } from "next";
import { LAST_CONTENT_UPDATE, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
