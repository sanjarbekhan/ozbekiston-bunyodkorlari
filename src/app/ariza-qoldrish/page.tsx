import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import LegacyApplicationFrame from "@/components/LegacyApplicationFrame";

export const metadata: Metadata = {
  title: "Ariza qoldirish | O‘zbekiston Bunyodkor Yoshlari",
  description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
  alternates: { canonical: "https://www.bunyodkor.com/ariza-qoldrish" },
  openGraph: {
    title: "Ariza qoldirish | O‘zbekiston Bunyodkor Yoshlari",
    description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
    url: "https://www.bunyodkor.com/ariza-qoldrish",
  },
};

export default function ArizaQoldirishPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <LegacyApplicationFrame />
    </main>
  );
}
