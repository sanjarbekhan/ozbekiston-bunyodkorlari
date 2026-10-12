"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConnectAvatar, { type ChatIdentity } from "./ConnectAvatar";

export default function ProfileNavButton() {
 const [identity,setIdentity] = useState<ChatIdentity | null>(null);
 const [signedIn,setSignedIn] = useState(false);
 useEffect(()=>{
   let alive=true;
   const read=async()=>{
     const {data}=await supabase.auth.getUser();
     if(!alive)return;
     setSignedIn(Boolean(data.user));
     if(!data.user){setIdentity(null);return;}
     const {data:profile}=await supabase.from("connect_profiles")
       .select("display_name,avatar_path").eq("user_id",data.user.id).maybeSingle();
     if(alive)setIdentity(profile ? profile as ChatIdentity : null);
   };
   void read();
   const {data}=supabase.auth.onAuthStateChange(()=>{void read()});
   return ()=>{alive=false;data.subscription.unsubscribe()};
 },[]);
 return <Link href="/profil" aria-label={signedIn?"Shaxsiy profil":"Kirish yoki ro‘yxatdan o‘tish"}
   className="absolute right-[3.2%] top-1/2 z-[96] flex h-9 w-9 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-[#d5e6fa] bg-white/90 text-[#184d99] shadow-[0_4px_16px_rgba(15,35,75,.12)] transition hover:scale-105 md:h-10 md:w-10">
   {identity?.avatar_path ? <ConnectAvatar identity={identity} size={40}/> :
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
     <circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>
    </svg>}
 </Link>;
}