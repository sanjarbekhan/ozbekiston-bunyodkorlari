import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { ArticleRecord } from "@/lib/article-types";
import { analyzeArticleRanking } from "@/lib/ranking";

const ADMIN_USER_ID = "988b7d1f-4028-42a6-9a8f-be869224be6e";

function authedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return NextResponse.json({ error: "Admin sessiyasi topilmadi." }, { status: 401 });

    const client = authedClient(token);
    const { data: userData, error: userError } = await client.auth.getUser(token);
    if (userError || userData.user?.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Bu amal faqat admin uchun." }, { status: 403 });
    }

    const body = await request.json();
    const articleId = typeof body?.articleId === "string" ? body.articleId.trim() : "";
    if (!articleId) return NextResponse.json({ error: "Maqola ID kerak." }, { status: 400 });

    const { data: article, error: articleError } = await client
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .maybeSingle();

    if (articleError || !article) {
      return NextResponse.json({ error: articleError?.message || "Maqola topilmadi." }, { status: 404 });
    }

    const analysis = await analyzeArticleRanking(article as ArticleRecord);
    const now = new Date();
    const row = {
      article_id: articleId,
      period_type: "all_time",
      period_key: "all",
      achievement_score: analysis.achievementScore,
      activity_score: analysis.activityScore,
      leadership_score: analysis.leadershipScore,
      evidence_score: analysis.evidenceScore,
      achievements: analysis.achievements,
      ai_summary: analysis.summary,
      ai_confidence: analysis.confidence,
      scoring_source: analysis.source,
      scoring_version: "v1",
      status: "pending",
      computed_at: now.toISOString(),
      approved_at: null,
      approved_by: null,
      updated_at: now.toISOString(),
    };

    const { data: ranking, error: rankingError } = await client
      .from("article_rankings")
      .upsert(row, { onConflict: "article_id,period_type,period_key" })
      .select("id, article_id, achievement_score, activity_score, leadership_score, evidence_score, total_score, achievements, ai_summary, ai_confidence, scoring_source, status, computed_at")
      .single();

    if (rankingError) {
      return NextResponse.json({ error: rankingError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ranking });
  } catch {
    return NextResponse.json({ error: "Reyting tahlilida kutilmagan xatolik yuz berdi." }, { status: 500 });
  }
}
