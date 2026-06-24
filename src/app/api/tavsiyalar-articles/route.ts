import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
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
