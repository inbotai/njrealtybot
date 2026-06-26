import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { marked, Renderer } from "marked";
import { fetchBlogPosts, fetchBlogPost } from "@/lib/api";
import { blogPosts as staticPosts, getPost as getStaticPost, getRelatedPosts as getStaticRelated } from "@/data/blog-posts";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };
const BASE_URL = "https://gardenstate.ai";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  const staticPost = !post ? getStaticPost(slug) : null;
  const title = post?.title || staticPost?.title;
  const excerpt = post?.excerpt || staticPost?.excerpt;
  const image = post?.cover_image || staticPost?.coverImage;
  const date = post?.published_at || post?.created_at || staticPost?.date;

  if (!title) return { title: "Post Not Found" };

  const url = `${BASE_URL}/blog/${slug}`;
  return {
    title,
    description: excerpt,
    openGraph: {
      title, description: excerpt, type: "article", url,
      publishedTime: date,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      siteName: "Garden State AI",
    },
    twitter: { card: "summary_large_image", title, description: excerpt, images: image ? [image] : [] },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  const apiPosts = await fetchBlogPosts();
  if (apiPosts.length > 0) return apiPosts.map(p => ({ slug: p.slug }));
  return staticPosts.map(p => ({ slug: p.slug }));
}

const categoryColors: Record<string, string> = {
  market: "bg-blue-600 text-white",
  tips: "bg-emerald-600 text-white",
  news: "bg-purple-600 text-white",
  guide: "bg-amber-500 text-white",
  development: "bg-indigo-600 text-white",
};
const categoryLabels: Record<string, string> = {
  market: "Market Update",
  tips: "Selling Tips",
  news: "News",
  guide: "Guide",
  development: "Development News",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Try API, fall back to static
  const apiPost = await fetchBlogPost(slug);
  const staticPost = !apiPost ? getStaticPost(slug) : null;
  if (!apiPost && !staticPost) notFound();

  const title = apiPost?.title || staticPost!.title;
  const excerpt = apiPost?.excerpt || staticPost!.excerpt;
  const content = apiPost?.content ?? staticPost?.content ?? "";
  const contentHtml = apiPost?.content_html || null;
  const category = apiPost?.category || staticPost!.category;
  const coverImage = apiPost?.cover_image || staticPost?.coverImage || "";
  const readingTime = apiPost?.reading_time ?? staticPost?.readingTime ?? 2;
  const author = apiPost?.author || staticPost?.author || "Garden State AI";
  const authorRole = apiPost?.author_role || staticPost?.authorRole || null;
  const date = apiPost?.published_at || apiPost?.created_at || staticPost?.date || new Date().toISOString();
  const tags: string[] = apiPost?.tags || staticPost?.tags || [];

  const url = `${BASE_URL}/blog/${slug}`;

  // Related posts — try API, fall back to static
  const allApiPosts = await fetchBlogPosts();
  let relatedPosts: { slug: string; title: string; coverImage: string; readingTime: number }[];
  if (allApiPosts.length > 1) {
    relatedPosts = allApiPosts
      .filter(p => p.slug !== slug)
      .slice(0, 2)
      .map(p => ({ slug: p.slug, title: p.title, coverImage: p.cover_image, readingTime: p.reading_time }));
  } else {
    relatedPosts = getStaticRelated(slug).map(p => ({ slug: p.slug, title: p.title, coverImage: p.coverImage, readingTime: p.readingTime }));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    image: coverImage,
    datePublished: date,
    author: { "@type": "Organization", name: author, url: BASE_URL },
    publisher: { "@type": "Organization", name: "Garden State AI", url: BASE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        {coverImage ? (
          <div className="relative aspect-[21/9] w-full md:aspect-[3/1] bg-gradient-to-br from-navy via-indigo-900 to-navy">
            {/* Use img for external municipal seals, Image for internal photos */}
            {coverImage.startsWith("/") || coverImage.includes("mlsmatrix") || coverImage.includes("paragonrels") ? (
              <Image src={coverImage} alt={title} fill className="object-cover" sizes="100vw" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={coverImage} alt={title} className="max-h-32 max-w-64 object-contain opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </div>
        ) : (
          <div className="aspect-[21/9] w-full md:aspect-[4/1] bg-gradient-to-br from-navy via-indigo-900 to-navy" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-3xl px-4 pb-8 md:pb-12">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryColors[category] || "bg-gray-600 text-white"}`}>
                {categoryLabels[category] || category}
              </span>
              <span className="text-xs text-gray-300">{readingTime} min read</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl leading-tight">{title}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
              <span className="font-medium text-white">{author}</span>
              {authorRole && (<><span>&middot;</span><span>{authorRole}</span></>)}
              <span>&middot;</span>
              <time dateTime={date}>
                {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{tag}</span>
            ))}
          </div>
          <ShareButtons url={url} title={title} />
        </div>

        {renderArticleBody(contentHtml || renderContent(content))}

        <div className="mt-10 flex items-center justify-between rounded-xl bg-gray-50 p-5">
          <p className="text-sm font-medium text-gray-600">Found this useful? Share it.</p>
          <ShareButtons url={url} title={title} />
        </div>

        {/* CTA */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-indigo-900 p-8 text-center text-white md:p-10">
          <h3 className="text-2xl font-bold">Want a Personalized Market Analysis?</h3>
          <p className="mx-auto mt-3 max-w-lg text-gray-300">
            Get an AI-powered CMA for your property — free, instant, no obligation.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sell" className="rounded-xl bg-gold px-8 py-3 font-bold text-navy transition hover:bg-yellow-400 hover:shadow-lg">
              Get My Free Valuation
            </Link>
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20just%20read%20your%20blog%20and%20want%20a%20CMA"
              target="_blank" rel="noopener noreferrer"
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
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">Related Articles</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group flex gap-4 rounded-xl border bg-white p-4 transition hover:shadow-md">
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

        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">&larr; All Articles</Link>
        </div>
      </article>
    </>
  );
}

/** Convert markdown to HTML using marked, with link targets */
function renderContent(md: string): string {
  // Remove X/Twitter links from prose — they render as native embeds below
  const cleaned = md.replace(
    /\[([^\]]+)\]\(https:\/\/(x|twitter)\.com\/\w+\/(i\/)?status\/\d+[^)]*\)/g,
    ""
  );

  const renderer = new Renderer();
  renderer.link = ({ href, text }: { href: string; text: string }) => {
    const isInternal = href.startsWith("/") || href.includes("gardenstate.ai");
    const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
    const isCTA = /free|check|gardenstate\.ai\/news/i.test(text);
    if (isCTA) {
      return `<a href="${href}"${target} class="not-prose inline-block mt-2 mb-4 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition no-underline">${text}</a>`;
    }
    return `<a href="${href}"${target}>${text}</a>`;
  };

  const result = marked.parse(cleaned, { renderer, gfm: true, breaks: false, async: false });
  // Safety: if marked somehow returns a Promise, fall back to raw content
  if (typeof result !== "string") {
    console.error("[blog] marked.parse returned non-string:", typeof result);
    return cleaned.replace(/\n/g, "<br>");
  }
  return result;
}

const PROSE_CLASSES = `prose prose-lg prose-gray max-w-none
  prose-headings:text-navy prose-headings:font-extrabold
  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5
  prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
  prose-p:leading-relaxed prose-p:text-gray-700 prose-p:mb-6
  prose-a:text-indigo-600 prose-a:font-medium hover:prose-a:text-indigo-800
  prose-strong:text-navy
  prose-ul:my-6 prose-ol:my-6
  prose-li:text-gray-700 prose-li:leading-relaxed prose-li:mb-2
  prose-table:border prose-table:rounded-lg prose-table:overflow-hidden
  prose-th:bg-navy prose-th:text-white prose-th:px-4 prose-th:py-2.5 prose-th:text-sm prose-th:font-semibold
  prose-td:px-4 prose-td:py-2.5 prose-td:border-t prose-td:text-sm
  prose-blockquote:border-l-gold prose-blockquote:bg-gold/5 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:my-8
  prose-hr:my-10`;

/** Split HTML around embeds (iframes, twitter blockquotes) — render outside prose */
function renderArticleBody(html: string) {
  // Split on iframes OR twitter-tweet blockquotes (including trailing script tag)
  const parts = html.split(
    /(<iframe[^>]*><\/iframe>|<iframe[^>]*\/>|<blockquote class="twitter-tweet"[\s\S]*?<\/blockquote>\s*(?:<script[^>]*><\/script>)?)/gi
  );

  return (
    <>
      {parts.map((part, i) => {
        const trimmed = part.trim();
        if (!trimmed) return null;

        // Iframe embed
        if (trimmed.toLowerCase().startsWith("<iframe")) {
          const src = trimmed.match(/src="([^"]+)"/)?.[1] || "";
          const width = trimmed.match(/width="([^"]+)"/)?.[1] || "550";
          const height = trimmed.match(/height="([^"]+)"/)?.[1] || "450";
          return (
            <div key={i} className="my-8 flex justify-center">
              <iframe
                src={src}
                width={width}
                height={height}
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                style={{ borderRadius: 12, maxWidth: "100%" }}
                title="Embedded post"
              />
            </div>
          );
        }

        // Twitter/X embed blockquote — render with widget script
        if (trimmed.includes("twitter-tweet")) {
          return (
            <div
              key={i}
              className="my-8 flex justify-center not-prose"
              dangerouslySetInnerHTML={{
                __html: trimmed + (trimmed.includes("widgets.js") ? "" : '<script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>'),
              }}
            />
          );
        }

        // Regular HTML content — render in prose wrapper
        return (
          <div
            key={i}
            className={PROSE_CLASSES}
            dangerouslySetInnerHTML={{ __html: trimmed }}
          />
        );
      })}
    </>
  );
}
