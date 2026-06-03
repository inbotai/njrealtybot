import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Blog | NJ Real Estate Insights | Garden State AI",
  description: "Market updates, selling tips, and real estate guides for New Jersey homeowners and buyers.",
  robots: { index: false, follow: false },
};

const categoryColors: Record<string, string> = {
  market: "bg-blue-100 text-blue-700",
  tips: "bg-green-100 text-green-700",
  news: "bg-purple-100 text-purple-700",
  guide: "bg-gold/20 text-yellow-800",
};

export default function BlogPage() {
  return (
    <RequireAuth>
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Blog</span>
          </h1>
          <p className="mt-2 text-gray-300">NJ real estate market updates, tips, and guides</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group block rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-gold">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}>
                {post.category}
              </span>
              <h2 className="mt-3 text-lg font-bold text-navy group-hover:text-gold transition">{post.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
              <p className="mt-3 text-xs text-gray-400">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.author}</p>
            </Link>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
