import { supabase } from "@/lib/supabase";
import PublicArticles from "@/components/PublicArticles";

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

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold uppercase">
              ULAR QAYSI SOHALARDA?
            </h2>
            <p className="mt-2 max-w-3xl text-gray-600">
              Bu yerda faqat so‘nggi bunyodkorlar haqidagi ma’lumotlar ko‘rinadi.
              Qaysidir bunyodkorni qidirayotgan bo‘lsangiz, “Bunyodkorlar sahifasi”ga
              o‘ting yoki qidirish tugmasini bosing!
            </p>
          </div>

          <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold shadow">
            Jami: {articles?.length || 0} ta maqola
          </div>
        </div>

        <PublicArticles articles={articles || []} />
      </section>
    </main>
  );
}
