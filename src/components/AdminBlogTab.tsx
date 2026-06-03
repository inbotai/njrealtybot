"use client";

import { useEffect, useState } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  cover_image: string;
  reading_time: number;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlogTab({ password }: { password: string }) {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${password}` };

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/blog/articles`, { headers });
      if (res.ok) setArticles(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { fetchArticles(); }, []);

  async function generateArticle() {
    setGenerating(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/blog/generate`, { method: "POST", headers });
      if (res.ok) await fetchArticles();
    } catch { /* ignore */ }
    setGenerating(false);
  }

  async function togglePublish(article: BlogArticle) {
    const action = article.status === "published" ? "unpublish" : "publish";
    await fetch(`${IDX_API}/api/idx/admin/blog/articles/${article.id}/${action}`, { method: "POST", headers });
    await fetchArticles();
  }

  async function deleteArticle(id: string) {
    await fetch(`${IDX_API}/api/idx/admin/blog/articles/${id}`, { method: "DELETE", headers });
    await fetchArticles();
  }

  function openEdit(article: BlogArticle) {
    setEditing(article);
    setEditTitle(article.title);
    setEditExcerpt(article.excerpt);
    setEditContent(article.content || "");
    setEditTags(article.tags.join(", "));
    setPreview(false);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch(`${IDX_API}/api/idx/admin/blog/articles/${editing.id}`, {
      method: "PUT", headers,
      body: JSON.stringify({
        title: editTitle,
        excerpt: editExcerpt,
        content: editContent,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
      }),
    });
    setEditing(null);
    await fetchArticles();
    setSaving(false);
  }

  if (loading) return <div className="py-10 text-center text-gray-400">Loading blog articles...</div>;

  // Edit modal
  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy">Edit Article</h3>
          <button onClick={() => setEditing(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Title" />
        <textarea value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} placeholder="Excerpt" />
        <div className="flex gap-2">
          <button onClick={() => setPreview(false)}
            className={`px-3 py-1 text-xs font-medium rounded ${!preview ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}>
            Edit
          </button>
          <button onClick={() => setPreview(true)}
            className={`px-3 py-1 text-xs font-medium rounded ${preview ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}>
            Preview
          </button>
        </div>
        {preview ? (
          <div className="prose prose-sm max-w-none rounded-lg border bg-white p-4"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(editContent) }} />
        ) : (
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono" rows={20} placeholder="Markdown content" />
        )}
        <input value={editTags} onChange={e => setEditTags(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Tags (comma separated)" />
        <button onClick={saveEdit} disabled={saving}
          className="rounded-lg bg-navy px-6 py-2 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Blog Articles ({articles.length})
        </h3>
        <button onClick={generateArticle} disabled={generating}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
          {generating ? "Generating..." : "Generate New Article"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 font-medium text-gray-500">Created</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy max-w-[300px] truncate">{a.title}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.category}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                    <button onClick={() => togglePublish(a)}
                      className={`text-xs font-medium ${a.status === "published" ? "text-yellow-600 hover:text-yellow-800" : "text-emerald-600 hover:text-emerald-800"}`}>
                      {a.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => deleteArticle(a.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No blog articles yet. Click &quot;Generate New Article&quot; to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function simpleMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br/><br/>");
}
