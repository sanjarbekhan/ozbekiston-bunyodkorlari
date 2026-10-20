// Approved rankings for the publicly published biographies, frozen on 2026-10-20.
import type { RankingRow } from "@/app/reyting/RankingClient";
import { publishedArticles } from "@/lib/temporary-static";
import part0 from "@/data/temporary-rankings/part-00.json";
import part1 from "@/data/temporary-rankings/part-01.json";

type RawRanking = Omit<RankingRow, "article"> & { article_id: string };
const byId = new Map(publishedArticles.map((article) => [article.id, article]));
export const temporaryRankingRows: RankingRow[] = ([
  ...(part0 as unknown as RawRanking[]),
  ...(part1 as unknown as RawRanking[]),
]).map((rank) => {
  const article = byId.get(rank.article_id);
  return {
    id: rank.id,
    period_type: rank.period_type,
    period_key: rank.period_key,
    achievement_score: Number(rank.achievement_score),
    activity_score: Number(rank.activity_score),
    leadership_score: Number(rank.leadership_score),
    evidence_score: Number(rank.evidence_score),
    total_score: Number(rank.total_score),
    article: article ? { id: article.id, title: article.title, slug: article.slug, category: article.category, image_url: null } : null,
  };
}).filter((row) => row.article !== null);
