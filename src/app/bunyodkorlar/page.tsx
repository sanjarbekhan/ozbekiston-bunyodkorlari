import type { Metadata } from "next";
import Link from "next/link";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Bunyodkorlar katalogi",
  description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasidagi barcha e’lon qilingan biografik maqolalar.",
  alternates: { canonical: "/bunyodkorlar" },
};

export default async function BunyodkorlarPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = "", category = "" } = await searchParams;
  let query = supabase.from("articles").select("id,title,slug,category,image_url,description,published_at")
    .eq("status", "published").order("published_at", { ascending: false }).limit(500);
  if (q.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,category.ilike.%${q.trim()}%`);
  if (category.trim()) query = query.ilike("category", `%${category.trim()}%`);
  const { data: articles } = await query;

  return <main className="min-h-screen bg-[#f1f4f9]"><SiteMenu /><header className="bg-[#0043a4] px-4 pb-14 pt-24 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.25em] text-white/70">Ensiklopediya</p><h1 className="mt-3 text-5xl font-black tracking-[-.05em] md:text-7xl">Bunyodkorlar</h1><p className="mt-5 max-w-3xl text-lg text-white/85">Barcha biografik maqolalarni ism, soha yoki kalit so‘z orqali toping.</p><form className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-[1fr_220px_auto]"><input name="q" defaultValue={q} placeholder="Ism yoki kalit so‘z..." className="rounded-xl bg-white p-4 text-black"/><input name="category" defaultValue={category} placeholder="Soha..." className="rounded-xl bg-white p-4 text-black"/><button className="rounded-xl bg-black px-6 py-4 font-black">Qidirish</button></form></div></header><section className="mx-auto max-w-7xl px-4 py-12"><p className="mb-6 font-bold text-gray-600">Topildi: {articles?.length || 0} ta maqola</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{(articles || []).map((article)=><Link key={article.id} href={`/bunyodkorlar/${article.slug}`} className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1">{article.image_url && <img src={article.image_url} alt={article.title} loading="lazy" className="aspect-[4/5] w-full object-cover"/>}<div className="p-5"><p className="text-xs font-black uppercase tracking-wider text-[#0043a4]">{article.category || "Bunyodkor"}</p><h2 className="mt-2 text-2xl font-black leading-tight">{article.title}</h2></div></Link>)}</div></section></main>;
}
