import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import ConnectAccount from "@/components/connect/ConnectAccount";
import { TEMPORARY_STATIC_MODE } from "@/lib/temporary-mode";

export const metadata: Metadata = {
 title:"Shaxsiy profil — Bunyodkor",
 description:"Bunyodkor shaxsiy kabineti, ro‘yxatdan o‘tish, profil rasmi va akkauntni boshqarish.",
 robots:{index:false,follow:false},
};
export default function ProfilePage(){
 return <main className="min-h-screen bg-[#f5f8fd] text-[#163257]">
   <SiteMenu/>
   {TEMPORARY_STATIC_MODE ? <section role="status" className="mx-auto flex min-h-[55vh] max-w-xl flex-col justify-center px-6 text-center"><h1 className="text-3xl font-black">Shaxsiy kabinet vaqtincha yopiq</h1><p className="mt-4 leading-7 text-slate-600">Ma’lumotlar xizmati cheklangan paytda yangi hisob ochish va shaxsiy profilni o‘zgartirish mumkin emas. Mavjud ma’lumotlaringiz saqlanib qolgan.</p><a className="mx-auto mt-6 rounded-full bg-[#0043a4] px-6 py-3 font-bold text-white" href="/bunyodkorlar">Ensiklopediyani o‘qish</a></section> : <ConnectAccount/>}
   <SiteFooter/>
 </main>;
}