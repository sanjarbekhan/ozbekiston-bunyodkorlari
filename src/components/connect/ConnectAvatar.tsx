"use client";
import { supabase } from "@/lib/supabase";

export type ChatIdentity = { display_name: string; avatar_path: string | null };

export default function ConnectAvatar({ identity, size = 52, ring = false }: {
 identity?: ChatIdentity | null; size?: number; ring?: boolean;
}) {
 const url = identity?.avatar_path
   ? supabase.storage.from("connect-avatars").getPublicUrl(identity.avatar_path).data.publicUrl : null;
 const initials = (identity?.display_name || "?").split(/\s+/).filter(Boolean).slice(0,2)
   .map(s=>s.charAt(0).toLocaleUpperCase("uz")).join("");
 return <span aria-hidden="true" className={"inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 " +
   (ring ? "border-[#3c9bff]" : "border-[#353c46]") + " bg-[#232c38] text-lg font-semibold text-white"}
   style={{width:size,height:size,minWidth:size,minHeight:size}}>
   {url ? <img src={url} alt="" width={size} height={size} loading="lazy" className="h-full w-full object-cover" /> : initials}
 </span>;
}