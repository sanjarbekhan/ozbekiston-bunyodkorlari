import SiteMenu from "@/components/SiteMenu";

export default function HamkorLoyihasiPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <iframe
        src="/tilda/hamkor-loyihasi.html"
        title="Hamkor loyihasi"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
