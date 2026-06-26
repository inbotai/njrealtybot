import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/market"],
      disallow: ["/admin", "/my-home", "/favorites", "/match", "/staging"],
    },
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
