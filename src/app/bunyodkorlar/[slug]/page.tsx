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

      <section className="bg-[#0043a4] px-4 pb-10 pt-24 text-white md:px-6 md:pb-14 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#bunyodkorlar"
            className="inline-flex rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#0043a4] shadow-lg transition hover:bg-[#f2f2f2]"
          >
            ← Ortga qaytish
          </Link>

          {article.category && (
            <p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-white/75">
              {article.category}
            </p>
          )}

          <h1 className="mt-4 max-w-5xl text-[38px] font-black leading-[0.92] tracking-[-0.06em] text-white sm:text-[54px] md:text-[76px]">
            {article.title}
          </h1>

          {date && (
            <p className="mt-6 text-sm font-bold text-white/80 md:text-base">
              {date}
            </p>
          )}
        </div>
      </section>

      <article className="px-4 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto -mt-6 max-w-6xl overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)] md:-mt-10">
          {article.image_url && (
            <div className="bg-white">
              <img
                src={article.image_url}
                alt={article.title}
                className="block h-auto w-full"
              />
            </div>
          )}

          <div className="grid gap-8 px-5 py-8 md:grid-cols-[0.75fr_1.25fr] md:px-10 md:py-12 lg:px-14 lg:py-16">
            <aside className="border-b border-gray-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0043a4]">
                Maqola haqida
              </p>

              <h2 className="mt-4 text-2xl font-black leading-tight text-[#111827]">
                O‘zbekiston Bunyodkor Yoshlari ensiklopediyasi
              </h2>

              {description && (
                <p className="mt-5 text-sm font-bold leading-7 text-[#0043a4]">
                  {description}
                </p>
              )}

              <div className="mt-7 rounded-3xl bg-[#f2f2f2] p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                  Sahifa havolasi
                </p>
                <p className="mt-2 break-words text-sm font-bold text-[#111827]">
                  /bunyodkorlar/{article.slug}
                </p>
              </div>
            </aside>

            <div>
              {article.content ? (
                <div
                  className="article-content text-[17px] font-medium leading-8 text-[#1f2937] md:text-[19px] md:leading-9"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-base leading-8 text-gray-700">
                  Ushbu maqola matni hozircha kiritilmagan.
                </p>
              )}

              <div className="mt-12 border-t border-gray-200 pt-8">
                <Link
                  href="/#bunyodkorlar"
                  className="inline-flex rounded-full bg-[#0043a4] px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg transition hover:bg-[#00327c]"
                >
                  Bosh sahifaga qaytish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}