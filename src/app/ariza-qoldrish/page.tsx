import SiteMenu from "@/components/SiteMenu";

export default function ArizaQoldirishPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <iframe
        src="/tilda/ariza-qoldrish.html"
        title="Ariza qoldirish"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
