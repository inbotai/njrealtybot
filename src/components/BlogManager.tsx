"use client";

import { useEffect, useState, useCallback } from "react";
import BlogEditor from "@/components/BlogEditor";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

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

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/blog/posts?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : data.posts ?? data.articles ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function togglePublish(article: BlogArticle) {
    const action = article.status === "published" ? "unpublish" : "publish";
    try {
      await fetch(`${IDX_API}/api/idx/blog/articles/${article.id}/${action}`, { method: "POST" });
      await fetchArticles();
    } catch { /* ignore */ }
  }

  async function deleteArticle(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await fetch(`${IDX_API}/api/idx/blog/articles/${id}`, { method: "DELETE" });
      await fetchArticles();
    } catch { /* ignore */ }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Blog Manager</h1>
            <p className="text-sm text-gray-500 mt-1">{articles.length} articles</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400 transition"
          >
            + New Article
          </button>
        </div>

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
                {articles.map((a) => (
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
                          onClick={() => setEditing(a)}
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
                {articles.length === 0 && (
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
