import SiteMenu from "@/components/SiteMenu";

export default function TavsiyalariPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <iframe
        src="/tilda/tavsiyalari.html"
        title="Tavsiyalar"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
