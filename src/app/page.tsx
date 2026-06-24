import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function Home() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold text-red-600">Xatolik</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#14231b]">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-10 rounded-3xl bg-[#0f3d2e] px-6 py-12 text-white shadow-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-100">
            Ensiklopediya
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">
            O‘zbekiston Bunyodkor Yoshlari
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-50">
            Yurt ravnaqiga hissa qo‘shayotgan faol, iqtidorli va bunyodkor yoshlar haqidagi biografik maqolalar.
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold">Bunyodkorlar</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles?.map((article) => (
            <Link
              key={article.id}
              href={`/bunyodkorlar/${article.slug}`}
              className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="h-64 w-full object-cover"
                />
              )}

              <div className="p-5">
                {article.category && (
                  <p className="mb-2 text-sm font-semibold text-emerald-700">
                    {article.category}
                  </p>
                )}
                <h3 className="text-xl font-bold">{article.title}</h3>
                {article.description && (
                  <div
                    className="mt-3 line-clamp-3 text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: article.description }}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}