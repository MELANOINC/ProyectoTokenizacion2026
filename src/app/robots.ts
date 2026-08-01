import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs"],
        disallow: ["/dashboard", "/dashboard/", "/api/", "/api"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/docs"],
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
