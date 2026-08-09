import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const SITE_URL = "https://www.bunyodkor.com";
const url = (path: string) => `${SITE_URL}${path}`;

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from("articles")
    .select("slug,published_at,created_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);

  const latestArticleDate = (articles || []).reduce<Date | null>((latest, article) => {
    const candidate =
      toDate(article.updated_at) || toDate(article.published_at) || toDate(article.created_at);
    if (!candidate) return latest;
    return !latest || candidate.getTime() > latest.getTime() ? candidate : latest;
  }, null);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
    },
    {
      url: url("/bunyodkorlar"),
      ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
    },
    { url: url("/haqida") },
    { url: url("/tavsiyalari") },
    { url: url("/sahifasi") },
    { url: url("/hamkor-loyihasi") },
    { url: url("/ariza-qoldrish") },
    { url: url("/ommaviy_ofertasi") },
  ];

  const profilePages: MetadataRoute.Sitemap = (articles || []).map((article) => {
    const lastModified =
      toDate(article.updated_at) || toDate(article.published_at) || toDate(article.created_at);

    return {
      url: url(`/bunyodkorlar/${article.slug}`),
      ...(lastModified ? { lastModified } : {}),
    };
  });

  return staticPages.concat(profilePages);
}
