"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { estimateReadingTime, getCategoryGradient, getCategoryColor } from "@/components/blog/reading-time";
import { Bold, Italic, Heading2, Heading3, List, Link2, Image, Eye, EyeOff, Clock } from "lucide-react";

const CATEGORY_PRESETS = ["guides", "rankings", "analysis", "news", "tutorials", "reviews"];

export function BlogEditor({
  postId,
  initialTitle = "",
  initialSlug = "",
  initialContent = "",
  initialCategory = "",
  initialTags = [],
  initialLanguage = "en",
  initialSeoTitle = "",
  initialSeoDescription = "",
  initialFeaturedImage = "",
  initialStatus = "DRAFT",
}: {
  postId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialContent?: string;
  initialCategory?: string;
  initialTags?: string[];
  initialLanguage?: string;
  initialSeoTitle?: string;
  initialSeoDescription?: string;
  initialFeaturedImage?: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const isEdit = !!postId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    title: initialTitle,
    slug: initialSlug,
    contentHtml: initialContent,
    category: initialCategory,
    tags: initialTags.join(", "),
    language: initialLanguage,
    seoTitle: initialSeoTitle,
    seoDescription: initialSeoDescription,
    featuredImageUrl: initialFeaturedImage,
    status: initialStatus,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !isEdit) {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 200);
      setForm((prev) => ({ ...prev, slug }));
    }
    // Auto-fill SEO title from title if empty
    if (field === "title" && !form.seoTitle) {
      setForm((prev) => ({ ...prev, seoTitle: (value + " | ReraPedia").slice(0, 70) }));
    }
  }

  function insertAtCursor(before: string, after: string = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.contentHtml.substring(start, end);
    const newContent = form.contentHtml.substring(0, start) + before + selected + after + form.contentHtml.substring(end);
    setForm((prev) => ({ ...prev, contentHtml: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  const toolbarButtons = [
    { icon: Bold, label: "Bold", action: () => insertAtCursor("<strong>", "</strong>") },
    { icon: Italic, label: "Italic", action: () => insertAtCursor("<em>", "</em>") },
    { icon: Heading2, label: "H2", action: () => insertAtCursor("<h2>", "</h2>") },
    { icon: Heading3, label: "H3", action: () => insertAtCursor("<h3>", "</h3>") },
    { icon: List, label: "List", action: () => insertAtCursor("<ul>\n<li>", "</li>\n</ul>") },
    { icon: Link2, label: "Link", action: () => insertAtCursor('<a href="">', "</a>") },
    { icon: Image, label: "Image", action: () => insertAtCursor('<img src="" alt="" class="rounded-lg" />') },
  ];

  const readTime = estimateReadingTime(form.contentHtml);
  const gradient = getCategoryGradient(form.category);
  const catColor = getCategoryColor(form.category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ...(isEdit ? { id: postId } : {}),
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/admin/blog");
      } else {
        setError(data.error ?? "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title + Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="e.g., How to Check RERA Status in 2026" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL Slug</label>
          <div className="mt-1 flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 shadow-sm">
            <span className="text-xs text-gray-400">/blog/</span>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} required className="w-full border-0 bg-transparent py-2.5 font-mono text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Content editor with toolbar */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Content *</label>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" /> {readTime} min read
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPreview ? "Editor" : "Preview"}
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        {!showPreview && (
          <div className="mt-1 flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5">
            {toolbarButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                title={btn.label}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm"
              >
                <btn.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        {showPreview ? (
          <div className="mt-1 min-h-[400px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Mini preview header */}
            <div className={`mb-6 rounded-xl bg-gradient-to-br ${gradient} p-4`}>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${catColor}`}>
                {form.category || "uncategorized"}
              </span>
              <h1 className="mt-2 text-xl font-extrabold text-white">{form.title || "Untitled"}</h1>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.contentHtml || "<p class='text-gray-400'>Start writing content...</p>" }} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={form.contentHtml}
            onChange={(e) => update("contentHtml", e.target.value)}
            rows={18}
            required
            placeholder="<h2>Your heading</h2>&#10;<p>Your content here...</p>"
            className={`w-full border border-gray-200 bg-white px-4 py-3 font-mono text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${showPreview ? "" : "rounded-b-xl"} ${!showPreview ? "rounded-b-xl" : "rounded-xl"}`}
          />
        )}
      </div>

      {/* Category + Tags + Language */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm capitalize focus:border-brand-primary focus:outline-none">
            <option value="">Select category</option>
            {CATEGORY_PRESETS.map((cat) => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
          {form.category && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${gradient}`} />
              <span className="text-xs text-gray-500">Color: {form.category}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="rera, gurgaon, tips" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
          {form.tags && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {form.tags.split(",").filter((t) => t.trim()).map((t) => (
                <span key={t.trim()} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-primary">#{t.trim()}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select value={form.language} onChange={(e) => update("language", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
        <input type="url" value={form.featuredImageUrl} onChange={(e) => update("featuredImageUrl", e.target.value)} placeholder="https://example.com/image.jpg" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
        {form.featuredImageUrl && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
            <img src={form.featuredImageUrl} alt="Preview" className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        {!form.featuredImageUrl && (
          <p className="mt-1 text-xs text-gray-400">Leave empty to use category gradient as header (blue for guides, green for rankings, etc.)</p>
        )}
      </div>

      {/* SEO Section */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">SEO Settings</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">SEO Title</label>
            <input type="text" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} maxLength={70} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
            <div className="mt-0.5 flex justify-between">
              <span className="text-[10px] text-gray-400">Shown in Google search results</span>
              <span className={`text-[10px] ${form.seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{form.seoTitle.length}/70</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">SEO Description</label>
            <textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} maxLength={160} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
            <div className="mt-0.5 flex justify-between">
              <span className="text-[10px] text-gray-400">Shown below title in search results</span>
              <span className={`text-[10px] ${form.seoDescription.length > 140 ? "text-amber-500" : "text-gray-400"}`}>{form.seoDescription.length}/160</span>
            </div>
          </div>
        </div>
        {/* Google preview */}
        {(form.seoTitle || form.title) && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Google Preview</p>
            <p className="mt-1 text-sm font-medium text-blue-700">{form.seoTitle || form.title}</p>
            <p className="text-xs text-green-700">rerapedia.com/blog/{form.slug}</p>
            <p className="text-xs text-gray-600">{form.seoDescription || "No description set"}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {form.status === "PUBLISHED" && (
          <p className="mt-5 text-xs text-green-600">This post will be visible on the public blog immediately.</p>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50">
          {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </button>
        <button type="button" onClick={() => router.push("/dashboard/admin/blog")} className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
