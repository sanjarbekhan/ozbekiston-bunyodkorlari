import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#14231b]">
      <section className="mx-auto max-w-4xl px-5 py-8">
        <Link
          href="/"
          className="mb-6 inline-block rounded-full bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white"
        >
          ← Orqaga
        </Link>

        <article className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-[420px] w-full object-cover"
            />
          )}

          <div className="p-6 md:p-10">
            {article.category && (
              <p className="mb-3 text-sm font-semibold text-emerald-700">
                {article.category}
              </p>
            )}

            <h1 className="mb-6 text-3xl font-bold md:text-5xl">
              {article.title}
            </h1>

            {article.description && (
              <div
                className="mb-8 rounded-2xl bg-[#f7f3ea] p-5 text-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: article.description }}
              />
            )}

            <div
              className="prose prose-lg max-w-none prose-headings:text-[#14231b] prose-p:leading-8 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>
        </article>
      </section>
    </main>
  );
}