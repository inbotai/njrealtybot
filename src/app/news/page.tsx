import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogPosts, type BlogPostAPI } from "@/lib/api";

export const revalidate = 60; // 1 min ISR — articles update daily

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
  twitter: {
    card: "summary_large_image",
    title: "NJ Real Estate News | Garden State AI",
  },
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

export default async function NewsPage() {
  const posts = await fetchBlogPosts();

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            NJ Real Estate{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              News
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Market updates, property tax analysis, development alerts, and expert insights — powered by AI and real MLS data.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {posts.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-700">Articles are being generated</p>
              <p className="mt-2 text-sm text-gray-500">New articles are published daily. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured article */}
              {posts[0] && (
                <Link href={`/news/${posts[0].slug}`} className="block rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
                  {posts[0].cover_image && (
                    <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_LABELS[posts[0].category]?.color || "bg-gray-100 text-gray-700"}`}>
                        {CATEGORY_LABELS[posts[0].category]?.label || posts[0].category}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                      {posts[0].reading_time && <span className="text-xs text-gray-400">{posts[0].reading_time} min read</span>}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{posts[0].title}</h2>
                    <p className="mt-3 text-gray-600 line-clamp-3">{posts[0].excerpt}</p>
                    <p className="mt-4 text-sm font-medium text-indigo-600">Read full article &rarr;</p>
                  </div>
                </Link>
              )}

              {/* Article grid */}
              {posts.length > 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.slice(1).map(post => (
                    <Link key={post.slug} href={`/news/${post.slug}`} className="block rounded-xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_LABELS[post.category]?.color || "bg-gray-100 text-gray-700"}`}>
                          {CATEGORY_LABELS[post.category]?.label || post.category}
                        </span>
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

          {/* CTAs */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-r from-navy to-indigo-900 p-6 text-center text-white">
              <h3 className="font-bold text-lg">Are You Overpaying Property Taxes?</h3>
              <p className="mt-1 text-sm text-gray-300">Free AI analysis in 60 seconds.</p>
              <Link href="/tax-shock" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                Check My Taxes — Free
              </Link>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-green-800 to-emerald-900 p-6 text-center text-white">
              <h3 className="font-bold text-lg">What&apos;s Your Home Worth?</h3>
              <p className="mt-1 text-sm text-gray-300">AI-powered valuation with real MLS data.</p>
              <Link href="/sell" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}
