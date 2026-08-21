"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminQuickNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const links = [
    { href: "/admin/applications", label: "Arizalar", icon: "📥" },
    { href: "/admin/biographies", label: "Anketalar", icon: "📝" },
    { href: "/admin/comments", label: "Kommentlar", icon: "💬" },
  ].filter((link) => !pathname.startsWith(link.href));

  if (links.length === 0) return null;

  return (
    <nav className="fixed bottom-24 right-4 z-[70] flex flex-col items-end gap-2 md:bottom-6 md:right-6" aria-label="Admin tezkor bo‘limlari">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071426] px-5 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(7,20,38,.28)] transition hover:bg-[#0043a4]"
        >
          <span aria-hidden="true">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
