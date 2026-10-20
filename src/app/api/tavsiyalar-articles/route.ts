import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TEMPORARY_STATIC_MODE } from "@/lib/temporary-mode";
import { publishedByDate } from "@/lib/temporary-static";

export async function GET() {
  const { data, error } = TEMPORARY_STATIC_MODE
    ? { data: publishedByDate.slice(0, 40).map(({ id, title, slug, category, image_url, description, created_at }) => ({ id, title, slug, category, image_url, description, created_at })), error: null }
    : await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ articles: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data || [] });
}
