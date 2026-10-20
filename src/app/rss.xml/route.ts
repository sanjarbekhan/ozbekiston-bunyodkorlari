import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.bunyodkor.com";

function xmlEscape(value?: string | null) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plain(value?: string | null) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function rssDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET() {
  const { data: articles } = await supabase
    .from("articles")
    .select("title,slug,description,category,published_at,created_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);

  const latest = articles?.[0];
  const lastBuildDate = rssDate(
    latest?.updated_at || latest?.published_at || latest?.created_at
  );

  const items = (articles || [])
    .map((article) => {
      const link = `${SITE_URL}/bunyodkorlar/${article.slug}`;
      return `
    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${rssDate(article.published_at || article.created_at)}</pubDate>
      ${article.category ? `<category>${xmlEscape(article.category)}</category>` : ""}
      <description>${xmlEscape(plain(article.description))}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>O‘zbekiston Bunyodkor Yoshlari — yangi profillar</title>
    <link>${SITE_URL}</link>
    <description>O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasida e’lon qilingan eng yangi profillar.</description>
    <language>uz-UZ</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
