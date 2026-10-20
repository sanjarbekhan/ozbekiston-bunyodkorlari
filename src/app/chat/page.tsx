import type { Metadata } from "next";
import Link from "next/link";
import SiteMenu from "@/components/SiteMenu";
import ConnectApp from "@/components/connect/ConnectApp";

export const metadata: Metadata = {
 title:"Xabarlar — Bunyodkor Connect",
 description:"Bunyodkor yoshlari bilan savol-javob va hamkorlik uchun shaxsiy suhbatlar.",
 robots:{index:false,follow:false},
};
export default function ChatPage(){
 return <main className="min-h-screen bg-white text-[#1d3554]">
  <SiteMenu/>
  {process.env.NEXT_PUBLIC_BUNYODKOR_CONNECT_ENABLED==="true"
   ? <ConnectApp/>
   : <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
     <h1 className="text-3xl font-bold">Bunyodkor Connect</h1>
     <p className="mt-4 text-sm text-[#7386a2]">Chat xizmati hozircha tayyorlanmoqda.</p>
     <Link href="/bunyodkorlar" className="mt-5 rounded-full bg-[#3487f5] px-5 py-3 font-bold">Ensiklopediya ↗</Link>
   </section>}
 </main>;
}