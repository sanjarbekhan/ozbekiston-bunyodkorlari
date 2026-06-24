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
};

function cleanText(text: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function SahifasiPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <SiteMenu />

      <section className="bg-[#0043a4] px-4 py-4 text-center">
        <h1 className="text-lg font-black text-white">Iqtiboslar</h1>
      </section>

      <section className="px-4 pb-14 pt-20 md:px-8 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-5">
            <h2 className="max-w-3xl text-[42px] font-black leading-[0.95] tracking-[-0.05em] text-black sm:text-[56px] md:text-[76px]">
              Bunyodkorlardan iqtiboslar
            </h2>

            <div className="mt-2 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-2xl md:h-20 md:w-20">
              <span className="text-4xl leading-none">⌕</span>
            </div>
          </div>

          <div className="-mx-4 mt-16 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:gap-8 md:px-0">
            {(articles || []).map((article: Article) => {
              const desc = cleanText(article.description);
              const quote =
                desc ||
                "O‘z oldingizga katta maqsad qo‘ying, bilim oling va harakatdan to‘xtamang.";

              return (
                <article
                  key={article.id}
                  className="min-w-[86%] snap-start rounded-[28px] border-[3px] border-[#0043a4] bg-white p-6 shadow-[0_18px_45px_rgba(0,67,164,0.18)] sm:min-w-[60%] md:min-w-[390px] md:max-w-[430px] md:p-8"
                >
                  <div className="mb-7 h-[150px] w-[120px] overflow-hidden rounded-xl bg-gray-100">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src="/tilda/images/tild3231-6436-4338-a534-366335323233__56517f45-cd2a-49fb-8.png"
                        alt={article.title}
                        className="h-full w-full object-contain p-3"
                      />
                    )}
                  </div>

                  <p className="line-clamp-6 text-[20px] font-medium leading-[1.45] text-black md:text-[23px]">
                    {quote}
                  </p>

                  <h3 className="mt-8 text-[22px] font-black text-black">
                    {article.title}
                  </h3>

                  <p className="mt-2 text-base font-semibold text-gray-500">
                    O‘zbekiston Bunyodkor Yoshlari ensiklopediyasi a’zosi
                  </p>
                </article>
              );
            })}

            {(!articles || articles.length === 0) && (
              <div className="min-w-full rounded-[28px] border-[3px] border-[#0043a4] bg-white p-8 text-center shadow-xl">
                <h3 className="text-2xl font-black text-[#0043a4]">
                  Hozircha iqtiboslar topilmadi
                </h3>
                <p className="mt-3 text-base text-gray-600">
                  Maqolalar bazaga qo‘shilgandan so‘ng bu yerda avtomatik chiqadi.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-[44px] font-black leading-[0.95] tracking-[-0.05em] text-[#0043a4] sm:text-[58px] md:text-[76px]">
              Qoidalar bilan tanishing
            </h2>

            <div className="mt-10 space-y-0">
              <div className="border-t-[5px] border-[#0043a4] py-6 md:grid md:grid-cols-[260px_1fr]">
                <h3 className="text-2xl font-black text-[#0043a4]">
                  Ariza qoldirish
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-black md:mt-0">
                  Web-sayt yoki ijtimoiy tarmoqlar orqali qoldirilgan
                  so‘rovnomani to‘ldirib ariza qoldiriladi.
                </p>
              </div>

              <div className="border-t-[5px] border-[#0043a4] py-6 md:grid md:grid-cols-[260px_1fr]">
                <h3 className="text-2xl font-black text-[#0043a4]">
                  Siz bilan bog‘lanamiz
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-black md:mt-0">
                  Mutaxassislarimiz avval sizga qo‘ng‘iroq qilishadi va keyin
                  Telegramdan bog‘lanishadi.
                </p>
              </div>

              <div className="border-t-[5px] border-[#0043a4] py-6 md:grid md:grid-cols-[260px_1fr]">
                <h3 className="text-2xl font-black text-[#0043a4]">
                  Ma’lumotlarni taqdim etish
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-black md:mt-0">
                  Ko‘rsatilgan maxsus shaklda ma’lumotlar taqdim etilgach,
                  nomzod ensiklopedik ahamiyatga mos ekanligi o‘rganiladi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src="/tilda/images/tild3263-6635-4137-b135-643566303437__acsacs.png"
              alt="O‘ZBYE"
              className="w-full max-w-[280px] object-contain md:max-w-[440px]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
