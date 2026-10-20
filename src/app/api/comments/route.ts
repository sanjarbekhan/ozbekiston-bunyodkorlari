import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json({ ok: true, ignored: true });
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Kommentariya xizmati hozircha sozlanmagan." },
        { status: 503 },
      );
    }

    const ip = clientIp(request);
    const ipHash = ip
      ? createHash("sha256").update(`ozbye-comments-v1:${ip}`).digest("hex")
      : null;

    const response = await fetch(`${supabaseUrl}/functions/v1/submit-moderated-comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleId, authorName, body: comment, ipHash }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: result?.error || "Kommentariyani yuborib bo‘lmadi." },
        { status: response.status },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Kommentariyani yuborishda xatolik yuz berdi." }, { status: 500 });
  }
}
