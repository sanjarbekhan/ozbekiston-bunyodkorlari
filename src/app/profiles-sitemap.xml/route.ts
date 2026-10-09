import { getProfileSitemapRows, profileLastModified } from "@/lib/profile-sitemap";

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

export async function GET() {
  let articles;
  try {
    articles = await getProfileSitemapRows();
  } catch {
    return new Response("Unable to generate profile sitemap", { status: 503 });
  }

  const urls = (articles || [])
    .filter((article) => Boolean(article.slug))
    .map((article) => {
      const loc = `${SITE_URL}/bunyodkorlar/${encodeURIComponent(article.slug)}`;
      const lastmod = profileLastModified(article);

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
