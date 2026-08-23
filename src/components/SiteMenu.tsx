"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const desktopItems = [
  ["/", "Bosh sahifa"],
  ["/bunyodkorlar", "Ensiklopediya"],
  ["/reyting", "Reyting"],
  ["/sanjar-ai", "Bunyodkor AI"],
  ["/haqida", "Loyiha haqida"],
] as const;

const mobileItems = [
  ...desktopItems,
  ["/tavsiyalari", "Tavsiyalar"],
  ["/sahifasi", "Iqtiboslar"],
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
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[90] overflow-hidden border-b border-slate-200/70 bg-white shadow-[0_8px_30px_rgba(15,23,42,.08)] xl:hidden">
        <div className="relative w-full bg-white">
          <Link href="/" className="block w-full" aria-label="Bosh sahifa">
            <img
              src="/images/bunyodkorlar-online-header.svg"
              alt="Bunyodkorlar Online jurnali"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </Link>

          <button
            type="button"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 text-[#10263f] shadow-[0_8px_24px_rgba(15,23,42,.16)] backdrop-blur-md transition active:scale-95 sm:right-5 sm:h-14 sm:w-14 sm:rounded-[20px]"
          >
            <span className="relative block h-5 w-6">
              <span className={`absolute left-0 top-[2px] h-[2px] w-6 rounded-full bg-current transition duration-300 ${open ? "translate-y-[8px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[10px] h-[2px] w-6 rounded-full bg-current transition duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-current transition duration-300 ${open ? "-translate-y-[8px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      <header className="fixed inset-x-0 top-0 z-[90] hidden h-[100px] overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(90deg,#08bff0_0%,#12c2ef_38%,#f8fbff_72%,#ffffff_100%)] shadow-[0_8px_30px_rgba(15,23,42,.08)] xl:block">
        <Link href="/" aria-label="Bosh sahifa" className="absolute inset-0 block">
          <img
            src="/images/bunyodkorlar-online-desktop.webp"
            alt="Bunyodkorlar Online jurnali"
            className="absolute left-1/2 top-0 h-[100px] w-[1200px] max-w-none -translate-x-1/2 select-none object-contain"
            draggable={false}
          />
        </Link>

        <nav className="absolute left-[58%] top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border border-white/80 bg-white/88 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,.16)] backdrop-blur-xl">
          {desktopItems.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-extrabold transition ${
                isActive(href)
                  ? "bg-[#e9f2ff] text-[#0043a4]"
                  : "text-[#1d3048] hover:bg-slate-100/90 hover:text-[#0043a4]"
              }`}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/ariza-qoldrish"
            className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#126cf3] to-[#4b5dff] px-4 py-2 text-[12px] font-black text-white shadow-[0_8px_22px_rgba(22,108,243,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(22,108,243,.32)]"
          >
            Ariza qoldirish <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <div aria-hidden="true" className="hidden h-[26px] xl:block" />

      {open && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-[#071426]/55 backdrop-blur-sm xl:hidden"
          />

          <nav className="fixed right-3 top-[clamp(76px,15.625vw,124px)] z-[80] w-[calc(100%-24px)] max-w-sm overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,.22)] xl:hidden">
            <div className="space-y-1.5">
              {mobileItems.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-2xl px-4 py-3.5 text-[15px] font-extrabold transition ${
                    isActive(href)
                      ? "bg-[#0043a4] text-white"
                      : "text-[#172033] hover:bg-[#eef4ff] hover:text-[#0043a4]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link
              href="/ariza-qoldrish"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#126cf3] to-[#4b5dff] px-5 py-4 text-sm font-black text-white shadow-[0_10px_25px_rgba(11,99,206,.2)]"
            >
              Ariza qoldirish <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
