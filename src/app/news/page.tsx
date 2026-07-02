import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogPosts, type BlogPostAPI } from "@/lib/api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NJ Real Estate News | Market Updates, Tax Analysis & Development",
  description:
    "NJ real estate news, market updates, property tax analysis, development alerts, and expert insights — powered by AI and real MLS data.",
  keywords: [
    "NJ real estate news", "NJ property tax news", "NJ market update",
    "planning board NJ", "NJ home values", "Jersey City taxes",
    "NJ development news", "property tax appeal NJ",
  ],
  openGraph: {
    title: "NJ Real Estate News | Garden State AI",
    description: "Market updates, property tax analysis, development news, and expert insights for NJ homeowners.",
    type: "website",
    url: "https://gardenstate.ai/news",
  },
  twitter: { card: "summary_large_image", title: "NJ Real Estate News | Garden State AI" },
  alternates: { canonical: "https://gardenstate.ai/news" },
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  market: { label: "Market Update", color: "bg-blue-100 text-blue-700" },
  development: { label: "Development", color: "bg-indigo-100 text-indigo-700" },
  tips: { label: "Seller Tips", color: "bg-green-100 text-green-700" },
  guide: { label: "Buyer Guide", color: "bg-purple-100 text-purple-700" },
  news: { label: "News", color: "bg-red-100 text-red-700" },
  tax: { label: "Tax Analysis", color: "bg-amber-100 text-amber-700" },
};

const TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "town_report", label: "Town Reports" },
  { key: "municipal_watch", label: "Municipal Watch" },
  { key: "seasonal", label: "Seasonal" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string; type?: string }>;
}) {
  const params = await searchParams;
  const townFilter = params.town || "";
  const typeFilter = params.type || "all";

  const posts = await fetchBlogPosts({ town: townFilter, articleType: typeFilter === "all" ? "" : typeFilter });

  // Extract unique towns for filter dropdown
  const allPosts = await fetchBlogPosts({});
  const towns = [...new Set(allPosts.filter(p => p.town).map(p => p.town!))].sort();

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            NJ Real Estate <span className="text-gold">News</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Market updates, property tax analysis, development alerts, and expert insights — powered by AI and real MLS data.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Article type tabs */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_TABS.map(tab => (
                <Link
                  key={tab.key}
                  href={`/news?type=${tab.key}${townFilter ? `&town=${townFilter}` : ""}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    typeFilter === tab.key
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Town filter */}
            {towns.length > 0 && (
              <div className="sm:ml-auto flex gap-2">
                {towns.map(t => (
                  <Link
                    key={t}
                    href={`/news?town=${t}${typeFilter !== "all" ? `&type=${typeFilter}` : ""}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition hidden sm:inline-block ${
                      townFilter === t
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                    }`}
                  >
                    {t}
                  </Link>
                )).slice(0, 5)}
                {towns.length > 5 && !townFilter && (
                  <span className="rounded-full px-3 py-1 text-xs text-gray-400 hidden sm:inline-block">+{towns.length - 5} more below</span>
                )}
              </div>
            )}
          </div>

          {/* Town header when filtered */}
          {townFilter && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{townFilter} Reports</h2>
              <p className="text-sm text-gray-500 mt-1">
                All articles about {townFilter}, NJ
                <Link href="/news" className="ml-2 text-indigo-600 hover:underline">Clear filter</Link>
              </p>
            </div>
          )}

          {/* Articles */}
          {posts.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-700">
                {townFilter ? `No articles for ${townFilter} yet` : "Articles are being generated"}
              </p>
              <p className="mt-2 text-sm text-gray-500">New articles are published regularly. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured */}
              {posts[0] && (
                <Link href={`/news/${posts[0].slug}`} className="block rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
                  {posts[0].cover_image && (
                    <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_LABELS[posts[0].category]?.color || "bg-gray-100 text-gray-700"}`}>
                        {CATEGORY_LABELS[posts[0].category]?.label || posts[0].category}
                      </span>
                      {posts[0].town && (
                        <Link href={`/news?town=${posts[0].town}`} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                          {posts[0].town}
                        </Link>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                      {posts[0].reading_time && <span className="text-xs text-gray-400">{posts[0].reading_time} min read</span>}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{posts[0].title}</h2>
                    <p className="mt-3 text-gray-600 line-clamp-3">{posts[0].excerpt}</p>
                    <p className="mt-4 text-sm font-medium text-indigo-600">Read full article &rarr;</p>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {posts.length > 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.slice(1).map(post => (
                    <Link key={post.slug} href={`/news/${post.slug}`} className="block rounded-xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_LABELS[post.category]?.color || "bg-gray-100 text-gray-700"}`}>
                          {CATEGORY_LABELS[post.category]?.label || post.category}
                        </span>
                        {post.town && (
                          <Link href={`/news?town=${post.town}`} className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                            {post.town}
                          </Link>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                      <p className="mt-3 text-xs font-medium text-indigo-600">Read more &rarr;</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Town archive links */}
          {!townFilter && towns.length > 0 && (
            <div className="mt-10 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Browse by Town</h3>
              <div className="flex flex-wrap gap-2">
                {towns.map(t => (
                  <Link key={t} href={`/news?town=${t}`} className="rounded-full px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-r from-navy to-indigo-900 p-6 text-center text-white">
              <h3 className="font-bold text-lg">Are You Overpaying Property Taxes?</h3>
              <p className="mt-1 text-sm text-gray-300">Free AI analysis in 60 seconds.</p>
              <Link href="/tax-shock?utm_source=content&utm_campaign=news_page" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                Check My Taxes — Free
              </Link>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-green-800 to-emerald-900 p-6 text-center text-white">
              <h3 className="font-bold text-lg">What&apos;s Your Home Worth?</h3>
              <p className="mt-1 text-sm text-gray-300">AI-powered valuation with real MLS data.</p>
              <Link href="/sell?utm_source=content&utm_campaign=news_page" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                Get Free Valuation
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-gray-400">
            Articles generated from real MLS data, official municipal documents, and verified news sources.
            This is not legal or financial advice. Garden State AI does not offer guarantees.
          </p>
        </div>
      </section>
    </>
  );
}
