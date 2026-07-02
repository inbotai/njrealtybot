import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/market", "/news", "/sell", "/tax-shock", "/benefits", "/renovate"],
        disallow: ["/admin", "/my-home", "/favorites", "/match", "/staging", "/api/"],
      },
      // Block AI training crawlers (best-effort policy statement, not security)
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "ClaudeBot",
        disallow: ["/"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },
    ],
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
