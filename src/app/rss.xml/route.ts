import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bunyodkor.com";
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] || char));

export async function GET() {
  const { data } = await supabase.from("articles").select("title,slug,description,published_at,updated_at")
    .eq("status", "published").order("published_at", { ascending: false }).limit(100);
  const items = (data || []).map((article) => {
    const link = `${SITE_URL}/bunyodkorlar/${article.slug}`;
    return `<item><title>${escapeXml(article.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><description>${escapeXml((article.description || "").replace(/<[^>]+>/g, " "))}</description><pubDate>${new Date(article.published_at || article.updated_at || Date.now()).toUTCString()}</pubDate></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi</title><link>${SITE_URL}</link><description>Bunyodkor yoshlar haqidagi yangi biografik maqolalar</description><language>uz</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
