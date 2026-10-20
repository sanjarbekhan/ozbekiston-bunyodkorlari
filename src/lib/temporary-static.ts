// Public published records snapshot taken on 2026-10-20.
// Replaces database queries only while Supabase free-tier egress is restricted.
// Do not import this large module into a client component.
import type { ArticleRecord } from "@/lib/article-types";
import part0 from "@/data/temporary-articles/part-00.json";
import part1 from "@/data/temporary-articles/part-01.json";
import part2 from "@/data/temporary-articles/part-02.json";
import part3 from "@/data/temporary-articles/part-03.json";
import part4 from "@/data/temporary-articles/part-04.json";
import part5 from "@/data/temporary-articles/part-05.json";
import part6 from "@/data/temporary-articles/part-06.json";
import part7 from "@/data/temporary-articles/part-07.json";
import part8 from "@/data/temporary-articles/part-08.json";
import part9 from "@/data/temporary-articles/part-09.json";
import part10 from "@/data/temporary-articles/part-10.json";
import part11 from "@/data/temporary-articles/part-11.json";
import part12 from "@/data/temporary-articles/part-12.json";
import part13 from "@/data/temporary-articles/part-13.json";

export const publishedArticles: ArticleRecord[] = [
  ...(part0 as unknown as ArticleRecord[]),
  ...(part1 as unknown as ArticleRecord[]),
  ...(part2 as unknown as ArticleRecord[]),
  ...(part3 as unknown as ArticleRecord[]),
  ...(part4 as unknown as ArticleRecord[]),
  ...(part5 as unknown as ArticleRecord[]),
  ...(part6 as unknown as ArticleRecord[]),
  ...(part7 as unknown as ArticleRecord[]),
  ...(part8 as unknown as ArticleRecord[]),
  ...(part9 as unknown as ArticleRecord[]),
  ...(part10 as unknown as ArticleRecord[]),
  ...(part11 as unknown as ArticleRecord[]),
  ...(part12 as unknown as ArticleRecord[]),
  ...(part13 as unknown as ArticleRecord[]),
];

export const publishedByDate = [...publishedArticles].sort((a, b) =>
  (b.published_at || b.created_at || "").localeCompare(a.published_at || a.created_at || "")
);
const publishedBySlug = new Map(publishedArticles.map((record) => [record.slug, record]));
export function findPublishedArticle(slug: string): ArticleRecord | null {
  try { return publishedBySlug.get(decodeURIComponent(slug)) || null; }
  catch { return null; }
}
