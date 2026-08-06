import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const candidates = legacy.map(decodeURIComponent).filter(Boolean).reverse();

  for (const value of candidates) {
    const { data } = await supabase.from("articles").select("slug")
      .eq("status", "published")
      .or(`slug.eq.${value},legacy_post_id.eq.${value},source_id.eq.${value}`)
      .limit(1).maybeSingle();
    if (data?.slug) return NextResponse.redirect(new URL(`/bunyodkorlar/${data.slug}`, request.url), 301);
  }

  return NextResponse.redirect(new URL("/bunyodkorlar", request.url), 301);
}
