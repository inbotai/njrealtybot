import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Real Estate News & Guides | Garden State AI",
  description:
    "Expert NJ real estate market updates, selling strategies, buyer guides, and data-driven insights. Everything you need to buy or sell smarter in New Jersey.",
  openGraph: {
    title: "Real Estate News & Guides | Garden State AI",
    description:
      "Expert NJ real estate market updates, selling strategies, buyer guides, and data-driven insights.",
    type: "website",
    url: "https://gardenstate.ai/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate News & Guides | Garden State AI",
    description:
      "Expert NJ real estate market updates, selling strategies, buyer guides, and data-driven insights.",
  },
  alternates: { canonical: "https://gardenstate.ai/blog" },
};

const categoryLabels: Record<string, string> = {
  market: "Market Update",
  tips: "Selling Tips",
  news: "News",
  guide: "Guide",
};

const categoryColors: Record<string, string> = {
  market: "bg-blue-600 text-white",
  tips: "bg-emerald-600 text-white",
  news: "bg-purple-600 text-white",
  guide: "bg-amber-500 text-white",
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      {/* Header */}
      <section className="border-b bg-navy py-14 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Garden State AI</p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Real Estate Intelligence
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Data-driven market updates, expert strategies, and actionable guides for New Jersey buyers and sellers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="group mb-12 block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-xl">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[16/10] md:aspect-auto">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-10">
              <div className="flex items-center gap-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${categoryColors[featured.category]}`}>
                  {categoryLabels[featured.category]}
                </span>
                <span className="text-xs text-gray-400">{featured.readingTime} min read</span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-navy transition group-hover:text-indigo-600 md:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                <time dateTime={featured.date}>
                  {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </time>
                <span>&middot;</span>
                <span>{featured.author}</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-800">
                Read article &rarr;
              </p>
            </div>
          </div>
        </Link>

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">More Articles</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-navy transition group-hover:text-indigo-600">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </time>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Newsletter / CTA */}
      <section className="border-t bg-navy py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">Stay Ahead of the NJ Market</h2>
          <p className="mt-3 text-gray-300">
            Get the latest market data, selling strategies, and insider insights delivered to your phone.
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20receive%20market%20updates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 font-bold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Get Market Updates on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
