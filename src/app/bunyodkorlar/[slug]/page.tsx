import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleContent from "@/components/ArticleContent";
import ArticleSharePanel from "@/components/ArticleSharePanel";
import CommentSection from "@/components/CommentSection";
import PublicArticleCard from "@/components/PublicArticleCard";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import type { ArticleRecord } from "@/lib/article-types";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;
const SITE_URL = "https://www.bunyodkor.com";

type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  published_at: string | null;
  created_at: string;
};

type PublicComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function plain(value?: string | null) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function canonicalFor(slug: string) {
  return `${SITE_URL}/bunyodkorlar/${slug}`;
}

async function getArticle(slug: string) {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("slug", decodeURIComponent(slug))
    .maybeSingle();
  return data as ArticleRecord | null;
}

async function getRelatedArticles(article: ArticleRecord) {
  const fields = "id, title, slug, category, image_url, description, published_at, created_at";
  const related: RelatedArticle[] = [];
  const seen = new Set<string>();

  if (article.category) {
    const { data } = await supabase
      .from("articles")
      .select(fields)
      .eq("status", "published")
      .eq("category", article.category)
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(4);

    for (const item of (data || []) as RelatedArticle[]) {
      related.push(item);
      seen.add(item.id);
    }
  }

  if (related.length < 4) {
    const { data } = await supabase
      .from("articles")
      .select(fields)
      .eq("status", "published")
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(8);

    for (const item of (data || []) as RelatedArticle[]) {
      if (seen.has(item.id)) continue;
      related.push(item);
      seen.add(item.id);
      if (related.length >= 4) break;
    }
  }

  return related.slice(0, 4);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return { title: "Maqola topilmadi", robots: { index: false, follow: false } };
  }

  const title = article.seo_title || article.title;
  const description =
    article.seo_description ||
    plain(article.description) ||
    `${article.title} haqida ensiklopedik maqola.`;
  const image = article.social_image_url || article.image_url || undefined;
  const canonical = canonicalFor(article.slug);

  return {
    title,
    description,
    keywords: article.seo_keywords
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.social_title || title,
      description: article.social_description || description,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.social_title || title,
      description: article.social_description || description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const canonical = canonicalFor(article.slug);
  const intro = plain(article.description);
  const published = formatDate(article.published_at || article.created_at);

  const [relatedArticles, commentsResult] = await Promise.all([
    getRelatedArticles(article),
    supabase
      .from("article_comments")
      .select("id, author_name, body, created_at")
      .eq("article_id", article.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const comments = (commentsResult.data || []) as PublicComment[];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo_description || intro,
    image: [article.social_image_url || article.image_url].filter(Boolean),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    mainEntityOfPage: canonical,
    inLanguage: "uz-UZ",
    author: {
      "@type": "Organization",
      name: article.author_name || "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
      url: SITE_URL,
    },
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-slate-200 bg-white px-4 pb-12 pt-24 md:px-8 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/bunyodkorlar"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0043a4] transition hover:gap-3"
          >
            ← Bunyodkorlar katalogi
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-14">
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f4f7fb] shadow-[0_18px_50px_rgba(15,23,42,.08)]">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center p-8 text-center text-sm font-bold text-slate-400">
                  Profil rasmi mavjud emas
                </div>
              )}
            </div>

            <div>
              {article.category && (
                <span className="inline-flex rounded-full bg-[#eaf2ff] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0043a4]">
                  {article.category}
                </span>
              )}
              <h1 className="mt-5 max-w-4xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.048em] text-[#111827] sm:text-[50px] md:text-[62px]">
                {article.title}
              </h1>

              {intro && (
                <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-slate-600 md:text-lg md:leading-8">
                  {intro}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-2.5 text-xs font-bold text-slate-600">
                {published && (
                  <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-4 py-2.5">
                    Nashr: {published}
                  </span>
                )}
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-4 py-2.5">
                  Ensiklopediya profili
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-700">
                  ✓ Tahririyat ko‘rib chiqqan
                </span>
                {article.video_url && (
                  <a
                    href={article.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#0043a4] px-4 py-2.5 text-white transition hover:bg-[#003681]"
                  >
                    Video →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-7 lg:grid-cols-[230px_minmax(0,820px)] lg:justify-center lg:gap-10">
          <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0043a4]">
              Profil haqida
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              {article.category && (
                <div>
                  <dt className="font-semibold text-slate-400">Yo‘nalish</dt>
                  <dd className="mt-1 font-extrabold text-[#111827]">{article.category}</dd>
                </div>
              )}
              {published && (
                <div>
                  <dt className="font-semibold text-slate-400">Nashr sanasi</dt>
                  <dd className="mt-1 font-extrabold text-[#111827]">{published}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-slate-400">Profil ID</dt>
                <dd className="mt-1 break-all font-mono text-[11px] font-bold text-slate-500">{article.id}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-400">Manba</dt>
                <dd className="mt-1 font-extrabold leading-5 text-[#111827]">
                  O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
                </dd>
              </div>
            </dl>

            <ArticleSharePanel url={canonical} title={article.title} />
          </aside>

          <div className="min-w-0 space-y-7">
            <article className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)] sm:p-8 md:p-11">
              <ArticleContent
                blocks={article.content_blocks}
                legacyHtml={article.content}
                articleTitle={article.title}
                articleDescription={article.description}
              />
            </article>

            <CommentSection articleId={article.id} initialComments={comments} />
          </div>
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="border-t border-slate-200 bg-white px-4 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0043a4]">Davom eting</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                  O‘xshash bunyodkorlar
                </h2>
              </div>
              <Link href="/bunyodkorlar" className="text-sm font-extrabold text-[#0043a4]">Barcha profillar →</Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArticles.map((item) => (
                <PublicArticleCard
                  key={item.id}
                  title={item.title}
                  slug={item.slug}
                  imageUrl={item.image_url}
                  category={item.category}
                  description={item.description}
                  date={item.published_at || item.created_at}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
