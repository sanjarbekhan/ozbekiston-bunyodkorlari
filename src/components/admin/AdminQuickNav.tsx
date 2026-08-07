"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminQuickNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login" || pathname.startsWith("/admin/applications")) return null;

  return (
    <Link
      href="/admin/applications"
      className="fixed bottom-24 right-4 z-[70] inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071426] px-5 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(7,20,38,.28)] transition hover:bg-[#0043a4] md:bottom-6 md:right-6"
      aria-label="Arizalarni ochish"
    >
      <span aria-hidden="true">📥</span>
      Arizalar
    </Link>
  );
}
