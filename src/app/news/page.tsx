import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogPosts, type BlogPostAPI } from "@/lib/api";

export const revalidate = 1800; // 30 min ISR

export const metadata: Metadata = {
  title: "NJ Development News | Planning & Zoning Board Updates",
  description:
    "What's being built in your NJ neighborhood? Planning board approvals, zoning variances, new construction — sourced from official municipal documents.",
  keywords: [
    "NJ development news", "planning board NJ", "zoning board NJ",
    "new construction NJ", "Hackensack planning board", "Clifton zoning board",
    "NJ real estate news", "development alerts NJ",
  ],
  openGraph: {
    title: "NJ Development News | Garden State AI",
    description: "Planning board approvals, zoning variances, and new construction across NJ — from official documents.",
    type: "website",
    url: "https://gardenstate.ai/news",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Development News | Garden State AI",
  },
  alternates: { canonical: "https://gardenstate.ai/news" },
};

export default async function NewsPage() {
  // Fetch development articles from blog API
  const allPosts = await fetchBlogPosts();
  const devPosts = allPosts.filter(p => p.category === "development" && p.status === "published");
  const otherPosts = allPosts.filter(p => p.category !== "development" && p.status === "published").slice(0, 3);

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            NJ Development{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              News
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            What&apos;s being built in your neighborhood? Planning board approvals, zoning variances, and new construction — sourced from official municipal documents.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {devPosts.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-700">News articles are being generated</p>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;re monitoring 18 NJ municipalities. Articles will appear here as planning and zoning boards publish new agendas.
              </p>
              <Link href="/my-home" className="mt-4 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                Get Development Alerts for Your Home
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured article */}
              {devPosts[0] && (
                <Link href={`/blog/${devPosts[0].slug}`} className="block rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Development News</span>
                      <span className="text-xs text-gray-400">{formatDate(devPosts[0].published_at || devPosts[0].created_at)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{devPosts[0].title}</h2>
                    <p className="mt-3 text-gray-600 line-clamp-3">{devPosts[0].excerpt}</p>
                    <p className="mt-4 text-sm font-medium text-indigo-600">Read full article &rarr;</p>
                  </div>
                </Link>
              )}

              {/* Article grid */}
              {devPosts.length > 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {devPosts.slice(1).map(post => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Development</span>
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

          {/* Cross-promote other blog posts */}
          {otherPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-navy mb-4">More from Garden State AI</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {otherPosts.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition">
                    <span className="text-xs text-gray-400">{post.category}</span>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 rounded-xl bg-gradient-to-r from-navy to-indigo-900 p-6 text-center text-white">
            <h3 className="font-bold text-lg">Get Notified of New Developments Near You</h3>
            <p className="mt-1 text-sm text-gray-300">Claim your home and we&apos;ll alert you when new projects are proposed in your neighborhood.</p>
            <Link href="/my-home" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
              Track My Home — Free
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] text-gray-400">
            News sourced from official NJ municipal board documents. This is not legal advice.
            Garden State AI does not offer guarantees and does not represent any party in these proceedings.
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
