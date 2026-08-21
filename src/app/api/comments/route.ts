import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const articleId = typeof body?.articleId === "string" ? body.articleId.trim() : "";
    const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : "";
    const comment = typeof body?.body === "string" ? body.body.trim() : "";
    const website = typeof body?.website === "string" ? body.website.trim() : "";

    if (website) {
      return NextResponse.json({ ok: true });
    }
    if (!articleId) {
      return NextResponse.json({ error: "Maqola aniqlanmadi." }, { status: 400 });
    }
    if (authorName.length < 2 || authorName.length > 80) {
      return NextResponse.json({ error: "Ismingiz 2–80 ta belgidan iborat bo‘lsin." }, { status: 400 });
    }
    if (comment.length < 2 || comment.length > 1200) {
      return NextResponse.json({ error: "Kommentariya 2–1200 ta belgidan iborat bo‘lsin." }, { status: 400 });
    }

    const ip = clientIp(request);
    const ipHash = ip
      ? createHash("sha256").update(`ozbye-comments-v1:${ip}`).digest("hex")
      : null;

    const { error } = await supabase.rpc("submit_article_comment", {
      p_article_id: articleId,
      p_author_name: authorName,
      p_body: comment,
      p_ip_hash: ipHash,
    });

    if (error) {
      const rateLimited = error.message.toLocaleLowerCase("uz").includes("juda ko‘p");
      return NextResponse.json(
        { error: error.message || "Kommentariyani yuborib bo‘lmadi." },
        { status: rateLimited ? 429 : 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kommentariyani yuborishda xatolik yuz berdi." }, { status: 500 });
  }
}
