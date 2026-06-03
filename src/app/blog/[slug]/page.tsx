import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { blogPosts, getPost, getRelatedPosts } from "@/data/blog-posts";
import ShareButtons from "@/components/ShareButtons";

type Props = { params: Promise<{ slug: string }> };

const BASE_URL = "https://gardenstate.ai";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };

  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: post.date,
      modifiedTime: post.updatedDate || post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: "Garden State AI",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);
  const url = `${BASE_URL}/blog/${post.slug}`;

  const categoryColors: Record<string, string> = {
    market: "bg-blue-600 text-white",
    tips: "bg-emerald-600 text-white",
    news: "bg-purple-600 text-white",
    guide: "bg-amber-500 text-white",
  };
  const categoryLabels: Record<string, string> = {
    market: "Market Update",
    tips: "Selling Tips",
    news: "News",
    guide: "Guide",
  };

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Garden State AI",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative aspect-[21/9] w-full md:aspect-[3/1]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-3xl px-4 pb-8 md:pb-12">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryColors[post.category]}`}>
                {categoryLabels[post.category]}
              </span>
              <span className="text-xs text-gray-300">{post.readingTime} min read</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
              <span className="font-medium text-white">{post.author}</span>
              {post.authorRole && (
                <>
                  <span>&middot;</span>
                  <span>{post.authorRole}</span>
                </>
              )}
              <span>&middot;</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Share bar */}
        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {tag}
              </span>
            ))}
          </div>
          <ShareButtons url={url} title={post.title} />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg prose-gray max-w-none
            prose-headings:text-navy prose-headings:font-extrabold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:text-gray-700
            prose-a:text-indigo-600 prose-a:font-medium hover:prose-a:text-indigo-800
            prose-strong:text-navy
            prose-li:text-gray-700 prose-li:leading-relaxed
            prose-table:border prose-table:rounded-lg prose-table:overflow-hidden
            prose-th:bg-navy prose-th:text-white prose-th:px-4 prose-th:py-2.5 prose-th:text-sm prose-th:font-semibold
            prose-td:px-4 prose-td:py-2.5 prose-td:border-t prose-td:text-sm
            prose-blockquote:border-l-gold prose-blockquote:bg-gold/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {/* Bottom share */}
        <div className="mt-10 flex items-center justify-between rounded-xl bg-gray-50 p-5">
          <p className="text-sm font-medium text-gray-600">Found this useful? Share it.</p>
          <ShareButtons url={url} title={post.title} />
        </div>

        {/* CTA */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-indigo-900 p-8 text-center text-white md:p-10">
          <h3 className="text-2xl font-bold">Want a Personalized Market Analysis?</h3>
          <p className="mx-auto mt-3 max-w-lg text-gray-300">
            Get an AI-powered CMA for your property — free, instant, no obligation.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sell"
              className="rounded-xl bg-gold px-8 py-3 font-bold text-navy transition hover:bg-yellow-400 hover:shadow-lg"
            >
              Get My Free Valuation
            </Link>
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20just%20read%20your%20blog%20and%20want%20a%20CMA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-3 font-bold text-white transition hover:bg-[#20bd5a]"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Ask Vale on WhatsApp
            </a>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">Related Articles</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group flex gap-4 rounded-xl border bg-white p-4 transition hover:shadow-md">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={r.coverImage} alt={r.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-navy transition group-hover:text-indigo-600">{r.title}</h4>
                    <p className="mt-1 text-xs text-gray-400">{r.readingTime} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            &larr; All Articles
          </Link>
        </div>
      </article>
    </>
  );
}

/** Markdown to HTML — handles headings, bold, italic, links, tables, lists */
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split("|").map((c: string) => c.trim());
      const isHeader = cells.every((c: string) => /^-+$/.test(c));
      if (isHeader) return "";
      const tag = "td";
      return `<tr>${cells.map((c: string) => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`)
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[huptol])/gm, "")
    .replace(/^\s*$/gm, "");
}
