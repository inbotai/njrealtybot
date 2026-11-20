import type { MetadataRoute } from "next";
import { INDEXNOW_KEY_PATH } from "@/lib/indexnow";

const PUBLIC_ALLOW = [
  "/",
  INDEXNOW_KEY_PATH,
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

// Google, Bing, DuckDuckGo, Apple, and Yahoo. Explicit groups so a later
// change to the `*` rule cannot quietly block the indexes we want.
const SEARCH_ENGINES = ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot", "Slurp"];

// Documented assistant and AI-search crawlers opened on purpose (SEO-001).
// GPTBot and ClaudeBot are the vendors' stable training crawlers. OAI-SearchBot
// and PerplexityBot are search products and can cite these pages. Google-Extended
// is Google's AI training crawler, separate from Googlebot; blocking it would
// not change Google Search. anthropic-ai is Anthropic's other published agent.
// They are not rotating scrapers. CCBot stays blocked: Common Crawl is a bulk
// dataset, not a search index.
const AI_SEARCH_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
];

// SEO and scrape bots that do not send buyers. Bytespider was already blocked.
const LOW_VALUE_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "Bytespider",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "DataForSeoBot",
  "BLEXBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      },
      ...SEARCH_ENGINES.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      })),
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: ["/admin", "/my-home", "/api/"],
      })),
      { userAgent: "CCBot", allow: [INDEXNOW_KEY_PATH], disallow: ["/"] },
      ...LOW_VALUE_BOTS.map((userAgent) => ({
        userAgent,
        allow: [INDEXNOW_KEY_PATH],
        disallow: ["/"],
      })),
    ],
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
