"use client";

import { useEffect, useState } from "react";

const LEGACY_OFFER_URL = "/tilda/ommaviy_ofertasi.html";

export default function LegacyOfferFrame() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // The exported Tilda page is a complete document with its own responsive
    // layout. Loading that document inside another full-height iframe causes
    // mobile Safari/Chrome viewport and navigation issues, so phones open the
    // document directly instead.
    if (isMobile) {
      window.location.replace(LEGACY_OFFER_URL);
      return;
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center bg-white px-5 text-center">
        <div>
          <p className="text-sm font-bold text-slate-500">Ommaviy oferta ochilmoqda...</p>
          <a
            href={LEGACY_OFFER_URL}
            className="mt-4 inline-flex rounded-full bg-[#0043a4] px-5 py-3 text-sm font-extrabold text-white"
          >
            Ommaviy ofertani ochish
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={LEGACY_OFFER_URL}
      title="Ommaviy oferta"
      className="block h-[100dvh] w-full border-0 bg-white"
    />
  );
}
