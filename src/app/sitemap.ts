import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bunyodkor.com";
const url = (path: string) => `${SITE_URL}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase.from("articles")
    .select("slug,published_at,created_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: url("/bunyodkorlar"), lastModified: new Date(), changeFrequency: "daily", priority: .95 },
    { url: url("/haqida"), changeFrequency: "monthly", priority: .7 },
    { url: url("/tavsiyalari"), changeFrequency: "weekly", priority: .7 },
    { url: url("/sahifasi"), changeFrequency: "weekly", priority: .7 },
    { url: url("/hamkor-loyihasi"), changeFrequency: "monthly", priority: .6 },
    { url: url("/ariza-qoldrish"), changeFrequency: "monthly", priority: .6 },
    { url: url("/ommaviy_ofertasi"), changeFrequency: "monthly", priority: .4 },
  ];

  return staticPages.concat((articles || []).map((article) => ({
    url: url(`/bunyodkorlar/${article.slug}`),
    lastModified: new Date(article.updated_at || article.published_at || article.created_at || Date.now()),
    changeFrequency: "weekly" as const,
    priority: .85,
  })));
}
