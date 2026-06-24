import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bunyodkor.com";

function makeUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, published_at, created_at, updated_at")
    .eq("status", "published")
    .limit(1000);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: makeUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: makeUrl("/haqida"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: makeUrl("/tavsiyalari"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: makeUrl("/sahifasi"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: makeUrl("/hamkor-loyihasi"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: makeUrl("/ariza-qoldrish"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: makeUrl("/ommaviy_ofertasi"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const articlePages: MetadataRoute.Sitemap =
    articles?.map((article) => ({
      url: makeUrl(`/bunyodkorlar/${article.slug}`),
      lastModified: new Date(
        article.updated_at || article.published_at || article.created_at || Date.now()
      ),
      changeFrequency: "weekly",
      priority: 0.9,
    })) || [];

  return [...staticPages, ...articlePages];
}
