import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleContent from "@/components/ArticleContent";
import SiteMenu from "@/components/SiteMenu";
import type { ArticleRecord } from "@/lib/article-types";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bunyodkor.com";

function plain(value?: string | null) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function getArticle(slug: string) {
  const { data } = await supabase.from("articles").select("*")
    .eq("status", "published").eq("slug", decodeURIComponent(slug)).maybeSingle();
  return data as ArticleRecord | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Maqola topilmadi", robots: { index: false, follow: false } };
  const title = article.seo_title || article.title;
  const description = article.seo_description || plain(article.description) || `${article.title} haqida ensiklopedik maqola.`;
  const image = article.social_image_url || article.image_url || undefined;
  const canonical = article.canonical_url || `${SITE_URL}/bunyodkorlar/${article.slug}`;
  return {
    title,
    description,
    keywords: article.seo_keywords?.split(",").map((item) => item.trim()).filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "article", url: canonical,
      title: article.social_title || title,
      description: article.social_description || description,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: article.social_title || title, description: article.social_description || description, images: image ? [image] : undefined },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { data: related } = await supabase.from("articles")
    .select("id,title,slug,image_url,category")
    .eq("status", "published").neq("id", article.id)
    .order("published_at", { ascending: false }).limit(4);

  const canonical = article.canonical_url || `${SITE_URL}/bunyodkorlar/${article.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo_description || plain(article.description),
    image: [article.social_image_url || article.image_url].filter(Boolean),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    mainEntityOfPage: canonical,
    inLanguage: "uz-UZ",
    author: { "@type": "Organization", name: article.author_name || "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi", url: article.author_url || SITE_URL },
    publisher: { "@type": "Organization", name: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi", url: SITE_URL },
  };

  return <main className="min-h-screen bg-[#f1f4f9] text-[#111827]">
    <SiteMenu />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="bg-[#0043a4] px-4 pb-16 pt-24 text-white md:px-8 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <Link href="/bunyodkorlar" className="text-sm font-black uppercase tracking-wider text-white/80">← Bunyodkorlar</Link>
        {article.category && <p className="mt-8 text-xs font-black uppercase tracking-[.25em] text-white/70">{article.category}</p>}
        <h1 className="mt-4 max-w-5xl text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-6xl md:text-7xl">{article.title}</h1>
        <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-white/80">
          {article.author_name && <span>{article.author_name}</span>}
          {article.published_at && <time dateTime={article.published_at}>{new Intl.DateTimeFormat("uz-UZ", { dateStyle: "long" }).format(new Date(article.published_at))}</time>}
          <span>{article.reading_minutes || 1} daqiqa o‘qish</span>
        </div>
      </div>
    </header>

    <article className="mx-auto -mt-8 max-w-6xl px-4 pb-16 md:px-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
        {article.image_url && <img src={article.image_url} alt={article.title} className="max-h-[760px] w-full object-contain bg-white" />}
        <div className="grid gap-8 p-6 md:grid-cols-[260px_1fr] md:p-12">
          <aside className="border-b pb-7 md:border-b-0 md:border-r md:pb-0 md:pr-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#0043a4]">Maqola haqida</p>
            {article.description && <div className="mt-4 font-semibold leading-7 text-[#0043a4]" dangerouslySetInnerHTML={{ __html: article.description }} />}
            {article.video_url && <a href={article.video_url} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-xl bg-[#0043a4] p-4 text-center font-bold text-white">Videoni ko‘rish</a>}
          </aside>
          <ArticleContent blocks={article.content_blocks} legacyHtml={article.content} />
        </div>
      </div>
    </article>

    {related && related.length > 0 && <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8"><h2 className="mb-7 text-4xl font-black tracking-tight">Boshqa bunyodkorlar</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <Link key={item.id} href={`/bunyodkorlar/${item.slug}`} className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1">{item.image_url && <img src={item.image_url} alt={item.title} className="aspect-[4/5] w-full object-cover" />}<div className="p-5"><p className="text-xs font-black uppercase tracking-wider text-[#0043a4]">{item.category || "Bunyodkor"}</p><h3 className="mt-2 text-xl font-black leading-tight">{item.title}</h3></div></Link>)}</div></section>}
  </main>;
}
