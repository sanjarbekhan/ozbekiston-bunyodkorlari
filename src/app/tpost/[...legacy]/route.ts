import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function canonicalRedirect(request: NextRequest, slug: string) {
  return NextResponse.redirect(
    new URL(`/bunyodkorlar/${encodeURIComponent(slug)}`, request.url),
    301
  );
}

// Keep every legacy Tilda Feed URL compatible with the canonical article route.
// We resolve by the original source_url first because some Tilda URLs used an
// ID-prefixed path and some old slugs differ from the current canonical slug.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ legacy: string[] }> }
) {
  const { legacy } = await params;
  const decoded = legacy.map(decodeURIComponent).filter(Boolean);
  const legacyPath = decoded.join("/");

  if (legacyPath) {
    const sourceCandidates = [
      `https://bunyodkor.com/tpost/${legacyPath}`,
      `https://www.bunyodkor.com/tpost/${legacyPath}`,
    ];

    for (const sourceUrl of sourceCandidates) {
      const { data } = await supabase
        .from("articles")
        .select("slug,status")
        .eq("source_url", sourceUrl)
        .limit(1)
        .maybeSingle();

      if (data?.slug && data.status === "published") {
        return canonicalRedirect(request, data.slug);
      }
    }

    // A few historical URLs contain a one-character typo in the Tilda post id
    // (for example 0 vs o). The human-readable suffix is still stable, so use
    // it as a safe secondary match against the stored original source URL.
    const idPrefixed = legacyPath.match(/^[a-z0-9]{8,20}1-(.+)$/i);
    const readableSuffix = idPrefixed?.[1];
    if (readableSuffix && readableSuffix.length >= 8) {
      const { data } = await supabase
        .from("articles")
        .select("slug,status")
        .ilike("source_url", `%-${readableSuffix}`)
        .limit(1)
        .maybeSingle();

      if (data?.slug && data.status === "published") {
        return canonicalRedirect(request, data.slug);
      }
    }
  }

  // Tilda sometimes generated URLs like /tpost/<post-id>-<slug>.
  // Resolve the post id directly when an exact source_url is not available.
  const idCandidates = decoded
    .map((value) => value.match(/^([a-z0-9]{8,20}1)(?:-|$)/i)?.[1])
    .filter((value): value is string => Boolean(value));

  for (const value of [...decoded].reverse()) {
    if (/^[a-z0-9]{8,20}1$/i.test(value)) idCandidates.push(value);
  }

  for (const value of [...new Set(idCandidates)]) {
    const { data } = await supabase
      .from("articles")
      .select("slug,status")
      .or(`legacy_post_id.eq.${value},source_id.eq.${value}`)
      .limit(1)
      .maybeSingle();

    if (data?.slug && data.status === "published") {
      return canonicalRedirect(request, data.slug);
    }
  }

  // Finally support the simple legacy /tpost/<slug> form.
  for (const value of [...decoded].reverse()) {
    const { data } = await supabase
      .from("articles")
      .select("slug,status")
      .eq("slug", value)
      .limit(1)
      .maybeSingle();

    if (data?.slug && data.status === "published") {
      return canonicalRedirect(request, data.slug);
    }
  }

  // For an old slug that no longer resolves (for example a suspended profile),
  // preserve the path as a canonical-profile fallback so the profile route can
  // return its intentional 404/noindex state instead of redirecting to a list.
  const legacySlug = [...decoded]
    .reverse()
    .find((value) => /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(value));

  if (legacySlug) {
    return canonicalRedirect(request, legacySlug);
  }

  return NextResponse.redirect(new URL("/bunyodkorlar", request.url), 301);
}
