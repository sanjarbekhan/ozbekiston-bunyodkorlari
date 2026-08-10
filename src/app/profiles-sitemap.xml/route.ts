import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const SITE_URL = "https://www.bunyodkor.com";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function validIsoDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("slug,published_at,created_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to generate profile sitemap", { status: 500 });
  }

  const urls = (articles || [])
    .filter((article) => Boolean(article.slug))
    .map((article) => {
      const loc = `${SITE_URL}/bunyodkorlar/${article.slug}`;
      const lastmod =
        validIsoDate(article.updated_at) ||
        validIsoDate(article.published_at) ||
        validIsoDate(article.created_at);

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
