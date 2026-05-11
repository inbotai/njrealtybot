import type { MetadataRoute } from "next";
import { fetchListings } from "@/lib/api";
import { generateSlug } from "@/lib/utils";

const BASE_URL = "https://njrealtybot.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/open-houses`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/sell`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetchListings({ status: "Active", limit: "1000" });
    listingPages = (res.data || []).map((listing) => ({
      url: `${BASE_URL}/property/${generateSlug(listing)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    /* API may be unavailable during build */
  }

  return [...staticPages, ...listingPages];
}
