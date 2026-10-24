"use client";

import { useEffect, useState, useCallback } from "react";
import BlogEditor from "@/components/BlogEditor";
import { adminProxy } from "@/lib/admin-client";

type StatusFilter = "all" | "published" | "draft";

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html?: string;
  content?: string;
  category: string;
  tags: string[];
  cover_image: string;
  reading_time: number;
  author?: string;
  author_role?: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function BlogManager() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [generating, setGenerating] = useState<"article" | "guides" | null>(null);
  const [notice, setNotice] = useState("");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProxy("/api/idx/admin/blog/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : data.articles ?? data.posts ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function togglePublish(article: BlogArticle) {
    const action = article.status === "published" ? "unpublish" : "publish";
    try {
      await adminProxy(`/api/idx/admin/blog/articles/${article.id}/${action}`, "POST");
      await fetchArticles();
    } catch { /* ignore */ }
  }

  async function deleteArticle(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await adminProxy(`/api/idx/blog/articles/${id}`, "DELETE");
      await fetchArticles();
    } catch { /* ignore */ }
  }

  async function generate(kind: "article" | "guides") {
    setGenerating(kind);
    setNotice("");
    try {
      if (kind === "guides") {
        const dedicated = await adminProxy("/api/idx/admin/blog/generate-city-tax-guides", "POST");
        if (dedicated.status === 404) {
          const fallback = await adminProxy("/api/idx/admin/blog/generate", "POST", { type: "city-tax-guides" });
          if (!fallback.ok) throw new Error("generate failed");
        } else if (!dedicated.ok) {
          throw new Error("generate failed");
        }
        setNotice("City tax guide generation started.");
      } else {
        const res = await adminProxy("/api/idx/admin/blog/generate", "POST");
        if (!res.ok) throw new Error("generate failed");
        setNotice("Article generation started.");
      }
      await fetchArticles();
    } catch {
      setNotice("Generate request failed. Stay signed in and try again.");
    }
    setGenerating(null);
  }

  async function startEditing(article: BlogArticle) {
    try {
      const res = await adminProxy(`/api/idx/admin/blog/articles/${article.id}`);
      if (res.ok) {
        const full = await res.json();
        const articleBody = full.article || full;
        setEditing({ ...article, ...articleBody });
        return;
      }
    } catch { /* fallback to the list row */ }
    setEditing(article);
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    fetchArticles();
  }

  if (editing || creating) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <button
            onClick={() => { setEditing(null); setCreating(false); }}
            className="mb-4 text-sm text-gray-500 hover:text-navy font-medium"
          >
            &larr; Back to articles
          </button>
          <BlogEditor article={editing ?? undefined} onSaved={handleSaved} />
        </div>
      </div>
    );
  }

  const visible = articles.filter((article) => {
    if (filter === "published") return article.status === "published";
    if (filter === "draft") return article.status !== "published";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Blog Manager</h1>
            <p className="text-sm text-gray-500 mt-1">{visible.length} of {articles.length} articles</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generate("article")}
              disabled={generating !== null}
              className="rounded-lg border border-navy px-4 py-2.5 text-sm font-bold text-navy hover:bg-navy hover:text-white disabled:opacity-50"
            >
              {generating === "article" ? "Generating..." : "Generate Article"}
            </button>
            <button
              onClick={() => generate("guides")}
              disabled={generating !== null}
              className="rounded-lg border border-navy px-4 py-2.5 text-sm font-bold text-navy hover:bg-navy hover:text-white disabled:opacity-50"
            >
              {generating === "guides" ? "Generating..." : "Generate City Tax Guides"}
            </button>
            <button
              onClick={() => setCreating(true)}
              className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400 transition"
            >
              + New Article
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {(["all", "published", "draft"] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                filter === tab ? "bg-navy text-white" : "bg-white text-gray-600 border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {notice && <p className="mb-4 text-sm text-gray-600">{notice}</p>}

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading articles...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Read</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy max-w-[320px] truncate">
                      {a.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{a.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          a.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString() : "--"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {a.reading_time ? `${a.reading_time} min` : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(a)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublish(a)}
                          className={`text-xs font-medium ${
                            a.status === "published"
                              ? "text-yellow-600 hover:text-yellow-800"
                              : "text-emerald-600 hover:text-emerald-800"
                          }`}
                        >
                          {a.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => deleteArticle(a.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No articles yet. Click &quot;+ New Article&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
