import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function clean(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  const raw = vercelForwarded || forwarded || realIp || "";
  return raw.split(",")[0]?.trim().slice(0, 100) || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot: bots often fill hidden fields.
    if (clean(body.website, 100)) {
      return NextResponse.json({ ok: true });
    }

    const fullName = clean(body.full_name, 160);
    const phone = clean(body.phone, 40);
    const telegram = clean(body.telegram, 160);
    const gender = clean(body.gender, 20);
    const ageGroup = clean(body.age_group, 40);
    const promoCode = clean(body.promo_code, 120);
    const attachmentPath = clean(body.attachment_path, 500);
    const attachmentName = clean(body.attachment_name, 255);
    const attachmentMime = clean(body.attachment_mime, 160);
    const rawAttachmentSize = Number(body.attachment_size || 0);
    const attachmentSize = Number.isFinite(rawAttachmentSize)
      ? Math.max(0, Math.floor(rawAttachmentSize))
      : 0;

    if (fullName.length < 2 || phone.length < 5) {
      return NextResponse.json({ error: "Majburiy maydonlarni to‘ldiring." }, { status: 400 });
    }

    if (gender && gender !== "Erkak" && gender !== "Ayol") {
      return NextResponse.json({ error: "Jins qiymati noto‘g‘ri." }, { status: 400 });
    }

    if (attachmentPath) {
      if (!attachmentPath.startsWith("applications/")) {
        return NextResponse.json({ error: "Biriktirilgan fayl manzili noto‘g‘ri." }, { status: 400 });
      }
      if (!attachmentName || !ALLOWED_ATTACHMENT_TYPES.has(attachmentMime)) {
        return NextResponse.json({ error: "Biriktirilgan fayl formati noto‘g‘ri." }, { status: 400 });
      }
      if (attachmentSize <= 0 || attachmentSize > MAX_ATTACHMENT_BYTES) {
        return NextResponse.json({ error: "Biriktirilgan fayl hajmi noto‘g‘ri." }, { status: 400 });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("applications").insert({
      full_name: fullName,
      phone,
      telegram: telegram || null,
      gender: gender || null,
      age_group: ageGroup || null,
      promo_code: promoCode || null,
      ip_address: getRequestIp(request),
      status: "new",
      source: "web",
      contacted: false,
      contacted_at: null,
      attachment_path: attachmentPath || null,
      attachment_name: attachmentPath ? attachmentName : null,
      attachment_mime: attachmentPath ? attachmentMime : null,
      attachment_size: attachmentPath ? attachmentSize : null,
    });

    if (error) {
      console.error("Application insert error:", error.message);
      return NextResponse.json({ error: "Arizani saqlab bo‘lmadi." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Application API error:", error);
    return NextResponse.json({ error: "So‘rovni qayta ishlashda xatolik." }, { status: 500 });
  }
}
