import type { MetadataRoute } from "next";

const PUBLIC_ALLOW = [
  "/",
  "/search",
  "/market",
  "/news",
  "/property",
  "/property-tax",
  "/value",
  "/appeal",
  "/deals",
  "/open-houses",
  "/sell",
  "/tax-shock",
  "/benefits",
  "/renovate",
];

const PRIVATE = ["/admin", "/my-home", "/favorites", "/match", "/staging", "/api/"];

const AI_SEARCH_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: ["/admin", "/my-home", "/api/"],
      })),
      { userAgent: "CCBot", disallow: ["/"] },
      { userAgent: "Bytespider", disallow: ["/"] },
    ],
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
