import type { MetadataRoute } from "next";
import { fetchBlogPosts, fetchListings, fetchMarketCities, type Listing } from "@/lib/api";
import { blogPosts as staticBlogPosts } from "@/data/blog-posts";
import { townTaxPages } from "@/lib/nj-tax-rates";
import { cityToSlug } from "@/lib/place-slug";
import { generateSlug } from "@/lib/utils";

const BASE_URL = "https://gardenstate.ai";
const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export const revalidate = 3600;
export const maxDuration = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/chat`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/sell`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/tax-shock`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/property-tax`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/value`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/appeal`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/benefits`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/sell-timing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/net-proceeds`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/renovate`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/afford`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/fsbo`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/list`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/offers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/alerts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/comp-alerts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/open-houses`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/market`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/deals`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const marketPages = await marketCityPages();
  const townPages: MetadataRoute.Sitemap = townTaxPages().map((town) => ({
    url: `${BASE_URL}/property-tax/${town.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const newsPages = await newsPagesForSitemap();
  const listingPages = await listingPagesForSitemap();

  return [...staticPages, ...marketPages, ...townPages, ...newsPages, ...listingPages];
}

async function marketCityPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const cities = await fetchMarketCities();
    return cities.map((city) => ({
      url: `${BASE_URL}/market/${cityToSlug(city.city)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function newsPagesForSitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string; date: string }[] = [];
  try {
    const apiPosts = await fetchBlogPosts();
    if (apiPosts.length > 0) {
      articles = apiPosts.map((post) => ({ slug: post.slug, date: post.published_at || post.created_at }));
    }
  } catch {
    /* API may be unavailable during build */
  }
  if (!articles.length) {
    articles = staticBlogPosts.map((post) => ({ slug: post.slug, date: post.date }));
  }
  return articles.map((post) => ({
    url: `${BASE_URL}/news/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

function listingPath(row: Partial<Listing> & { slug?: string }): string | null {
  if (row.slug) return `/property/${row.slug}`;
  if (row.id) return `/property/${generateSlug(row as Listing)}`;
  return null;
}

async function listingPagesForSitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await fetchActiveListings();
  const seen = new Set<string>();
  const pages: MetadataRoute.Sitemap = [];
  for (const row of rows) {
    const path = listingPath(row);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    pages.push({ url: `${BASE_URL}${path}`, changeFrequency: "weekly", priority: 0.6 });
  }
  return pages;
}

async function fetchActiveListings(): Promise<Array<Partial<Listing> & { slug?: string }>> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/sitemap-listings`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const rows = json.listings || json.data || json;
      if (Array.isArray(rows) && rows.length > 50) return rows;
    }
  } catch {
    /* Dedicated sitemap feed is optional until the backend ships it. */
  }

  try {
    const first = await fetchListings({ status: "Active", limit: "50", page: "1" });
    const pageSize = first.pageSize || 50;
    const total = first.total || first.data?.length || 0;
    const pages = Math.min(Math.ceil(total / pageSize) || 1, 200);
    const all: Listing[] = [...(first.data || [])];
    const concurrency = 8;
    for (let start = 2; start <= pages; start += concurrency) {
      const batch = [];
      for (let page = start; page < start + concurrency && page <= pages; page++) {
        batch.push(
          fetchListings({ status: "Active", limit: "50", page: String(page) })
            .then((result) => result.data || [])
            .catch(() => [] as Listing[]),
        );
      }
      const results = await Promise.all(batch);
      for (const chunk of results) all.push(...chunk);
    }
    return all;
  } catch {
    return [];
  }
}
