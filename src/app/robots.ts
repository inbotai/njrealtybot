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
    ],
    sitemap: "https://gardenstate.ai/sitemap.xml",
  };
}
