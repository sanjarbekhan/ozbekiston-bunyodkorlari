import type { ArticleRecord } from "@/lib/article-types";

export type AchievementLevel = "international" | "national" | "regional" | "institution" | "other";
export type AchievementKind =
  | "award"
  | "competition"
  | "publication"
  | "project"
  | "certificate"
  | "leadership"
  | "volunteering"
  | "education"
  | "other";

export type ExtractedAchievement = {
  text: string;
  level: AchievementLevel;
  kind: AchievementKind;
  year?: number | null;
  month?: number | null;
  leadership?: boolean;
};

export type RankingAnalysis = {
  achievementScore: number;
  activityScore: number;
  leadershipScore: number;
  evidenceScore: number;
  totalScore: number;
  achievements: ExtractedAchievement[];
  summary: string;
  confidence: number;
  source: "ai" | "rules";
};

const LEVEL_POINTS: Record<AchievementLevel, number> = {
  international: 8,
  national: 6,
  regional: 4,
  institution: 2.5,
  other: 1.5,
};

const KIND_BONUS: Record<AchievementKind, number> = {
  award: 2,
  competition: 2,
  publication: 1.5,
  project: 1.5,
  certificate: 0.5,
  leadership: 1.5,
  volunteering: 0.5,
  education: 0,
  other: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function stripHtml(value?: string | null) {
  return (value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function articleText(article: ArticleRecord) {
  const blockText = (article.content_blocks || [])
    .map((block) => [block.title, block.te, block.caption].filter(Boolean).join(" "))
    .join(" ");
  return stripHtml(
    [article.title, article.description, article.content, blockText].filter(Boolean).join(" "),
  );
}

function detectLevel(text: string): AchievementLevel {
  const value = text.toLowerCase();
  if (/xalqaro|international|world|global|turkiya|rossiya|qozog|korea|koreya|china|xitoy|france|germany|germaniya|doha|parij|moskva/.test(value)) return "international";
  if (/respublika|o‘zbekiston|ozbekiston|milliy|national|mamlakat/.test(value)) return "national";
  if (/viloyat|shahar|tuman|hududiy|regional/.test(value)) return "regional";
  if (/universitet|institut|maktab|kollej|litsey|fakultet|campus/.test(value)) return "institution";
  return "other";
}

function detectKind(text: string): AchievementKind {
  const value = text.toLowerCase();
  if (/g‘olib|g'olib|sovrindor|mukofot|nishon|award|grand prix|i prize|1-daraja|1-o‘rin|1-o'rin|2-o‘rin|2-o'rin|3-o‘rin|3-o'rin/.test(value)) return "award";
  if (/olimpiada|tanlov|competition|finalist|semi-finalist|yarim final/.test(value)) return "competition";
  if (/maqola|jurnal|kitob|muallif|nashr|publication|conference|konferensiya/.test(value)) return "publication";
  if (/loyiha|startup|startap|project|tashabbus/.test(value)) return "project";
  if (/sertifikat|certificate|ielts|efset|diplom/.test(value)) return "certificate";
  if (/asoschi|rahbar|yetakchi|lider|koordinator|mentor|speaker|spiker|menejer|direktor/.test(value)) return "leadership";
  if (/volontyor|ko‘ngilli|ko'ngilli|volunteer/.test(value)) return "volunteering";
  if (/grant|universitet|institut|talaba|bakalavr|magistr/.test(value)) return "education";
  return "other";
}

function detectDate(text: string) {
  const yearMatch = text.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const months = [
    ["yanvar", 1], ["fevral", 2], ["mart", 3], ["aprel", 4], ["may", 5], ["iyun", 6],
    ["iyul", 7], ["avgust", 8], ["sentabr", 9], ["oktabr", 10], ["noyabr", 11], ["dekabr", 12],
  ] as const;
  const lower = text.toLowerCase();
  const month = months.find(([name]) => lower.includes(name))?.[1] ?? null;
  return { year, month };
}

function sentenceCandidates(text: string) {
  const raw = text
    .split(/(?<=[.!?])\s+|\s*[•▪●]\s*|\s+\d+[.)]\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 24 && item.length <= 520);

  const keyword = /g‘olib|g'olib|sovrindor|mukofot|nishon|olimpiada|tanlov|finalist|sertifikat|certificate|diplom|grant|maqola|jurnal|kitob|muallif|konferensiya|loyiha|startup|startap|asoschi|rahbar|yetakchi|lider|koordinator|mentor|speaker|spiker|volontyor|ko‘ngilli|ko'ngilli|xalqaro|respublika|viloyat/i;
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw) {
    if (!keyword.test(item)) continue;
    const normalized = item.toLocaleLowerCase("uz").replace(/[^a-z0-9а-яёўқғҳ'’]+/gi, " ").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item);
    if (result.length >= 18) break;
  }
  return result;
}

export function extractAchievementsWithRules(article: ArticleRecord): ExtractedAchievement[] {
  return sentenceCandidates(articleText(article)).map((text) => {
    const kind = detectKind(text);
    const { year, month } = detectDate(text);
    return {
      text,
      level: detectLevel(text),
      kind,
      year,
      month,
      leadership: kind === "leadership" || /asoschi|rahbar|yetakchi|lider|koordinator|mentor|menejer|direktor/i.test(text),
    };
  });
}

function scoreAchievements(items: ExtractedAchievement[]) {
  let score = 0;
  for (const item of items.slice(0, 14)) {
    const base = LEVEL_POINTS[item.level] + KIND_BONUS[item.kind];
    score += base;
  }
  return clamp(Number(score.toFixed(2)), 0, 60);
}

function scoreActivity(items: ExtractedAchievement[]) {
  const activeKinds = new Set(
    items
      .filter((item) => ["competition", "publication", "project", "volunteering", "leadership", "award"].includes(item.kind))
      .map((item) => item.kind),
  );
  const recent = items.filter((item) => item.year && item.year >= new Date().getUTCFullYear() - 1).length;
  return clamp(Number((activeKinds.size * 2.2 + recent * 1.1).toFixed(2)), 0, 20);
}

function scoreLeadership(items: ExtractedAchievement[]) {
  const leadershipCount = items.filter((item) => item.leadership || item.kind === "leadership").length;
  return clamp(Number((leadershipCount * 3).toFixed(2)), 0, 15);
}

function scoreEvidence(article: ArticleRecord) {
  const attachments = Array.isArray(article.attachments) ? article.attachments.length : 0;
  let score = 0;
  if (attachments > 0) score += Math.min(4, 2 + attachments);
  if (article.source_url) score += 1;
  return clamp(score, 0, 5);
}

export function buildRankingAnalysis(
  article: ArticleRecord,
  achievements: ExtractedAchievement[],
  source: "ai" | "rules",
  customSummary?: string,
): RankingAnalysis {
  const achievementScore = scoreAchievements(achievements);
  const activityScore = scoreActivity(achievements);
  const leadershipScore = scoreLeadership(achievements);
  const evidenceScore = scoreEvidence(article);
  const totalScore = Number((achievementScore + activityScore + leadershipScore + evidenceScore).toFixed(2));
  const confidence = clamp(
    Number((0.42 + Math.min(0.34, achievements.length * 0.025) + evidenceScore * 0.04).toFixed(3)),
    0.45,
    0.96,
  );
  const summary = customSummary?.trim() ||
    `${achievements.length} ta yutuq yoki faoliyat belgisi aniqlangan. Ball faqat maqolada qayd etilgan natijalar, faollik, liderlik va dalil mavjudligiga asoslangan.`;

  return {
    achievementScore,
    activityScore,
    leadershipScore,
    evidenceScore,
    totalScore,
    achievements: achievements.slice(0, 18),
    summary,
    confidence,
    source,
  };
}

function parseOpenAIText(payload: unknown) {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (data.output_text) return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) return content.text;
    }
  }
  return "";
}

function sanitizeAchievement(input: unknown): ExtractedAchievement | null {
  if (!input || typeof input !== "object") return null;
  const item = input as Record<string, unknown>;
  const text = typeof item.text === "string" ? item.text.trim().slice(0, 520) : "";
  if (!text) return null;
  const levels: AchievementLevel[] = ["international", "national", "regional", "institution", "other"];
  const kinds: AchievementKind[] = ["award", "competition", "publication", "project", "certificate", "leadership", "volunteering", "education", "other"];
  const level = levels.includes(item.level as AchievementLevel) ? item.level as AchievementLevel : "other";
  const kind = kinds.includes(item.kind as AchievementKind) ? item.kind as AchievementKind : "other";
  const year = typeof item.year === "number" && item.year >= 2000 && item.year <= 2100 ? Math.trunc(item.year) : null;
  const month = typeof item.month === "number" && item.month >= 1 && item.month <= 12 ? Math.trunc(item.month) : null;
  return { text, level, kind, year, month, leadership: Boolean(item.leadership) };
}

export async function analyzeArticleRanking(article: ArticleRecord): Promise<RankingAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const achievements = extractAchievementsWithRules(article);
    return buildRankingAnalysis(article, achievements, "rules");
  }

  try {
    const text = articleText(article).slice(0, 24000);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_RANKING_MODEL || "gpt-5.6-luna",
        input: `You extract documented achievements from an Uzbek youth encyclopedia profile.\n\nIMPORTANT RULES:\n- Do not score or infer gender, ethnicity, religion, political affiliation, disability, health, family status, wealth, or other sensitive/personal traits.\n- Do not invent facts. Use only claims explicitly present in the supplied profile.\n- Prefer concrete outcomes: awards, competition results, publications, projects, grants, certificates, volunteering and leadership roles.\n- Return JSON only, with keys: achievements and summary. achievements must be an array of objects with: text, level (international|national|regional|institution|other), kind (award|competition|publication|project|certificate|leadership|volunteering|education|other), year (number|null), month (1-12|null), leadership (boolean).\n- Keep at most 18 strongest items.\n- The summary must be one short neutral Uzbek sentence.\n\nPROFILE:\n${text}`,
      }),
    });
    if (!response.ok) throw new Error(`OpenAI ${response.status}`);
    const payload = await response.json();
    const raw = parseOpenAIText(payload).trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(raw) as { achievements?: unknown[]; summary?: string };
    const achievements = (parsed.achievements || []).map(sanitizeAchievement).filter((item): item is ExtractedAchievement => Boolean(item));
    if (!achievements.length) throw new Error("AI returned no usable achievements");
    return buildRankingAnalysis(article, achievements, "ai", parsed.summary);
  } catch {
    const achievements = extractAchievementsWithRules(article);
    return buildRankingAnalysis(article, achievements, "rules");
  }
}
