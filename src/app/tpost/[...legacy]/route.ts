import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Keep legacy Tilda profile links compatible with the canonical article route.
// Production redeploy trigger after suspended-route fix verification.
export async function GET(request: NextRequest, { params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const candidates = legacy.map(decodeURIComponent).filter(Boolean).reverse();

  for (const value of candidates) {
    const { data } = await supabase
      .from("articles")
      .select("slug,status")
      .or(`slug.eq.${value},legacy_post_id.eq.${value},source_id.eq.${value}`)
      .limit(1)
      .maybeSingle();

    if (data?.slug && data.status === "published") {
      return NextResponse.redirect(new URL(`/bunyodkorlar/${data.slug}`, request.url), 301);
    }
  }

  // Suspended rows are intentionally hidden from anonymous Supabase reads by RLS.
  // Old Tilda links use /tpost/<slug>, so preserve that slug as a safe canonical
  // fallback. The canonical page then renders the suspended/not-found notice.
  const legacySlug = candidates.find((value) => /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(value));
  if (legacySlug) {
    return NextResponse.redirect(
      new URL(`/bunyodkorlar/${encodeURIComponent(legacySlug)}`, request.url),
      301
    );
  }

  return NextResponse.redirect(new URL("/bunyodkorlar", request.url), 301);
}
