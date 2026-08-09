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

function atomDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const { data: articles } = await supabase
    .from("articles")
    .select("title,slug,description,category,published_at,created_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);

  const latest = articles?.[0];
  const updated = atomDate(
    latest?.updated_at || latest?.published_at || latest?.created_at
  );

  const entries = (articles || [])
    .map((article) => {
      const link = `${SITE_URL}/bunyodkorlar/${article.slug}`;
      return `
  <entry>
    <title>${xmlEscape(article.title)}</title>
    <id>${xmlEscape(link)}</id>
    <link href="${xmlEscape(link)}" rel="alternate" />
    <published>${atomDate(article.published_at || article.created_at)}</published>
    <updated>${atomDate(article.updated_at || article.published_at || article.created_at)}</updated>
    ${article.category ? `<category term="${xmlEscape(article.category)}" />` : ""}
    <summary>${xmlEscape(plain(article.description))}</summary>
  </entry>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>O‘zbekiston Bunyodkor Yoshlari — yangi profillar</title>
  <id>${SITE_URL}/</id>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${SITE_URL}/" rel="alternate" type="text/html" />
  <updated>${updated}</updated>
  <subtitle>O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasida e’lon qilingan eng yangi profillar.</subtitle>${entries}
</feed>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
