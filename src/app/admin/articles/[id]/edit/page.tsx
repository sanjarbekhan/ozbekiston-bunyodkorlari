"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadArticle() {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setErrorText("Maqola topilmadi.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setCategory(data.category || "");
      setImageUrl(data.image_url || "");
      setDescription(data.description || "");
      setContent(data.content || "");
      setStatus(data.status || "draft");
      setLoading(false);
    }

    loadArticle();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrorText("");

    const { error } = await supabase
      .from("articles")
      .update({
        title,
        slug,
        category,
        image_url: imageUrl,
        description,
        content,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    setSaving(false);

    if (error) {
      setErrorText(error.message);
      return;
    }

    router.push("/admin");
  }

  async function handleDelete() {
    const ok = confirm("Rostdan ham bu maqolani o‘chirmoqchimisiz?");
    if (!ok) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", params.id);

    if (error) {
      setErrorText(error.message);
      return;
    }

    router.push("/admin");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] p-8">
        <p>Yuklanmoqda...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] p-6 text-[#14231b]">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Maqolani tahrirlash</h1>

          <button
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            O‘chirish
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">Ism familiya / Sarlavha</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Slug / Link</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Kategoriya</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Rasm URL</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Qisqa tavsif</label>
            <textarea
              className="min-h-24 w-full rounded-xl border px-4 py-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Maqola matni</label>
            <textarea
              className="min-h-80 w-full rounded-xl border px-4 py-3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Status</label>
            <select
              className="w-full rounded-xl border px-4 py-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>

          {errorText && (
            <p className="rounded-xl bg-red-50 p-4 text-red-600">{errorText}</p>
          )}

          <button
            disabled={saving}
            className="rounded-xl bg-[#0f3d2e] px-6 py-3 font-semibold text-white"
          >
            {saving ? "Saqlanmoqda..." : "O‘zgarishlarni saqlash"}
          </button>
        </form>
      </section>
    </main>
  );
}