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
      <header className="fixed inset-x-0 top-0 z-[90] overflow-hidden border-b border-slate-200/70 bg-white shadow-[0_8px_30px_rgba(15,23,42,.08)] lg:hidden">
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

      <header className="fixed inset-x-0 top-0 z-[90] hidden border-b border-slate-200/70 bg-white/92 shadow-[0_8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-5 px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/tilda/images/ozbye-new-logo.svg"
              alt="O‘zbekiston Bunyodkor Yoshlari"
              className="h-11 w-auto max-w-[220px] object-contain object-left"
            />
          </Link>

          <nav className="flex items-center gap-1">
            {desktopItems.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                  isActive(href)
                    ? "bg-[#eaf2ff] text-[#0043a4]"
                    : "text-[#25364a] hover:bg-slate-100 hover:text-[#0043a4]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href="/ariza-qoldrish"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#126cf3] to-[#4b5dff] px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_28px_rgba(22,108,243,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(22,108,243,.34)]"
          >
            Ariza qoldirish <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-[#071426]/55 backdrop-blur-sm lg:hidden"
          />

          <nav className="fixed right-3 top-[clamp(76px,15.625vw,124px)] z-[80] w-[calc(100%-24px)] max-w-sm overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,.22)] lg:hidden">
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
