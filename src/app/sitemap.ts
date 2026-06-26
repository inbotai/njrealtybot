import type { MetadataRoute } from "next";
import { fetchListings, fetchBlogPosts } from "@/lib/api";
import { generateSlug } from "@/lib/utils";
import { blogPosts as staticBlogPosts } from "@/data/blog-posts";

const BASE_URL = "https://gardenstate.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Public tools (high priority)
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/chat`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/sell`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/tax-shock`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/appeal`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/sell-timing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/net-proceeds`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/renovate`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/afford`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/alerts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/comp-alerts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/open-houses`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    // Login pages (index landing)
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/market`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/deals`, changeFrequency: "weekly", priority: 0.7 },
    // Static pages
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
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

  // Blog pages — try API, fallback to static
  let blogArticles: { slug: string; date: string }[] = [];
  try {
    const apiPosts = await fetchBlogPosts();
    if (apiPosts.length > 0) {
      blogArticles = apiPosts.map(p => ({ slug: p.slug, date: p.published_at || p.created_at }));
    }
  } catch { /* API may be unavailable */ }
  if (!blogArticles.length) {
    blogArticles = staticBlogPosts.map(p => ({ slug: p.slug, date: p.date }));
  }

  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...blogArticles.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...blogPages, ...listingPages];
}
