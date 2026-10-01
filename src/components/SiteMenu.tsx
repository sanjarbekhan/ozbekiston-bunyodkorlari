"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const desktopItems = [
  ["/", "Bosh sahifa"],
  ["/bunyodkorlar", "Ensiklopediya"],
  ["/reyting", "Reyting"],
  ["/bunyodkor-ai", "Bunyodkor AI ✦"],
  ["/haqida", "Loyiha haqida"],
] as const;

const mobileItems = [
  ...desktopItems,
  ["/tavsiyalari", "Tavsiyalar"],
  ["/iqtiboslar", "Iqtiboslar"],
  ["/hamkor-loyihasi", "Hamkorlik"],
] as const;

export default function SiteMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[90] border-b border-[#edf1f6]/90 bg-white/88 shadow-[0_8px_32px_rgba(15,35,75,.045)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center gap-4 px-4 sm:h-[82px] sm:px-6 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Bosh sahifa">
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f1f5ff] sm:h-10 sm:w-10">
              <img
                src="/tilda/images/ozbye-new-logo.svg"
                alt=""
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            </span>
            <span className="hidden text-[19px] font-black tracking-[-0.045em] text-[#0b1530] sm:block">
              bunyodkor.com
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 xl:flex">
            {desktopItems.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  "whitespace-nowrap rounded-full px-3.5 py-2.5 text-[12px] font-extrabold transition " +
                  (isActive(href)
                    ? "bg-[#eef4ff] text-[#245fff]"
                    : "text-[#45526c] hover:bg-[#f5f7fb] hover:text-[#245fff]")
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <form action="/bunyodkorlar" method="get" className="ml-auto hidden w-[250px] shrink-0 2xl:block">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#8794aa]">⌕</span>
              <input
                type="search"
                name="q"
                placeholder="Ism, yo‘nalish yoki loyiha..."
                className="h-11 w-full rounded-[17px] border border-[#edf1f6] bg-[#f8faff] pl-10 pr-4 text-[12px] font-bold text-[#18223a] outline-none transition placeholder:text-[#9ca8bb] focus:border-[#b9ccfb] focus:bg-white"
              />
            </label>
          </form>

          <Link
            href="/ariza-qoldirish"
            className="ml-auto hidden shrink-0 items-center gap-2 rounded-[15px] bg-gradient-to-r from-[#1767ff] to-[#4259ff] px-5 py-3 text-[12px] font-black text-white shadow-[0_10px_28px_rgba(41,93,255,.20)] transition hover:-translate-y-0.5 xl:inline-flex 2xl:ml-0"
          >
            Ariza qoldirish <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#e6ebf3] bg-white text-[#12203a] shadow-[0_8px_24px_rgba(15,35,75,.06)] transition active:scale-95 xl:hidden"
          >
            <span className="relative block h-5 w-6">
              <span className={"absolute left-0 top-[2px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "translate-y-[8px] rotate-45" : "")} />
              <span className={"absolute left-0 top-[10px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "opacity-0" : "opacity-100")} />
              <span className={"absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "-translate-y-[8px] -rotate-45" : "")} />
            </span>
          </button>
        </div>
      </header>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-[#10213b]/20 backdrop-blur-sm xl:hidden"
          />

          <nav className="fixed left-3 right-3 top-[88px] z-[80] mx-auto max-w-md overflow-hidden rounded-[26px] border border-[#e5ebf4] bg-white/96 p-4 shadow-[0_28px_80px_rgba(26,50,93,.18)] backdrop-blur-2xl xl:hidden">
            <form action="/bunyodkorlar" method="get" className="mb-3">
              <input
                type="search"
                name="q"
                placeholder="Ism, yo‘nalish yoki loyiha..."
                className="h-12 w-full rounded-[16px] border border-[#e7edf5] bg-[#f7f9fd] px-4 text-sm font-bold outline-none placeholder:text-slate-400 focus:border-[#b9ccfb] focus:bg-white"
              />
            </form>

            <div className="space-y-1">
              {mobileItems.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={
                    "block rounded-[16px] px-4 py-3.5 text-[14px] font-extrabold transition " +
                    (isActive(href)
                      ? "bg-[#eef4ff] text-[#245fff]"
                      : "text-[#27354d] hover:bg-[#f5f7fb] hover:text-[#245fff]")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link
              href="/ariza-qoldirish"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#1767ff] to-[#4259ff] px-5 py-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(41,93,255,.20)]"
            >
              Ariza qoldirish <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
