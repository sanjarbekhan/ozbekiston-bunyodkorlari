import Link from "next/link";

export default function HaqidaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <header className="absolute left-0 top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-start justify-between px-4 py-4 md:px-6">
          <details className="group relative">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur marker:hidden">
              <span className="relative block h-[2px] w-6 bg-black before:absolute before:left-0 before:top-[-8px] before:h-[2px] before:w-6 before:bg-black before:content-[''] after:absolute after:left-0 after:top-[8px] after:h-[2px] after:w-6 after:bg-black after:content-['']" />
            </summary>

            <div className="absolute left-0 top-16 w-[260px] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <Link href="/" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Bosh sahifa
              </Link>
              <Link href="/haqida" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Biz haqimizda
              </Link>
              <Link href="/#bunyodkorlar" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Bunyodkorlar Sahifasi
              </Link>
              <Link href="/tavsiyalari" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Tavsiyalar
              </Link>
              <Link href="/sahifasi" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Iqtiboslar
              </Link>
              <Link href="/ariza-qoldrish" className="block border-b border-gray-100 px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Ariza qoldirish
              </Link>
              <Link href="/hamkor-loyihasi" className="block px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Hamkor loyihasi
              </Link>
            </div>
          </details>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#07182b] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url('/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png')",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-32">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-white/70">
            O‘zbekiston Bunyodkor Yoshlari
          </p>

          <h1 className="max-w-4xl text-[38px] font-black leading-[0.98] tracking-[-0.05em] md:text-[72px]">
            Biz haqimizda
          </h1>

          <p className="mt-8 max-w-3xl text-base font-semibold leading-8 text-white/90 md:text-xl md:leading-9">
            “O‘zbekiston Bunyodkor Yoshlari” ensiklopediyasi — mamlakatimiz
            rivojiga o‘z hissasini qo‘shayotgan, bilim, tashabbus, ijod,
            liderlik va mehnati bilan ajralib turgan yoshlarni tanitish uchun
            yaratilgan platforma.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-t-[6px] border-[#0043a4] pt-6">
              <h2 className="text-2xl font-black text-[#0043a4]">
                Maqsadimiz
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-gray-800 md:text-base">
                Iqtidorli, faol va bunyodkor yoshlarning yutuqlarini jamlash,
                ularning faoliyatini keng jamoatchilikka tanitish va boshqalarga
                ilhom manbai sifatida ko‘rsatish.
              </p>
            </div>

            <div className="border-t-[6px] border-[#0043a4] pt-6">
              <h2 className="text-2xl font-black text-[#0043a4]">
                Nima qilamiz?
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-gray-800 md:text-base">
                Nomzodlar haqidagi ma’lumotlarni ensiklopedik shaklda tayyorlaymiz,
                ularni sayt, ijtimoiy tarmoqlar va boshqa axborot maydonlarida
                ommaga taqdim etamiz.
              </p>
            </div>

            <div className="border-t-[6px] border-[#0043a4] pt-6">
              <h2 className="text-2xl font-black text-[#0043a4]">
                Kimlar uchun?
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-gray-800 md:text-base">
                Ta’lim, ilm-fan, ijod, sport, tadbirkorlik, volontyorlik,
                jurnalistika, IT, san’at va boshqa sohalarda o‘zini ko‘rsatayotgan
                yoshlar uchun.
              </p>
            </div>
          </div>

          <div className="mt-14 rounded-[28px] bg-[#f2f6ff] p-6 md:mt-20 md:p-10">
            <h2 className="text-[32px] font-black leading-tight tracking-[-0.04em] text-[#0043a4] md:text-[52px]">
              Yangi davr bunyodkorlari va ilhom izlovchilarga murojaat
            </h2>

            <p className="mt-6 max-w-4xl text-sm font-semibold leading-8 text-gray-800 md:text-lg md:leading-9">
              Zamonamizning ilg‘or aql egalari va kashfiyotchilarining
              muvaffaqiyat yo‘li bilan tanishing va kelajak dunyosini kashf
              eting. Biz bilan birga o‘z orzularingizni reallikka aylantirish
              uchun dadil qadam qo‘ying.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ariza-qoldrish"
                className="rounded-full bg-[#0043a4] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                Ariza qoldirish
              </Link>

              <Link
                href="/#bunyodkorlar"
                className="rounded-full border-2 border-[#0043a4] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-[#0043a4]"
              >
                Bunyodkorlar sahifasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0043a4] px-4 py-10 text-center text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-black">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://t.me/UzBYE_bot" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <Link href="/ariza-qoldrish">Ariza qoldirish</Link>
          </div>

          <p className="mt-8 text-sm font-semibold text-white/90">
            Biz bilan imidjingizni yaxshilang va tarixga kiring!
          </p>
          <p className="mt-1 text-sm font-semibold text-white/90">
            “Smart Combinator” 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
