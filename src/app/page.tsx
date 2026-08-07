import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const CDN = "https://static.tildacdn.com";
const logo = `${CDN}/tild3930-6332-4462-b433-666662616534/5a50e2d5-de5a-4869-a.png`;
const hero = `${CDN}/tild6130-3635-4939-b332-343333356531/yangi_uzb.png`;
const journal = `${CDN}/tild6262-6235-4637-b939-626163336461/bunyodkorlar_online_.png`;
const quote1 = `${CDN}/tild3132-6235-4261-a463-323164336563/fewref.png`;
const quote2 = `${CDN}/tild6166-6135-4231-b331-386430656436/jhgg.png`;
const quote3 = `${CDN}/tild6338-3066-4763-a533-653265343864/chatgpt_image_may_4_.png`;
const rulesImage = `${CDN}/tild3263-6635-4137-b135-643566303437/acsacs.png`;
const awardsImage = `${CDN}/tild6464-3330-4366-b266-396135343166/720__80_78f45d39941d.jpg`;

function stripHtml(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

const menu = [
  ["Bosh sahifa", "/"],
  ["Biz haqimizda", "/biz_haqimizda"],
  ["Yoshlarimiz", "/bunyodkorlar_sahifasi"],
  ["Bunyodkorlar online jurnali", "/bunyodkorlar_online_jurnali_birinchi_son"],
  ["Yoshlarimizdan iqtiboslar", "/iqtiboslar_sahifasi"],
  ["TOP 100 Yoshlarimiz", "/bunyodkorlar_sahifasi"],
];

export default async function Home() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id,title,slug,category,image_url,description,status,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return <main className="p-10">Ma&apos;lumotlarni yuklashda xatolik: {error.message}</main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black" style={{ fontFamily: "'PT Sans', Arial, sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

      {/* Original Tilda-style global header from the latest export */}
      <header className="relative z-50 border-b border-black/5 bg-[#fefefe]">
        <div className="mx-auto flex min-h-[92px] max-w-[1480px] items-center gap-7 px-5 lg:px-8">
          <Link href="/" className="shrink-0">
            <img src={logo} alt="O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi" className="h-auto w-[205px] object-contain md:w-[235px]" />
          </Link>

          <nav className="ml-auto hidden items-center gap-5 xl:flex">
            {menu.map(([label, href]) => (
              <Link key={label} href={href} className="text-[13px] font-bold text-black transition hover:text-[#0043a4]">
                {label}
              </Link>
            ))}
            <Link href="/ariza-qoldrish" className="bg-[#0043a4] px-6 py-3 text-[12px] font-bold uppercase tracking-[.08em] text-white">
              Ariza qoldirish
            </Link>
          </nav>

          <details className="group ml-auto xl:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-black/20 bg-white marker:hidden">
              <span className="text-2xl leading-none">☰</span>
            </summary>
            <div className="absolute left-0 right-0 top-full border-t border-black/5 bg-white px-5 py-5 shadow-xl">
              <div className="mx-auto flex max-w-5xl flex-col">
                {menu.map(([label, href]) => (
                  <Link key={label} href={href} className="border-b border-black/10 py-4 text-sm font-bold">
                    {label}
                  </Link>
                ))}
                <Link href="/ariza-qoldrish" className="mt-5 bg-[#0043a4] px-5 py-4 text-center text-sm font-bold text-white">
                  Ariza qoldirish
                </Link>
              </div>
            </div>
          </details>
        </div>
      </header>

      {/* Magazine strip that exists above the hero in the Tilda export */}
      <section className="overflow-hidden bg-white py-3">
        <div className="mx-auto grid max-w-[1200px] items-center gap-4 px-5 md:grid-cols-[1fr_auto]">
          <div className="relative min-h-[74px] overflow-hidden bg-[#0043a4]">
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${journal})`, backgroundPosition: "center", backgroundSize: "cover" }} />
            <div className="relative flex min-h-[74px] items-center justify-between gap-5 px-5 md:px-8">
              <p className="text-xl font-bold uppercase tracking-[.04em] text-white md:text-3xl">ENDI BIZDA JURNAL BOR</p>
              <Link href="/bunyodkorlar_online_jurnali_birinchi_son" className="shrink-0 border border-white px-4 py-2 text-xs font-bold text-white md:px-6 md:py-3">
                Jurnalni o&apos;qish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* T997-style Tilda cover */}
      <section className="relative min-h-[calc(100vh-110px)] overflow-hidden text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
        <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1200px] flex-col justify-center px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-[780px]">
            <h1 className="text-[38px] font-bold leading-[1.08] md:text-[52px] md:leading-[1.12]">
              Bu yerda O‘zbekiston rivojiga munosib hissa qoshayotgan bunyodor yoshlaring ismlari jamlangan
            </h1>
            <p className="mt-5 max-w-[760px] text-lg leading-7 md:text-[22px] md:leading-8">
              Ular qatorida siz ham bo&apos;lishingiz mumkin, biz bilan boglaning!!!
            </p>
            <Link href="/ariza-qoldrish" className="mt-7 inline-flex min-h-[60px] items-center justify-center bg-[#0043a4] px-12 text-sm font-bold uppercase tracking-[.08em] text-white transition hover:bg-[#00327c]">
              Ariza qoldirish
            </Link>
          </div>

          <div className="mt-12 grid gap-7 border-t border-white/25 pt-8 md:mt-16 md:grid-cols-3 md:gap-12">
            <div>
              <h2 className="text-xl font-bold leading-tight">O‘zbekiston bunyodkorlari ensiklopediyasi: Kelajakni qurayotgan iqtidorlar maskani.</h2>
              <p className="mt-4 text-sm leading-6 text-white/90">Ushbu platforma mamlakatimizning eng yorqin va tashabbuskor yoshlari erishgan natijalarni bir nuqtaga birlashtiradi. O‘z yutuqlaringiz bilan yangi O‘zbekiston tarixini birgalikda yarataylik!</p>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Biz nimalar qilamiz?</h2>
              <p className="mt-4 text-sm leading-6 text-white/90">O‘zbekiston bunyodkorlari haqidagi eng to‘liq va ishonchli ensiklopediya – bu nafaqat ma’lumot manbai, balki har bir yosh uchun ilhom va rag‘batdir. Bu yerda yurtimizni dunyoga tanitayotgan yoshlarning hikoyalari jamlangan.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">O‘z kelajagingni biz bilan bunyod et!</h2>
              <p className="mt-4 text-sm leading-6 text-white/90">Mashhur bunyodkorlarimiz hayoti va faoliyati bilan tanishing, ularning qadamlarini izlang va o‘z kelajagingizni bunyod eting. Biz bilan birga – orzularingiz sari jasorat bilan qadam qo‘ying!</p>
            </div>
          </div>
        </div>
      </section>

      {/* T915-like feed, now powered by Supabase instead of Tilda Feed */}
      <section className="bg-[#efefef] px-5 pb-12 pt-[75px] md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center text-[44px] font-bold uppercase leading-none text-[#333] md:text-[80px]">ULAR QAYSI SOHALARDA?</h2>
          <p className="mx-auto mt-6 max-w-[900px] text-center font-serif text-[16px] leading-7 text-[#0043a4]">
            Bu yerda faqat so&apos;ngi bunyodkorlar haqidagi ma&apos;lumotlar ko&apos;rinadi. Qaysidir bunyodkorni qidiryotgan bo&apos;lsangiz &quot;Bunyodkorlar sahifasiga&quot; ga o&apos;ting yoki qidirish tugmasini bosing!
          </p>

          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-6 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {(articles || []).map((article) => (
              <Link key={article.id} href={`/bunyodkorlar/${article.slug}`} className="group min-w-[78%] snap-start overflow-hidden rounded-[30px] bg-white shadow-[0_8px_24px_rgba(0,0,0,.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,.40)] sm:min-w-[46%] md:min-w-0">
                <div className="relative aspect-square overflow-hidden bg-[#ddd]">
                  {article.image_url ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : null}
                  {article.category ? <span className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#0043a4]">{article.category}</span> : null}
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-[22px] font-bold leading-none text-black">{article.title}</h3>
                  <p className="mt-4 line-clamp-4 text-[10px] font-bold leading-[1.55] text-[#0043a4]">{stripHtml(article.description)}</p>
                  <p className="mt-5 text-[11px] text-black/45">{fmtDate(article.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="py-[60px] text-center md:py-[90px]">
            <Link href="/bunyodkorlar_sahifasi" className="inline-flex min-h-[60px] items-center justify-center bg-[#0043a4] px-10 text-sm font-bold uppercase tracking-[2px] text-white md:px-16">
              Bunyodkorlar sahifasiga o&apos;tish
            </Link>
          </div>
        </div>
      </section>

      {/* Quotes block from the original homepage */}
      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-[800px] text-[42px] font-bold leading-[.98] text-[#111] md:text-[70px]">Bunyodkorlardan iqtiboslar</h2>
            <Link href="/iqtiboslar_sahifasi" className="bg-[#0043a4] px-8 py-4 text-sm font-bold uppercase tracking-[.1em] text-white">Iqtiboslar</Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { image: quote1, quote: "Vaqtingizni behuda bahslarga emas, bilim va malaka to‘plashga sarflang. ‘Hali erta’ yoki ‘keyin qilaman’ degan bahonalarga berilmang. O‘zingizga ishoning, lekin ishonchni harakat bilan isbotlang", name: "Musayev Omadbek", role: "Psixolog, jamoat yetakchisi" },
              { image: quote2, quote: "Har bir katta natija intizom, sabr va davomiy harakatdan boshlanadi. O‘zingiz uchun mas’uliyatni boshqalarga topshirmang.", name: "O‘zbekiston bunyodkor yoshlari", role: "Yoshlar uchun ilhom" },
              { image: quote3, quote: "Bugun qilgan kichik qadamlaringiz ertangi katta imkoniyatlaringizning poydevoriga aylanadi.", name: "Bunyodkorlardan iqtiboslar", role: "Ensiklopediya" },
            ].map((item) => (
              <article key={item.image} className="overflow-hidden bg-[#f3f3f3]">
                <div className="aspect-[4/5] overflow-hidden bg-[#ddd]"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>
                <div className="p-6 md:p-8">
                  <p className="text-[17px] leading-7">{item.quote}</p>
                  <p className="mt-7 text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-black/55">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Original awards/opportunities idea */}
      <section className="bg-[#0043a4] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <h2 className="text-[48px] font-bold leading-[.95] md:text-[76px]">Balki siz ham qo&apos;shilarsiz...</h2>
              <p className="mt-6 text-2xl font-bold">Omad tilaymiz</p>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/85">O&apos;zbekiston bunyodkor yoshlari ensiklopediyasiga kiritilgan istiqbolli yoshlar quyidagi yo&apos;nalishlarda faoliyat yuritib, jamiyat rivojiga hissa qo&apos;shmoqda.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Kelajak bunyodkori medali", "Mard o‘g‘lon mukofoti", "Zulfiya mukofoti", "Evrika mukofoti", "C.A.T. Science Accelerator", "Startap-tashabbuslar", "El-Yurt Umidi", "Erasmus Mundus", "Davlat stipendiyalari", "Besh tashabbus olimpiadasi", "Yoshlar ovozi"].map((tag) => (
                  <span key={tag} className="border border-white/35 px-4 py-2 text-xs font-bold">{tag}</span>
                ))}
              </div>
            </div>
            <div className="overflow-hidden bg-white/10 p-3"><img src={awardsImage} alt="Yoshlar mukofotlari" className="h-auto w-full object-cover" /></div>
          </div>
        </div>
      </section>

      {/* Rules block */}
      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <h2 className="text-[48px] font-bold leading-[.95] text-[#0043a4] md:text-[78px]">Qoidalar bilan tanishing</h2>
            <div className="mt-12">
              {[
                ["Ariza qoldirish", "Web-sayt yoki ijtimoiy tarmoqlar orqali qoldirlilgan so‘rovnomani to‘ldirib ariza qoldiriladi"],
                ["Siz bilan bog‘lanamiz", "Mutaxassislarimiz avval sizga qo‘ng‘iroq qilishadi va keyin telegramdan bog‘lanishadi"],
                ["Ma’lumotlarni taqdim etish", "Ko‘rsatilgan maxsus shaklda ma’lumotlar taqdim etilgach, nomzod ensiklopedik ahamiyatga mos ekanligi o‘rganilib, bir xulosaga kelinadi."],
              ].map(([title, text]) => (
                <div key={title} className="grid gap-3 border-t-[7px] border-[#0043a4] py-7 md:grid-cols-[260px_1fr]">
                  <h3 className="text-2xl font-bold text-[#0043a4] md:text-3xl">{title}</h3>
                  <p className="text-sm font-bold leading-6 text-black">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center"><img src={rulesImage} alt="O‘zbekiston Bunyodkor Yoshlari" className="w-full max-w-[520px] object-contain" /></div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#f7f7f7] px-5 py-12 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <img src={logo} alt="O‘zbekiston Bunyodkor Yoshlari" className="w-[250px] max-w-full" />
            <p className="mt-5 max-w-xl text-lg font-bold">Biz bilan imidjingizni yaxshilang va tarixga kiring!</p>
            <p className="mt-3 text-sm text-black/50">&quot;Smart Combinator&quot; 2026</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="border border-black px-5 py-3 text-sm font-bold">Instagram</a>
            <a href="https://t.me/UzBYE_bot" target="_blank" rel="noreferrer" className="border border-black px-5 py-3 text-sm font-bold">Telegram</a>
            <Link href="/ariza-qoldrish" className="bg-[#0043a4] px-5 py-3 text-sm font-bold text-white">Ariza qoldirish</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
