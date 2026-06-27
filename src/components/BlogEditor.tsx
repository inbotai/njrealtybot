"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";
const CATEGORIES = ["market", "news", "tips", "guide", "development"];

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
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogEditor({
  article,
  onSaved,
}: {
  article?: BlogArticle;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState(article?.category ?? "market");
  const [tags, setTags] = useState(article?.tags?.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? "");
  const [author, setAuthor] = useState(article?.author ?? "Garden State AI");
  const [authorRole, setAuthorRole] = useState(article?.author_role ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [slugManual, setSlugManual] = useState(!!article);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your article..." }),
    ],
    content: article?.content_html || article?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] px-6 py-4 focus:outline-none",
      },
    },
  });

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleSlugChange = useCallback((val: string) => {
    setSlugManual(true);
    setSlug(val);
  }, []);

  function insertEmbed() {
    if (!editor || !embedCode.trim()) return;
    editor.commands.insertContent(embedCode);
    setEmbedCode("");
    setShowEmbedModal(false);
  }

  async function save(publishStatus: "draft" | "published") {
    if (!editor || !title.trim() || !slug.trim()) {
      setStatus("Title and slug are required");
      return;
    }
    setSaving(true);
    setStatus("");

    const html = editor.getHTML();
    const payload = {
      slug,
      title,
      excerpt,
      content: "",
      content_html: html,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image: coverImage,
      reading_time: calcReadingTime(html),
      author,
      author_role: authorRole,
      status: publishStatus,
      published_at:
        publishStatus === "published"
          ? new Date().toISOString()
          : article?.published_at ?? null,
    };

    try {
      // Delete old article first if editing (no PUT without auth)
      if (article?.id) {
        await fetch(`${IDX_API}/api/idx/blog/articles/${article.id}`, {
          method: "DELETE",
        });
      }
      const res = await fetch(`${IDX_API}/api/idx/blog/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus(publishStatus === "published" ? "Published!" : "Saved as draft!");
        setTimeout(onSaved, 800);
      } else {
        const err = await res.text();
        setStatus(`Error: ${err}`);
      }
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    setSaving(false);
  }

  if (!editor) return null;

  const inputCls = "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gold";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
  const Sep = () => <span className="mx-1 h-5 w-px bg-gray-300" />;
  const TB = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-sm font-medium transition ${active ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-200"}`}
    >{children}</button>
  );

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-extrabold text-navy">
        {article ? "Edit Article" : "New Article"}
      </h2>

      {/* Metadata fields */}
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title"
          className="w-full text-2xl font-bold text-navy border-b border-gray-200 pb-2 outline-none placeholder:text-gray-300 focus:border-gold" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug">
            <input value={slug} onChange={(e) => handleSlugChange(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Excerpt">
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputCls} placeholder="Brief summary of the article" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="nj real estate, market update" />
          </Field>
          <Field label="Cover Image URL">
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Author">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Author Role">
            <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} className={inputCls} placeholder="AI Market Analyst" />
          </Field>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-xl border bg-gray-100 px-3 py-2 shadow-sm">
        <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</TB>
        <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</TB>
        <Sep />
        <TB active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</TB>
        <TB active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</TB>
        <Sep />
        <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet</TB>
        <TB active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered</TB>
        <TB active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</TB>
        <Sep />
        <TB onClick={() => { const u = window.prompt("Enter link URL:"); if (u) editor.chain().focus().setLink({ href: u }).run(); }}>Link</TB>
        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</TB>
        <Sep />
        <TB onClick={() => editor.chain().focus().undo().run()}>Undo</TB>
        <TB onClick={() => editor.chain().focus().redo().run()}>Redo</TB>
        <Sep />
        <TB onClick={() => setShowEmbedModal(true)}>Embed HTML</TB>
      </div>

      {/* Editor area */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</h3>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setShowPreview(!showPreview)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${showPreview ? "bg-navy text-white border-navy" : "text-gray-600 hover:bg-gray-100"}`}>
          {showPreview ? "Hide Preview" : "Preview"}
        </button>
        <div className="flex-1" />
        <button type="button" disabled={saving} onClick={() => save("draft")}
          className="rounded-lg border border-navy px-5 py-2 text-sm font-bold text-navy hover:bg-navy hover:text-white transition disabled:opacity-50">
          Save as Draft
        </button>
        <button type="button" disabled={saving} onClick={() => save("published")}
          className="rounded-lg bg-gold px-5 py-2 text-sm font-bold text-navy hover:bg-yellow-400 transition disabled:opacity-50">
          {saving ? "Saving..." : "Publish"}
        </button>
        {status && <span className={`text-sm font-medium ${status.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}>{status}</span>}
      </div>

      {/* Embed HTML Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmbedModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy mb-3">Embed HTML</h3>
            <textarea value={embedCode} onChange={(e) => setEmbedCode(e.target.value)} rows={8}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:border-gold"
              placeholder="Paste your embed code here (Twitter, YouTube, iframe, etc.)" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setEmbedCode(""); setShowEmbedModal(false); }}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={insertEmbed} disabled={!embedCode.trim()}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-40">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
