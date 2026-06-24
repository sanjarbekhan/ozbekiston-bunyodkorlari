import Link from "next/link";

export default function SiteMenu() {
  return (
    <details className="group">
      <summary className="fixed left-4 top-4 z-[90] flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-white shadow-xl ring-2 ring-[#e6a12a] marker:hidden">
        <span className="relative block h-[2px] w-6 bg-black before:absolute before:left-0 before:top-[-8px] before:h-[2px] before:w-6 before:bg-black before:content-[''] after:absolute after:left-0 after:top-[8px] after:h-[2px] after:w-6 after:bg-black after:content-['']" />
      </summary>

      <div className="fixed inset-0 z-[70] hidden bg-black/55 backdrop-blur-sm group-open:block" />

      <nav className="fixed left-0 top-0 z-[80] hidden h-screen w-[82%] max-w-[330px] bg-white px-6 pb-8 pt-24 shadow-2xl group-open:block">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0043a4]">
            O‘zBYE menu
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[#111827]">
            O‘zbekiston Bunyodkor Yoshlari
          </h2>
        </div>

        <div className="space-y-2">
          <Link href="/" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Bosh sahifa
          </Link>

          <Link href="/haqida" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Biz haqimizda
          </Link>

          <Link href="/#bunyodkorlar" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Bunyodkorlar Sahifasi
          </Link>

          <Link href="/tavsiyalari" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Tavsiyalar
          </Link>

          <Link href="/sahifasi" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Iqtiboslar
          </Link>

          <Link href="/ariza-qoldrish" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Ariza qoldirish
          </Link>

          <Link href="/hamkor-loyihasi" className="block rounded-2xl px-4 py-4 text-base font-black text-[#111827] transition hover:bg-[#0043a4] hover:text-white">
            Hamkor loyihasi
          </Link>
        </div>
      </nav>
    </details>
  );
}
