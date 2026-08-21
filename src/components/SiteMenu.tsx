"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  ["/", "Bosh sahifa"],
  ["/bunyodkorlar", "Bunyodkorlar katalogi"],
  ["/reyting", "Reyting"],
  ["/sanjar-ai", "Sanjar AI"],
  ["/haqida", "Biz haqimizda"],
  ["/tavsiyalari", "Tavsiyalar"],
  ["/sahifasi", "Iqtiboslar"],
  ["/ariza-qoldrish", "Ariza qoldirish"],
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

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="fixed left-4 top-4 z-[90] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#0043a4]/15 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.14)] backdrop-blur transition hover:border-[#0043a4]/35 hover:shadow-[0_10px_32px_rgba(15,23,42,0.18)]"
      >
        <span className="relative block h-5 w-6">
          <span
            className={`absolute left-0 top-[2px] h-[2px] w-6 rounded-full bg-[#111827] transition duration-300 ${
              open ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[10px] h-[2px] w-6 rounded-full bg-[#111827] transition duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-[#111827] transition duration-300 ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] cursor-default bg-[#071426]/55 backdrop-blur-sm"
          />

          <nav className="fixed left-0 top-0 z-[80] flex h-dvh w-[86%] max-w-[380px] flex-col overflow-y-auto border-r border-slate-200 bg-white px-6 pb-8 pt-24 shadow-2xl">
            <Link href="/" onClick={() => setOpen(false)} className="block">
              <img
                src="/tilda/images/ozbye-new-logo.svg"
                alt="O‘zbekiston Bunyodkor Yoshlari"
                className="h-11 w-auto max-w-[210px] object-contain object-left"
              />
            </Link>
            <p className="mt-5 max-w-[290px] text-sm font-medium leading-6 text-slate-500">
              O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
            </p>

            <div className="mt-8 space-y-1.5">
              {menuItems.map(([href, label]) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3.5 text-[15px] font-extrabold transition ${
                      active
                        ? "bg-[#0043a4] text-white"
                        : "text-[#172033] hover:bg-[#eef4ff] hover:text-[#0043a4]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto border-t border-slate-200 pt-6">
              <Link
                href="/ariza-qoldrish"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-[#0043a4] px-5 py-3.5 text-center text-sm font-extrabold text-white transition hover:bg-[#003681]"
              >
                Ariza qoldirish
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
