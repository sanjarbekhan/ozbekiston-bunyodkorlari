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

function firstCategory(category: string | null) {
  if (!category) return "";
  return category.split(";").map((item) => item.trim()).filter(Boolean)[0] || "";
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

  const { data: relatedArticles } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, content, published_at, created_at")
    .eq("status", "published")
    .neq("slug", decodedSlug)
    .order("created_at", { ascending: false })
    .limit(4);

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

      <article className="px-4 pb-12 md:px-6 md:pb-16">
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
                  className="text-[17px] font-medium leading-8 text-[#1f2937] md:text-[19px] md:leading-9 [&_a]:font-bold [&_a]:text-[#0043a4] [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-black [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-black [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-black [&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_li]:mb-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_strong]:font-black [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
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

      {relatedArticles && relatedArticles.length > 0 && (
        <section className="px-4 pb-16 md:px-6 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0043a4]">
                  Yana o‘qing
                </p>
                <h2 className="mt-3 text-[34px] font-black leading-[0.95] tracking-[-0.05em] text-[#111827] md:text-[52px]">
                  Boshqa bunyodkorlar
                </h2>
              </div>

              <Link
                href="/#bunyodkorlar"
                className="hidden rounded-full bg-[#0043a4] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white md:inline-flex"
              >
                Barchasini ko‘rish
              </Link>
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
              {(relatedArticles as Article[]).map((item) => {
                const cat = firstCategory(item.category);

                return (
                  <Link
                    key={item.id}
                    href={`/bunyodkorlar/${item.slug}`}
                    className="group block min-w-[78%] snap-start overflow-hidden bg-white shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] sm:min-w-[48%] md:min-w-0"
                  >
                    <div className="relative bg-white">
                      {cat && (
                        <span className="absolute left-3 top-3 z-10 bg-[#0043a4] px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                          {cat}
                        </span>
                      )}

                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="block h-auto w-full"
                        />
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-3 text-[20px] font-black leading-[1] tracking-[-0.04em] text-[#111827]">
                        {item.title}
                      </h3>

                      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#0043a4]">
                        Maqolani o‘qish
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}