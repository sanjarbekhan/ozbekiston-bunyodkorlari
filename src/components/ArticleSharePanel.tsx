"use client";

import { useState } from "react";

export default function ArticleSharePanel({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodedUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Havolani nusxalang:", url);
    }
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0043a4]">Ulashish</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#111827] transition hover:border-[#0043a4]/30 hover:bg-[#f7faff]"
        >
          Telegram
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-extrabold text-[#111827] transition hover:border-[#0043a4]/30 hover:bg-[#f7faff]"
        >
          LinkedIn
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-[#111827] transition hover:border-[#0043a4]/30 hover:bg-[#f7faff]"
        >
          {copied ? "✓ Nusxalandi" : "Havolani olish"}
        </button>
        <button
          type="button"
          onClick={() => setShowQr((current) => !current)}
          className="rounded-xl bg-[#0043a4] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#003681]"
        >
          QR kod
        </button>
      </div>

      {showQr && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <img src={qrUrl} alt={`${title} profiliga QR kod`} className="mx-auto h-[170px] w-[170px]" />
          <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
            Telefon kamerasi bilan skanerlang
          </p>
        </div>
      )}
    </div>
  );
}
