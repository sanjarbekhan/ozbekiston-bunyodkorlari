import { supabase } from "@/lib/supabase";

type ProfileSitemapRow = {
  slug: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getProfileSitemapRows(): Promise<ProfileSitemapRow[]> {
  const rows: ProfileSitemapRow[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("articles")
      .select("slug,published_at,created_at,updated_at")
      .eq("status", "published")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error("Unable to load published sitemap entries");
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

export function profileLastModified(article: ProfileSitemapRow): string | undefined {
  for (const value of [article.updated_at, article.published_at, article.created_at]) {
    if (value && !Number.isNaN(new Date(value).getTime())) return new Date(value).toISOString();
  }
}
