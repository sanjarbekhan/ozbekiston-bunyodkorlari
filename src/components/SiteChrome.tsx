"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="sticky top-0 z-[100] border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/tilda/images/tild3231-6436-4338-a534-366335323233__56517f45-cd2a-49fb-8.png"
              alt="O‘zbekiston Bunyodkor Yoshlari"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <Link href="/haqida" className="hover:text-[#0043a4]">
              Biz haqimizda
            </Link>
            <Link href="/#bunyodkorlar" className="hover:text-[#0043a4]">
              Bunyodkorlar Sahifasi
            </Link>
            <Link href="/tavsiyalari" className="hover:text-[#0043a4]">
              Tavsiyalar
            </Link>
            <Link href="/sahifasi" className="hover:text-[#0043a4]">
              Iqtiboslar
            </Link>
            <Link href="/ariza-qoldrish" className="hover:text-[#0043a4]">
              Ariza qoldirish
            </Link>
            <Link href="/hamkor-loyihasi" className="hover:text-[#0043a4]">
              Hamkor loyihasi
            </Link>
          </nav>

          <details className="group relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 marker:hidden">
  <span className="relative block h-[2px] w-6 bg-black transition-all duration-300 group-open:bg-transparent before:absolute before:left-0 before:top-[-8px] before:h-[2px] before:w-6 before:bg-black before:transition-all before:duration-300 before:content-[''] after:absolute after:left-0 after:top-[8px] after:h-[2px] after:w-6 after:bg-black after:transition-all after:duration-300 after:content-[''] group-open:before:top-0 group-open:before:rotate-45 group-open:after:top-0 group-open:after:-rotate-45" />
</summary>

            <div className="absolute right-0 top-14 w-[270px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100">
              <Link href="/haqida" className="block border-b px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Biz haqimizda
              </Link>
              <Link href="/#bunyodkorlar" className="block border-b px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Bunyodkorlar Sahifasi
              </Link>
              <Link href="/tavsiyalari" className="block border-b px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Tavsiyalar
              </Link>
              <Link href="/sahifasi" className="block border-b px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Iqtiboslar
              </Link>
              <Link href="/ariza-qoldrish" className="block border-b px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Ariza qoldirish
              </Link>
              <Link href="/hamkor-loyihasi" className="block px-5 py-4 text-sm font-bold hover:bg-[#0043a4] hover:text-white">
                Hamkor loyihasi
              </Link>
            </div>
          </details>
        </div>
      </header>

      {children}

      <footer className="bg-[#0043a4] px-4 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img
              src="/tilda/images/tild3231-6436-4338-a534-366335323233__56517f45-cd2a-49fb-8.png"
              alt="O‘zbekiston Bunyodkor Yoshlari"
              className="h-12 w-auto rounded bg-white p-2"
            />
            <p className="mt-4 max-w-md text-sm font-medium leading-7 text-white/85">
              O‘zbekiston Bunyodkor Yoshlari ensiklopediyasi — o‘z sohasi
              bo‘yicha izlanayotgan, yaratayotgan va jamiyatga hissa qo‘shayotgan
              yoshlarni tanituvchi platforma.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-black">Sahifalar</h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-white/85">
              <Link href="/haqida" className="hover:text-white">Biz haqimizda</Link>
              <Link href="/#bunyodkorlar" className="hover:text-white">Bunyodkorlar Sahifasi</Link>
              <Link href="/tavsiyalari" className="hover:text-white">Tavsiyalar</Link>
              <Link href="/sahifasi" className="hover:text-white">Iqtiboslar</Link>
              <Link href="/hamkor-loyihasi" className="hover:text-white">Hamkor loyihasi</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black">Bog‘lanish</h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-white/85">
              <a href="https://t.me/UzBYE_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Telegram bot
              </a>
              <Link href="/ariza-qoldrish" className="hover:text-white">
                Ariza qoldirish
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/20 pt-5 text-center text-xs font-semibold text-white/70">
          © 2026 O‘zbekiston Bunyodkor Yoshlari. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
}