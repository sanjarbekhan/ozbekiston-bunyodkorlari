"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileNavButton from "@/components/connect/ProfileNavButton";

const mobileItems = [
  ["/", "Bosh sahifa"],
  ["/bunyodkorlar", "Ensiklopediya"],
  ["/reyting", "Reyting"],
  ["/bunyodkor-ai", "Bunyodkor AI ✦"],
  ["/haqida", "Loyiha haqida"],
  ["/tavsiyalari", "Tavsiyalar"],
  ["/iqtiboslar", "Iqtiboslar"],
  ["/profil", "Shaxsiy profil"],
  ...(process.env.NEXT_PUBLIC_BUNYODKOR_CONNECT_ENABLED === "true" ? [["/chat", "Bunyodkor Connect"]] as const : []),
  ["/hamkor-loyihasi", "Hamkorlik"],
] as const;

const bottomLinks = [
  ["/", "Bosh", "house"],
  ["/bunyodkorlar", "Yoshlar", "users"],
  ["/iqtiboslar", "Iqtiboslar", "quote"],
  ["/ariza-qoldirish", "Ariza", "file"],
] as const;

function BottomIcon({ kind }: { kind: "house" | "users" | "quote" | "file" | "menu" | "chat" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "house" && <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-8h6v8" /></>}
    {kind === "users" && <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>}
    {kind === "quote" && <><path d="M10 11H4V5h7v8l-4 5" /><path d="M21 11h-6V5h7v8l-4 5" /></>}
    {kind === "file" && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M12 12v7M8.5 15.5h7" /></>}
    {kind === "menu" && <><path d="M4 7h16M4 12h16M4 17h16" /></>}
    {kind === "chat" && <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H8l-5 2 1.5-4.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h8M8 14h5"/></>}
  </svg>;
}

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
    {!pathname.startsWith("/chat") && (
    <header className="sticky top-0 z-[90] border-b border-[#edf1f6] bg-white shadow-[0_8px_28px_rgba(15,35,75,.06)]">
      <div className="relative mx-auto w-full max-w-[1200px] bg-white">
        <Link href="/" aria-label="Bosh sahifa" className="block w-full">
          <picture className="block w-full">
            <source media="(min-width: 768px)" srcSet="/images/bunyodkor-header-desktop.png" />
            <img
              src="/images/bunyodkor-header-mobile.png"
              alt="O‘zbekiston Bunyodkor Yoshlari"
              className="block h-auto w-full"
              width={1000}
              height={156}
              loading="eager"
            />
          </picture>
        </Link>
        <ProfileNavButton />

        <button
          type="button"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="absolute right-[15%] top-1/2 z-[95] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/80 bg-white/88 text-[#173a77] shadow-[0_8px_24px_rgba(15,35,75,.14)] backdrop-blur-md transition active:scale-95 md:h-10 md:w-10 md:rounded-[13px]"
        >
          <span className="relative block h-5 w-6">
            <span className={"absolute left-0 top-[2px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "translate-y-[8px] rotate-45" : "")} />
            <span className={"absolute left-0 top-[10px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "opacity-0" : "opacity-100")} />
            <span className={"absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-current transition duration-300 " + (open ? "-translate-y-[8px] -rotate-45" : "")} />
          </span>
        </button>

        {open && (
          <nav className="absolute left-3 right-3 top-[calc(100%+8px)] z-[100] mx-auto max-w-md overflow-hidden rounded-[24px] border border-[#e5ebf4] bg-white/98 p-4 shadow-[0_28px_80px_rgba(26,50,93,.20)] backdrop-blur-2xl md:left-auto md:right-4 md:w-[360px]">
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
        )}
      </div>

      {open && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 bg-[#10213b]/20 backdrop-blur-sm"
        />
      )}
    </header>
    )}
    <nav className="bunyodkor-bottom-nav" aria-label="Mobil navigatsiya">
      {bottomLinks.map(([href, label, kind]) => (
        <a
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={"bunyodkor-bottom-tab" + (isActive(href) ? " is-active" : "")}
          onClick={() => setOpen(false)}
        >
          <BottomIcon kind={kind} />
          <span>{label}</span>
        </a>
      ))}
      {process.env.NEXT_PUBLIC_BUNYODKOR_CONNECT_ENABLED === "true" ? (
        <a href="/chat" aria-current={isActive("/chat") ? "page" : undefined}
           className={"bunyodkor-bottom-tab" + (isActive("/chat") ? " is-active" : "")}>
          <BottomIcon kind="chat" /><span>Chat</span>
        </a>
      ) : (
        <button
          type="button"
          className={"bunyodkor-bottom-tab" + (open ? " is-active" : "")}
          aria-expanded={open}
          aria-label="Menyuni ochish"
          onClick={() => { setOpen((value) => !value); window.scrollTo({ top: 0, behavior: "auto" }); }}
        >
          <BottomIcon kind="menu" />
          <span>Menyu</span>
        </button>
      )}
    </nav>
    </>
  );
}
