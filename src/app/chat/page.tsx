import type { Metadata } from "next";
import Link from "next/link";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import ConnectApp from "@/components/connect/ConnectApp";

export const metadata: Metadata = {
  title: "Bunyodkor Connect — Chat",
  description: "Bunyodkor yoshlar bilan savollar va hamkorlik takliflari orqali muloqot qiling.",
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#f6faff] text-[#172d54]">
      <SiteMenu />
      {process.env.NEXT_PUBLIC_BUNYODKOR_CONNECT_ENABLED === "true"
        ? <ConnectApp />
        : <section className="mx-auto min-h-[55vh] max-w-xl px-5 py-16 text-center">
            <h1 className="text-3xl font-black text-[#164c9c]">Bunyodkor Connect</h1>
            <p className="mt-5 text-base leading-7 text-[#64748b]">Xavfsiz yozishmalar bo‘limi tayyorlanmoqda. Tahririyat profil tasdiqlash va chat tizimini ishga tushirgandan so‘ng foydalanish mumkin bo‘ladi.</p>
            <Link href="/bunyodkorlar" className="mt-7 inline-flex rounded-xl bg-[#245fff] px-6 py-3 font-bold text-white">Ensiklopediyaga qaytish</Link>
          </section>}
      <SiteFooter />
    </main>
  );
}
