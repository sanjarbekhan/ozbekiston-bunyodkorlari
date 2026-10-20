import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { cleanText, validateBiographySubmission } from "@/lib/biography-application";

const MAX_BODY_BYTES = 80 * 1024;

function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    || request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "";
  return forwarded.split(",")[0]?.trim().slice(0, 100) || null;
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "So‘rov hajmi juda katta." }, { status: 413 });
    }

    const body = await request.json();

    // Honeypot: real visitors never see or fill this field.
    if (cleanText(body?.website, 100)) {
      return NextResponse.json({ ok: true });
    }

    const validated = validateBiographySubmission(body);
    if (validated.data === null) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Biography intake environment is not configured.");
      return NextResponse.json({ error: "Ariza xizmati vaqtincha ishlamayapti." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const submission = validated.data;

    const { error } = await supabase.from("biography_submissions").insert({
      id: submission.submission_id,
      full_name: submission.answers.q1,
      telegram: submission.telegram,
      phone: submission.phone || null,
      instagram: submission.instagram,
      answers: submission.answers,
      files: submission.files,
      status: "new",
      source: "crm_form",
      ip_address: getRequestIp(request),
      user_agent: cleanText(request.headers.get("user-agent"), 500) || null,
      admin_note: null,
    });

    if (error) {
      console.error("Biography submission insert error:", error.message);
      const duplicate = error.code === "23505";
      return NextResponse.json(
        { error: duplicate ? "Bu anketa avval yuborilgan." : "Anketani saqlab bo‘lmadi." },
        { status: duplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference: submission.submission_id.split("-")[0].toUpperCase(),
    });
  } catch (error) {
    console.error("Biography submission API error:", error);
    return NextResponse.json({ error: "So‘rovni qayta ishlashda xatolik." }, { status: 500 });
  }
}
