import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getPost } from "@/data/blog-posts";
import RequireAuth from "@/components/RequireAuth";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <RequireAuth>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-navy">&larr; Back to Blog</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">{post.title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.author}
        </p>
        <div className="mt-8 prose prose-sm prose-gray max-w-none
          prose-headings:text-navy prose-headings:font-bold
          prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-navy
          prose-table:border prose-th:bg-navy prose-th:text-white prose-th:px-3 prose-th:py-2
          prose-td:px-3 prose-td:py-2 prose-td:border"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />
        <div className="mt-12 rounded-xl bg-navy p-6 text-center text-white">
          <p className="font-bold">Want a personalized market analysis?</p>
          <Link href="/sell" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2.5 font-bold text-navy hover:bg-yellow-400">
            Get My Free Valuation
          </Link>
        </div>
      </article>
    </RequireAuth>
  );
}

/** Simple markdown → HTML (headings, bold, links, tables, lists) */
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim());
      const isHeader = cells.every((c: string) => /^-+$/.test(c));
      if (isHeader) return '';
      const tag = 'td';
      return `<tr>${cells.map((c: string) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huptol])/gm, '')
    .replace(/^\s*$/gm, '');
}
