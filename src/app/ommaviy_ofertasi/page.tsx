import SiteMenu from "@/components/SiteMenu";

export default function OmmaviyOfertaPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <iframe
        src="/tilda/ommaviy_ofertasi.html"
        title="Ommaviy oferta"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
