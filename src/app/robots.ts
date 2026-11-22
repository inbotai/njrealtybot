import type { MetadataRoute } from "next";
import { ALLOWED_BOTS, TRAINING_CRAWLERS } from "@/lib/crawler-policy";
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

// Yahoo's crawler is not in the shared allow list. Give it the same public
// rules as the other search engines so a later change to `*` cannot hide it.
const EXTRA_SEARCH_ENGINES = ["Slurp"];

// High-volume SEO crawlers. Names already in TRAINING_CRAWLERS are refused
// by that group and are not repeated here.
const LOW_VALUE_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
];

const trainingNames = new Set<string>(TRAINING_CRAWLERS);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [...TRAINING_CRAWLERS],
        allow: [INDEXNOW_KEY_PATH],
        disallow: ["/"],
      },
      {
        userAgent: [...ALLOWED_BOTS],
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      },
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      },
      ...EXTRA_SEARCH_ENGINES.filter((userAgent) => !trainingNames.has(userAgent)).map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE,
      })),
      ...LOW_VALUE_BOTS.filter((userAgent) => !trainingNames.has(userAgent)).map((userAgent) => ({
        userAgent,
        allow: [INDEXNOW_KEY_PATH],
        disallow: ["/"],
      })),
    ],
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
