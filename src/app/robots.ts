import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/alenya", "/alenya/sop", "/precios"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/admin",
          "/admin/",
          "/gracias",
          "/alenya/dashboard",
          "/alenya/datos",
          "/alenya/login",
          "/api/",
          "/api",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/docs", "/alenya", "/precios"],
        disallow: ["/dashboard", "/admin", "/alenya/dashboard", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
