const LEGACY_OFFER_URL = "/tilda/ommaviy_ofertasi.html";

export default function LegacyOfferFrame() {
  return (
    <iframe
      src={LEGACY_OFFER_URL}
      title="Ommaviy oferta"
      className="block h-[100dvh] w-full border-0 bg-white"
    />
  );
}
