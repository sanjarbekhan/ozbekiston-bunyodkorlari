"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  ["/", "Bosh sahifa"],
  ["/bunyodkorlar", "Bunyodkorlar katalogi"],
  ["/haqida", "Biz haqimizda"],
  ["/tavsiyalari", "Tavsiyalar"],
  ["/sahifasi", "Iqtiboslar"],
  ["/ariza-qoldrish", "Ariza qoldirish"],
  ["/hamkor-loyihasi", "Hamkor loyihasi"],
] as const;

export default function SiteMenu() {
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
        className="fixed left-4 top-4 z-[90] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white shadow-xl ring-2 ring-[#e6a12a]"
      >
        <span className="relative block h-[2px] w-6 bg-black before:absolute before:left-0 before:top-[-8px] before:h-[2px] before:w-6 before:bg-black before:content-[''] after:absolute after:left-0 after:top-[8px] after:h-[2px] after:w-6 after:bg-black after:content-['']" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] cursor-default bg-black/55 backdrop-blur-sm"
          />

          <nav className="fixed left-0 top-0 z-[80] h-screen w-[82%] max-w-[350px] overflow-y-auto bg-white px-6 pb-8 pt-24 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[.25em] text-[#0043a4]">
              O‘zBYE
            </p>
            <h2 className="mb-8 mt-2 text-2xl font-black leading-tight">
              O‘zbekiston Bunyodkor Yoshlari
            </h2>

            <div className="space-y-2">
              {menuItems.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-4 text-base font-black transition hover:bg-[#0043a4] hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
