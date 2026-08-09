"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ContentBlock } from "@/lib/article-types";
import CategoryPicker from "@/components/admin/CategoryPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";

const ADMIN_EMAIL = "sanjarhasanov465@gmail.com";

type ArticleDraft = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  image_url: string;
  description: string;
  content: string;
  content_blocks: ContentBlock[];
  video_url: string;
  status: "draft" | "published" | "archived";
  author_name: string;
  author_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  social_title: string;
  social_description: string;
  social_image_url: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[ʻʼ‘’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReading(blocks: ContentBlock[], fallback: string) {
  const text = blocks.map((block) => block.te || block.caption || "").join(" ") || fallback;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function newBlock(type: ContentBlock["ty"]): ContentBlock {
  const block: ContentBlock = { id: crypto.randomUUID(), ty: type };
  if (type === "heading") return { ...block, te: "", le: 2 };
  if (type === "quote") return { ...block, te: "", author: "" };
  if (["image", "video", "file"].includes(type)) {
    return { ...block, url: "", title: "", caption: "" };
  }
  return { ...block, te: "" };
}

function blockLabel(type: string) {
  const labels: Record<string, string> = {
    heading: "Sarlavha",
    text: "Matn",
    html: "Matn",
    preface: "Kirish matni",
    image: "Rasm",
    video: "Video",
    file: "Fayl",
    quote: "Iqtibos",
  };
  return labels[type] || type;
}

function firstDroppedFile(event: React.DragEvent, acceptImageOnly = false) {
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (!file) return null;
  if (acceptImageOnly && !file.type.startsWith("image/")) return null;
  return file;
}

export default function MobileArticleEditor({ initial }: { initial?: Partial<ArticleDraft> }) {
  const router = useRouter();
  const initialStatus = initial?.status || "draft";
  const [form, setForm] = useState<ArticleDraft>({
    id: initial?.id,
    title: initial?.title || "",
    slug: initial?.slug || "",
    category: initial?.category || "",
    image_url: initial?.image_url || "",
    description: initial?.description || "",
    content: initial?.content || "",
    content_blocks:
      Array.isArray(initial?.content_blocks) && initial!.content_blocks!.length > 0
        ? initial!.content_blocks!
        : [{ id: "initial-text", ty: "text", te: "" }],
    video_url: initial?.video_url || "",
    status: initialStatus,
    author_name:
      initial?.author_name || "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi tahririyati",
    author_url: initial?.author_url || "https://www.bunyodkor.com",
    seo_title: initial?.seo_title || "",
    seo_description: initial?.seo_description || "",
    seo_keywords: initial?.seo_keywords || "",
    social_title: initial?.social_title || "",
    social_description: initial?.social_description || "",
    social_image_url: initial?.social_image_url || "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mainDrag, setMainDrag] = useState(false);

  const publicUrl = useMemo(
    () => `/bunyodkorlar/${form.slug || slugify(form.title)}`,
    [form.slug, form.title]
  );

  function patch(values: Partial<ArticleDraft>) {
    setForm((current) => ({ ...current, ...values }));
  }

  function addBlock(type: ContentBlock["ty"]) {
    patch({ content_blocks: [...form.content_blocks, newBlock(type)] });
  }

  function updateBlock(index: number, values: Partial<ContentBlock>) {
    patch({
      content_blocks: form.content_blocks.map((block, i) =>
        i === index ? { ...block, ...values } : block
      ),
    });
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.content_blocks.length) return;
    const next = [...form.content_blocks];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ content_blocks: next });
  }

  async function upload(file: File, onDone: (url: string) => void) {
    setBusy(true);
    setMessage("Fayl yuklanmoqda...");
    const extension = file.name.split(".").pop() || "bin";
    const path = `articles/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("article-media")
      .upload(path, file, { cacheControl: "31536000" });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    const { data } = supabase.storage.from("article-media").getPublicUrl(path);
    onDone(data.publicUrl);
    setMessage("Fayl yuklandi.");
    setBusy(false);
  }

  function uploadMainImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("Faqat rasm faylini tashlang.");
      return;
    }
    upload(file, (url) =>
      patch({
        image_url: url,
        social_image_url: form.social_image_url || url,
      })
    );
  }

  async function save(nextStatus: ArticleDraft["status"]) {
    if (!form.title.trim()) {
      setMessage("Avval ism va familiyani kiriting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setBusy(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getUser();
    if (auth.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      setMessage("Bu hisobga admin ruxsati berilmagan.");
      setBusy(false);
      return;
    }

    const slug = form.slug.trim() || slugify(form.title);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug,
      category: form.category || null,
      image_url: form.image_url || null,
      description: form.description || null,
      content: form.content || null,
      content_blocks: form.content_blocks,
      video_url: form.video_url || null,
      status: nextStatus,
      author_name: form.author_name || null,
      author_url: form.author_url || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      seo_keywords: form.seo_keywords || null,
      social_title: form.social_title || null,
      social_description: form.social_description || null,
      social_image_url: form.social_image_url || form.image_url || null,
      canonical_url: `https://www.bunyodkor.com/bunyodkorlar/${slug}`,
      reading_minutes: estimateReading(form.content_blocks, form.content),
      updated_by: auth.user.id,
    };

    if (nextStatus === "published" && initialStatus !== "published") {
      payload.published_at = new Date().toISOString();
    }
    if (nextStatus !== "published" && initialStatus === "published") {
      payload.published_at = null;
    }

    const query = form.id
      ? supabase.from("articles").update(payload).eq("id", form.id)
      : supabase.from("articles").insert({ ...payload, created_by: auth.user.id });

    const { error } = await query;
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function remove() {
    if (!form.id || !confirm("Maqola butunlay o‘chirilsinmi?")) return;
    setBusy(true);
    const { error } = await supabase.from("articles").delete().eq("id", form.id);
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 text-[#111827] md:pb-12">
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-5 md:py-8">
        <header className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-extrabold text-[#0043a4] shadow-sm"
          >
            ← Orqaga
          </button>
          <div className="min-w-0 text-right">
            <h1 className="truncate text-xl font-black sm:text-2xl">
              {form.id ? "Maqolani tahrirlash" : "Yangi maqola"}
            </h1>
            <p className="truncate text-xs font-medium text-slate-500">{publicUrl}</p>
          </div>
        </header>

        {message && (
          <div className="mb-4 rounded-2xl border border-[#0043a4]/10 bg-white p-4 text-sm font-bold shadow-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <section className="rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] sm:p-6">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[#0043a4]">1. Asosiy ma’lumot</p>
            <label className="block text-sm font-extrabold">Ism va familiya</label>
            <input
              value={form.title}
              onChange={(event) =>
                patch({
                  title: event.target.value,
                  slug: form.slug || slugify(event.target.value),
                })
              }
              placeholder="Masalan: Rustamov Shaxriyor"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base font-bold outline-none transition focus:border-[#0043a4] focus:bg-white"
            />

            <label className="mt-5 block text-sm font-extrabold">Qisqa tavsif</label>
            <textarea
              value={form.description}
              onChange={(event) => patch({ description: event.target.value })}
              placeholder="Masalan: TDIU talabasi, ilmiy maqolalar muallifi..."
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
            />
          </section>

          <section
            onDragEnter={(event) => {
              event.preventDefault();
              setMainDrag(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setMainDrag(false)}
            onDrop={(event) => {
              setMainDrag(false);
              const file = firstDroppedFile(event, true);
              if (file) uploadMainImage(file);
            }}
            className={`rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] transition sm:p-6 ${
              mainDrag ? "ring-2 ring-[#0f68ff] ring-offset-2" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0043a4]">2. Asosiy rasm</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Rasmni tanlang yoki kompyuterdan shu joyga sudrab tashlang.</p>
              </div>
            </div>

            {form.image_url ? (
              <div className="mt-4 overflow-hidden rounded-[22px] border-2 border-dashed border-transparent bg-[#eef3fb]">
                <img src={form.image_url} alt="Asosiy rasm" className="max-h-[520px] w-full object-contain" />
              </div>
            ) : (
              <div className="mt-4 flex min-h-52 items-center justify-center rounded-[22px] border-2 border-dashed border-[#0043a4]/25 bg-[#f7faff] px-6 text-center">
                <div>
                  <p className="text-base font-black text-[#0043a4]">Rasmni shu yerga tashlang</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">yoki pastdagi tugma orqali tanlang</p>
                </div>
              </div>
            )}

            <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-[#eaf2ff] px-5 py-3 text-center text-sm font-extrabold text-[#0043a4]">
              {form.image_url ? "Rasmni almashtirish" : "+ Rasm yuklash"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMainImage(file);
                }}
              />
            </label>
          </section>

          <section className="rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0043a4]">3. Yo‘nalish</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Bir nechta yo‘nalishni tanlash yoki yangisini qo‘shish mumkin.</p>
            <CategoryPicker value={form.category} onChange={(category) => patch({ category })} />
          </section>

          <section className="rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0043a4]">4. Maqola</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Tayyor formatlangan maqolani to‘g‘ridan-to‘g‘ri paste qiling — sarlavha, jirniy, kursiv va qatorlar saqlanadi.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                ["text", "+ Matn"],
                ["heading", "+ Sarlavha"],
                ["image", "+ Rasm"],
                ["quote", "+ Iqtibos"],
                ["video", "+ Video"],
                ["file", "+ Fayl"],
              ] as const).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="min-h-11 rounded-xl bg-[#eef3fb] px-3 py-2 text-sm font-extrabold text-[#243247]"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {form.content_blocks.map((block, index) => (
                <article key={block.id || index} className="rounded-[20px] border border-slate-200 bg-[#fbfcfe] p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#0043a4] shadow-sm">
                      {index + 1}. {blockLabel(block.ty)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="Yuqoriga" onClick={() => moveBlock(index, -1)} className="h-9 w-9 rounded-full bg-white font-black text-slate-600 shadow-sm">↑</button>
                      <button type="button" aria-label="Pastga" onClick={() => moveBlock(index, 1)} className="h-9 w-9 rounded-full bg-white font-black text-slate-600 shadow-sm">↓</button>
                      <button
                        type="button"
                        aria-label="O‘chirish"
                        onClick={() => patch({ content_blocks: form.content_blocks.filter((_, i) => i !== index) })}
                        className="h-9 w-9 rounded-full bg-red-50 font-black text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {block.ty === "heading" && (
                    <input
                      value={block.te || ""}
                      onChange={(event) => updateBlock(index, { te: event.target.value })}
                      placeholder="Bo‘lim sarlavhasi"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-extrabold outline-none focus:border-[#0043a4]"
                    />
                  )}

                  {["text", "html", "preface"].includes(block.ty) && (
                    <RichTextEditor
                      value={block.te || ""}
                      onChange={(value) => updateBlock(index, { te: value })}
                    />
                  )}

                  {block.ty === "quote" && (
                    <div className="space-y-2">
                      <textarea
                        value={block.te || ""}
                        onChange={(event) => updateBlock(index, { te: event.target.value })}
                        placeholder="Iqtibos yoki shaxsiy fikr"
                        className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none focus:border-[#0043a4]"
                      />
                      <input
                        value={block.author || ""}
                        onChange={(event) => updateBlock(index, { author: event.target.value })}
                        placeholder="Muallif (ixtiyoriy)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#0043a4]"
                      />
                    </div>
                  )}

                  {["image", "video", "file"].includes(block.ty) && (
                    <div className="space-y-3">
                      {block.ty === "image" && block.url && (
                        <img src={block.url} alt={block.caption || "Maqola rasmi"} className="max-h-96 w-full rounded-xl object-contain" />
                      )}
                      {block.ty === "video" && block.url && (
                        <video src={block.url} controls className="max-h-96 w-full rounded-xl bg-black" />
                      )}

                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          const file = firstDroppedFile(event, block.ty === "image");
                          if (file) upload(file, (url) => updateBlock(index, { url, title: file.name }));
                        }}
                        className="rounded-xl border-2 border-dashed border-[#0043a4]/20 bg-[#f7faff] p-2"
                      >
                        <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-lg px-4 py-3 text-center text-sm font-extrabold text-[#0043a4]">
                          {block.url ? "Faylni almashtirish yoki shu yerga tashlash" : "+ Fayl tanlash yoki shu yerga tashlash"}
                          <input
                            type="file"
                            accept={block.ty === "image" ? "image/*" : block.ty === "video" ? "video/*" : "*/*"}
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) upload(file, (url) => updateBlock(index, { url, title: file.name }));
                            }}
                          />
                        </label>
                      </div>

                      <input
                        value={block.caption || ""}
                        onChange={(event) => updateBlock(index, { caption: event.target.value })}
                        placeholder="Izoh (ixtiyoriy)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#0043a4]"
                      />
                      <details className="text-sm">
                        <summary className="cursor-pointer font-bold text-slate-500">URL orqali kiritish</summary>
                        <input
                          value={block.url || ""}
                          onChange={(event) => updateBlock(index, { url: event.target.value })}
                          placeholder="https://..."
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0043a4]"
                        />
                      </details>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <details className="rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.05)] sm:p-6">
            <summary className="cursor-pointer list-none text-base font-black text-[#243247]">
              ⚙️ Qo‘shimcha sozlamalar
              <span className="ml-2 text-sm font-medium text-slate-400">SEO, slug, muallif...</span>
            </summary>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-extrabold">
                Slug
                <input value={form.slug} onChange={(event) => patch({ slug: slugify(event.target.value) })} className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium" />
              </label>
              <label className="text-sm font-extrabold">
                Status
                <select value={form.status} onChange={(event) => patch({ status: event.target.value as ArticleDraft["status"] })} className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium">
                  <option value="draft">Qoralama</option>
                  <option value="published">E’lon qilingan</option>
                  <option value="archived">Arxiv</option>
                </select>
              </label>
              <label className="text-sm font-extrabold sm:col-span-2">
                Kategoriya matni
                <input value={form.category} onChange={(event) => patch({ category: event.target.value })} placeholder="Ta'lim;Sport" className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium" />
              </label>
              <label className="text-sm font-extrabold">
                Muallif
                <input value={form.author_name} onChange={(event) => patch({ author_name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium" />
              </label>
              <label className="text-sm font-extrabold">
                Muallif havolasi
                <input value={form.author_url} onChange={(event) => patch({ author_url: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium" />
              </label>
              <label className="text-sm font-extrabold sm:col-span-2">
                Asosiy video URL
                <input value={form.video_url} onChange={(event) => patch({ video_url: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 font-medium" />
              </label>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <h2 className="text-lg font-black">Google SEO</h2>
              <div className="mt-3 space-y-3">
                <input value={form.seo_title} onChange={(event) => patch({ seo_title: event.target.value })} placeholder="SEO Title" className="w-full rounded-xl border border-slate-200 p-3.5" />
                <textarea value={form.seo_description} onChange={(event) => patch({ seo_description: event.target.value })} placeholder="SEO Description" className="min-h-24 w-full rounded-xl border border-slate-200 p-3.5" />
                <input value={form.seo_keywords} onChange={(event) => patch({ seo_keywords: event.target.value })} placeholder="SEO Keywords" className="w-full rounded-xl border border-slate-200 p-3.5" />
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <h2 className="text-lg font-black">Ijtimoiy tarmoqlar</h2>
              <div className="mt-3 space-y-3">
                <input value={form.social_title} onChange={(event) => patch({ social_title: event.target.value })} placeholder="Social title" className="w-full rounded-xl border border-slate-200 p-3.5" />
                <textarea value={form.social_description} onChange={(event) => patch({ social_description: event.target.value })} placeholder="Social description" className="min-h-24 w-full rounded-xl border border-slate-200 p-3.5" />
                <input value={form.social_image_url} onChange={(event) => patch({ social_image_url: event.target.value })} placeholder="Social image URL" className="w-full rounded-xl border border-slate-200 p-3.5" />
              </div>
            </div>

            <details className="mt-7 border-t border-slate-200 pt-5">
              <summary className="cursor-pointer text-sm font-extrabold text-slate-500">Eski HTML matni</summary>
              <textarea value={form.content} onChange={(event) => patch({ content: event.target.value })} className="mt-3 min-h-64 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs" />
            </details>

            {form.id && (
              <button type="button" onClick={remove} disabled={busy} className="mt-7 w-full rounded-2xl bg-red-50 px-5 py-3.5 text-sm font-extrabold text-red-600 disabled:opacity-50">
                Maqolani o‘chirish
              </button>
            )}
          </details>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,.08)] backdrop-blur md:static md:mx-auto md:mt-2 md:max-w-4xl md:border-0 md:bg-transparent md:px-5 md:shadow-none">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={busy || !form.title.trim()}
            className="min-h-12 rounded-2xl border border-[#0043a4]/20 bg-white px-4 py-3 text-sm font-extrabold text-[#0043a4] disabled:opacity-40"
          >
            Qoralama saqlash
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={busy || !form.title.trim()}
            className="min-h-12 rounded-2xl bg-[#0043a4] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-900/10 disabled:opacity-40"
          >
            {busy ? "Saqlanmoqda..." : initialStatus === "published" ? "Yangilash" : "E’lon qilish"}
          </button>
        </div>
      </div>
    </main>
  );
}
