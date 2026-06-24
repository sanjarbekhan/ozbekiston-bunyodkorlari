import Link from "next/link";
import { notFound } from "next/navigation";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  content: string | null;
  published_at: string | null;
  created_at: string | null;
};

function cleanText(text: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(date: string | null) {
  if (!date) return "";
  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

export default async function BunyodkorArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, category, image_url, description, content, published_at, created_at"
    )
    .eq("status", "published")
    .eq("slug", decodedSlug)
    .limit(1);

  if (error || !articles || articles.length === 0) {
    notFound();
  }

  const article = articles[0] as Article;
  const description = cleanText(article.description);
  const date = formatDate(article.published_at || article.created_at);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f2f2f2] text-[#111827]">
      <SiteMenu />

      <article className="px-4 pb-16 pt-24 md:px-6 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-4xl overflow-hidden bg-white shadow-xl">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="block h-auto w-full"
            />
          )}

          <div className="px-5 py-8 md:px-12 md:py-12">
            <Link
              href="/#bunyodkorlar"
              className="inline-block rounded-full bg-[#0043a4] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#00327c]"
            >
              Ortga qaytish
            </Link>

            {article.category && (
              <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#0043a4]">
                {article.category}
              </p>
            )}

            <h1 className="mt-4 text-[34px] font-black leading-[0.95] tracking-[-0.05em] text-[#111827] sm:text-[46px] md:text-[64px]">
              {article.title}
            </h1>

            {date && (
              <p className="mt-5 text-sm font-bold text-gray-500">{date}</p>
            )}

            {description && (
              <p className="mt-8 text-lg font-bold leading-8 text-[#0043a4] md:text-xl md:leading-9">
                {description}
              </p>
            )}

            {article.content ? (
              <div
                className="mt-10 max-w-none text-base leading-8 text-gray-800 md:text-lg md:leading-9 [&_h1]:text-3xl [&_h1]:font-black [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-black [&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_p]:mb-5"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p className="mt-10 text-base leading-8 text-gray-700">
                Ushbu maqola matni hozircha kiritilmagan.
              </p>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}