"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ContentBlock } from "@/lib/article-types";

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
  return value.toLowerCase()
    .replace(/[ʻʼ‘’']/g, "")
    .replace(/o[gʻ‘’']/g, "o")
    .replace(/g[ʻ‘’']/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReading(blocks: ContentBlock[], fallback: string) {
  const text = blocks.map((b) => b.te || b.caption || "").join(" ") || fallback;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ArticleEditor({ initial }: { initial?: Partial<ArticleDraft> }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleDraft>({
    title: initial?.title || "",
    slug: initial?.slug || "",
    category: initial?.category || "",
    image_url: initial?.image_url || "",
    description: initial?.description || "",
    content: initial?.content || "",
    content_blocks: Array.isArray(initial?.content_blocks) ? initial!.content_blocks! : [],
    video_url: initial?.video_url || "",
    status: initial?.status || "draft",
    author_name: initial?.author_name || "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi tahririyati",
    author_url: initial?.author_url || "https://bunyodkor.com",
    seo_title: initial?.seo_title || "",
    seo_description: initial?.seo_description || "",
    seo_keywords: initial?.seo_keywords || "",
    social_title: initial?.social_title || "",
    social_description: initial?.social_description || "",
    social_image_url: initial?.social_image_url || "",
    id: initial?.id,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"content" | "seo">("content");

  const publicUrl = useMemo(() => `/bunyodkorlar/${form.slug || slugify(form.title)}`, [form.slug, form.title]);

  function patch(values: Partial<ArticleDraft>) {
    setForm((current) => ({ ...current, ...values }));
  }

  function addBlock(ty: ContentBlock["ty"]) {
    const next: ContentBlock = { id: crypto.randomUUID(), ty };
    if (ty === "heading") Object.assign(next, { te: "Yangi bo‘lim", le: 2 });
    if (["text", "html", "preface"].includes(ty)) next.te = "";
    if (ty === "quote") Object.assign(next, { te: "", author: "" });
    if (["image", "video", "file"].includes(ty)) Object.assign(next, { url: "", title: "", caption: "" });
    patch({ content_blocks: [...form.content_blocks, next] });
  }

  function updateBlock(index: number, values: Partial<ContentBlock>) {
    patch({ content_blocks: form.content_blocks.map((block, i) => i === index ? { ...block, ...values } : block) });
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.content_blocks.length) return;
    const next = [...form.content_blocks];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ content_blocks: next });
  }

  async function upload(file: File, onDone: (url: string) => void) {
    setBusy(true); setMessage("Fayl yuklanmoqda...");
    const ext = file.name.split(".").pop() || "bin";
    const path = `articles/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("article-media").upload(path, file, { cacheControl: "31536000" });
    if (error) { setMessage(error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("article-media").getPublicUrl(path);
    onDone(data.publicUrl); setMessage("Fayl yuklandi."); setBusy(false);
  }

  async function save() {
    setBusy(true); setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      setMessage("Bu hisobga admin ruxsati berilmagan."); setBusy(false); return;
    }
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(), slug, category: form.category || null,
      image_url: form.image_url || null, description: form.description || null,
      content: form.content || null, content_blocks: form.content_blocks,
      video_url: form.video_url || null, status: form.status,
      author_name: form.author_name || null, author_url: form.author_url || null,
      seo_title: form.seo_title || null, seo_description: form.seo_description || null,
      seo_keywords: form.seo_keywords || null, social_title: form.social_title || null,
      social_description: form.social_description || null,
      social_image_url: form.social_image_url || form.image_url || null,
      canonical_url: `https://bunyodkor.com/bunyodkorlar/${slug}`,
      reading_minutes: estimateReading(form.content_blocks, form.content),
      published_at: form.status === "published" ? new Date().toISOString() : null,
      updated_by: auth.user.id,
    };
    const query = form.id
      ? supabase.from("articles").update(payload).eq("id", form.id)
      : supabase.from("articles").insert({ ...payload, created_by: auth.user.id });
    const { error } = await query;
    if (error) { setMessage(error.message); setBusy(false); return; }
    router.push("/admin"); router.refresh();
  }

  async function remove() {
    if (!form.id || !confirm("Maqola butunlay o‘chirilsinmi?")) return;
    setBusy(true);
    const { error } = await supabase.from("articles").delete().eq("id", form.id);
    if (error) { setMessage(error.message); setBusy(false); return; }
    router.push("/admin"); router.refresh();
  }

  return <main className="min-h-screen bg-[#eef3fb] p-4 text-[#111827] md:p-8">
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><button onClick={() => router.push('/admin')} className="mb-3 text-sm font-bold text-[#0043a4]">← Admin panel</button><h1 className="text-3xl font-black">{form.id ? "Maqolani tahrirlash" : "Yangi maqola"}</h1><p className="mt-1 text-sm text-gray-500">{publicUrl}</p></div>
        <div className="flex gap-2">{form.id && <button onClick={remove} disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white">O‘chirish</button>}<button onClick={save} disabled={busy || !form.title.trim()} className="rounded-xl bg-[#0043a4] px-6 py-3 font-bold text-white disabled:opacity-50">{busy ? "Bajarilmoqda..." : "Saqlash"}</button></div>
      </div>
      {message && <p className="mb-4 rounded-xl bg-white p-4 font-semibold shadow">{message}</p>}
      <div className="mb-5 flex gap-2"><button onClick={() => setTab('content')} className={`rounded-xl px-5 py-3 font-bold ${tab==='content'?'bg-[#0043a4] text-white':'bg-white'}`}>Maqola</button><button onClick={() => setTab('seo')} className={`rounded-xl px-5 py-3 font-bold ${tab==='seo'?'bg-[#0043a4] text-white':'bg-white'}`}>SEO va ijtimoiy tarmoq</button></div>
      {tab === "content" ? <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow"><label className="font-bold">Sarlavha</label><input value={form.title} onChange={(e)=>patch({title:e.target.value, slug:form.slug||slugify(e.target.value)})} className="mt-2 w-full rounded-xl border p-3" /><label className="mt-4 block font-bold">Qisqa tavsif</label><textarea value={form.description} onChange={(e)=>patch({description:e.target.value})} className="mt-2 min-h-28 w-full rounded-xl border p-3" /></div>
          <div className="rounded-2xl bg-white p-5 shadow"><div className="mb-4 flex flex-wrap gap-2">{([['heading','Sarlavha'],['text','Matn'],['image','Rasm'],['video','Video'],['file','Fayl'],['quote','Iqtibos']] as const).map(([type,label])=><button key={type} onClick={()=>addBlock(type)} className="rounded-lg bg-[#eef3fb] px-3 py-2 text-sm font-bold">+ {label}</button>)}</div>
            <div className="space-y-4">{form.content_blocks.map((block,index)=><div key={block.id||index} className="rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><b>{index+1}. {block.ty}</b><div><button onClick={()=>moveBlock(index,-1)} className="px-2">↑</button><button onClick={()=>moveBlock(index,1)} className="px-2">↓</button><button onClick={()=>patch({content_blocks:form.content_blocks.filter((_,i)=>i!==index)})} className="px-2 text-red-600">✕</button></div></div>
              {block.ty==='heading' && <><select value={block.le||2} onChange={(e)=>updateBlock(index,{le:Number(e.target.value)})} className="mb-2 rounded-lg border p-2"><option value={2}>H2</option><option value={3}>H3</option><option value={4}>H4</option></select><input value={block.te||''} onChange={(e)=>updateBlock(index,{te:e.target.value})} className="w-full rounded-lg border p-3" /></>}
              {['text','html','preface'].includes(block.ty) && <textarea value={block.te||''} onChange={(e)=>updateBlock(index,{te:e.target.value})} className="min-h-36 w-full rounded-lg border p-3" placeholder="HTML ishlatish mumkin: <strong>, <a>, <ul>..." />}
              {block.ty==='quote' && <><textarea value={block.te||''} onChange={(e)=>updateBlock(index,{te:e.target.value})} className="min-h-24 w-full rounded-lg border p-3"/><input value={block.author||''} onChange={(e)=>updateBlock(index,{author:e.target.value})} className="mt-2 w-full rounded-lg border p-3" placeholder="Muallif"/></>}
              {['image','video','file'].includes(block.ty) && <><input value={block.url||''} onChange={(e)=>updateBlock(index,{url:e.target.value})} className="w-full rounded-lg border p-3" placeholder="URL"/><input type="file" accept={block.ty==='image'?'image/*':block.ty==='video'?'video/*':'*/*'} onChange={(e)=>{const f=e.target.files?.[0];if(f)upload(f,(url)=>updateBlock(index,{url,title:f.name}))}} className="mt-2 w-full rounded-lg border p-3"/><input value={block.caption||''} onChange={(e)=>updateBlock(index,{caption:e.target.value})} className="mt-2 w-full rounded-lg border p-3" placeholder="Izoh yoki fayl tavsifi"/></>}
            </div>)}</div>
            {form.content_blocks.length===0 && <p className="rounded-xl bg-[#f7f9fc] p-6 text-center text-gray-500">Yuqoridagi tugmalar orqali blok qo‘shing. Eski maqola HTML’i quyidagi maydonda saqlanadi.</p>}
          </div>
          <details className="rounded-2xl bg-white p-5 shadow"><summary className="cursor-pointer font-bold">Eski HTML matni</summary><textarea value={form.content} onChange={(e)=>patch({content:e.target.value})} className="mt-4 min-h-72 w-full rounded-xl border p-3 font-mono text-sm" /></details>
        </div>
        <aside className="space-y-5"><div className="rounded-2xl bg-white p-5 shadow"><label className="font-bold">Status</label><select value={form.status} onChange={(e)=>patch({status:e.target.value as ArticleDraft['status']})} className="mt-2 w-full rounded-xl border p-3"><option value="draft">Qoralama</option><option value="published">E’lon qilingan</option><option value="archived">Arxiv</option></select><label className="mt-4 block font-bold">Slug</label><input value={form.slug} onChange={(e)=>patch({slug:slugify(e.target.value)})} className="mt-2 w-full rounded-xl border p-3"/><label className="mt-4 block font-bold">Kategoriya</label><input value={form.category} onChange={(e)=>patch({category:e.target.value})} className="mt-2 w-full rounded-xl border p-3" placeholder="Ta'lim;Sport"/></div>
          <div className="rounded-2xl bg-white p-5 shadow"><label className="font-bold">Asosiy rasm</label><input value={form.image_url} onChange={(e)=>patch({image_url:e.target.value})} className="mt-2 w-full rounded-xl border p-3" placeholder="URL"/><input type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0];if(f)upload(f,(url)=>patch({image_url:url,social_image_url:form.social_image_url||url}))}} className="mt-2 w-full rounded-xl border p-3"/>{form.image_url && <img src={form.image_url} alt="Preview" className="mt-3 max-h-72 w-full rounded-xl object-contain"/>}<label className="mt-4 block font-bold">Asosiy video URL</label><input value={form.video_url} onChange={(e)=>patch({video_url:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></div>
          <div className="rounded-2xl bg-white p-5 shadow"><label className="font-bold">Muallif</label><input value={form.author_name} onChange={(e)=>patch({author_name:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/><input value={form.author_url} onChange={(e)=>patch({author_url:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></div></aside>
      </div> : <div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-black">Google SEO</h2><label className="mt-4 block font-bold">SEO Title</label><input value={form.seo_title} onChange={(e)=>patch({seo_title:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/><label className="mt-4 block font-bold">SEO Description</label><textarea value={form.seo_description} onChange={(e)=>patch({seo_description:e.target.value})} className="mt-2 min-h-28 w-full rounded-xl border p-3"/><label className="mt-4 block font-bold">SEO Keywords</label><textarea value={form.seo_keywords} onChange={(e)=>patch({seo_keywords:e.target.value})} className="mt-2 min-h-24 w-full rounded-xl border p-3"/></div><div className="rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-black">Ijtimoiy tarmoqlar</h2><label className="mt-4 block font-bold">Social Title</label><input value={form.social_title} onChange={(e)=>patch({social_title:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/><label className="mt-4 block font-bold">Social Description</label><textarea value={form.social_description} onChange={(e)=>patch({social_description:e.target.value})} className="mt-2 min-h-28 w-full rounded-xl border p-3"/><label className="mt-4 block font-bold">Social Image URL</label><input value={form.social_image_url} onChange={(e)=>patch({social_image_url:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></div></div>}
    </section>
  </main>;
}
