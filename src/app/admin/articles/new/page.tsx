"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .replaceAll("‘", "")
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll("oʻ", "o")
    .replaceAll("o‘", "o")
    .replaceAll("gʻ", "g")
    .replaceAll("g‘", "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setErrorText("");

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(filePath, file);

    if (error) {
      setErrorText(error.message);
      setUploadingImage(false);
      return;
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    setImageUrl(data.publicUrl);
    setUploadingImage(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    const finalSlug = slug.trim() || makeSlug(title);

    const { error } = await supabase.from("articles").insert({
      title,
      slug: finalSlug,
      category,
      image_url: imageUrl,
      description,
      content,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    setLoading(false);

    if (error) {
      setErrorText(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] p-6 text-[#14231b]">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold">Yangi maqola qo‘shish</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              Ism familiya / Sarlavha
            </label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(makeSlug(e.target.value));
              }}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Slug / Link</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="muminova-dilnura"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Kategoriya</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ta'lim;Sport;Huquq"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Rasm yuklash</label>

            <input
              type="file"
              accept="image/*"
              className="w-full rounded-xl border px-4 py-3"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uploadImage(file);
                }
              }}
            />

            {uploadingImage && (
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                Rasm yuklanmoqda...
              </p>
            )}

            {imageUrl && (
              <div className="mt-4 rounded-2xl bg-[#f7f3ea] p-4">
                <img
                  src={imageUrl}
                  alt="Yuklangan rasm"
                  className="mb-3 h-64 w-full rounded-2xl object-cover"
                />

                <label className="mb-2 block text-sm font-semibold">
                  Rasm URL
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-3"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            )}
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
              placeholder="<h2>Biografiya</h2><p>Matn...</p>"
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
            <p className="rounded-xl bg-red-50 p-4 text-red-600">
              {errorText}
            </p>
          )}

          <button
            disabled={loading || uploadingImage}
            className="rounded-xl bg-[#0f3d2e] px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saqlanmoqda..." : "Maqolani saqlash"}
          </button>
        </form>
      </section>
    </main>
  );
}