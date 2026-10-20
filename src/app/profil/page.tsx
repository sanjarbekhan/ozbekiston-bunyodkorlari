import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import ConnectAccount from "@/components/connect/ConnectAccount";

export const metadata: Metadata = {
 title:"Shaxsiy profil — Bunyodkor",
 description:"Bunyodkor shaxsiy kabineti, ro‘yxatdan o‘tish, profil rasmi va akkauntni boshqarish.",
 robots:{index:false,follow:false},
};
export default function ProfilePage(){
 return <main className="min-h-screen bg-[#f5f8fd] text-[#163257]">
   <SiteMenu/>
   <ConnectAccount/>
   <SiteFooter/>
 </main>;
}