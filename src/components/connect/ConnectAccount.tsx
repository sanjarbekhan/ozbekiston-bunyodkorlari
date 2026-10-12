"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import ConnectAvatar from "./ConnectAvatar";

type Profile = { user_id:string; display_name:string; avatar_path:string|null; verified_article_id:string|null; chat_enabled:boolean };
type Details = { user_id:string; first_name:string; last_name:string; age:number };
type Article = { id:string; title:string; slug:string };
type Claim = { id:string;article_id:string;status:string;created_at:string };
const input="mt-2 w-full rounded-2xl border border-[#dbe4f2] bg-[#f9fbfe] px-4 py-3.5 text-sm text-[#162741] outline-none transition focus:border-[#358aff] focus:ring-2 focus:ring-[#358aff]/10";
const button="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2668e8] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#1553c8] disabled:cursor-not-allowed disabled:opacity-50";
const section="rounded-[26px] border border-[#e3eaf4] bg-white p-5 shadow-[0_9px_40px_rgba(22,49,88,.05)] sm:p-7";

export default function ConnectAccount() {
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true);
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [first,setFirst]=useState("");
 const [last,setLast]=useState("");
 const [age,setAge]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [pendingEmail,setPendingEmail]=useState("");
 const [otp,setOtp]=useState("");
 const [profile,setProfile]=useState<Profile|null>(null);
 const [details,setDetails]=useState<Details|null>(null);
 const [claims,setClaims]=useState<Claim[]>([]);
 const [matches,setMatches]=useState<Article[]>([]);
 const [query,setQuery]=useState("");
 const [article,setArticle]=useState<Article|null>(null);
 const [claimText,setClaimText]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [uploading,setUploading]=useState(false);

 useEffect(()=>{
   const params=new URLSearchParams(window.location.search);
   if(params.get("mode")==="signup")setMode("signup");
   let alive=true;
   const {data}=supabase.auth.onAuthStateChange((_event,session)=>{
     if(alive){setUser(session?.user||null);setChecking(false);}
   });
   void supabase.auth.getUser().then(({data:result})=>{
     if(alive){setUser(result.user||null);setChecking(false);}
   });
   return ()=>{alive=false;data.subscription.unsubscribe()};
 },[]);
 useEffect(()=>{
   if(!user){setProfile(null);setDetails(null);setClaims([]);return;}
   let valid=true;
   const refresh=async()=>{
     const [p,d,c]=await Promise.all([
       supabase.from("connect_profiles").select("user_id,display_name,avatar_path,verified_article_id,chat_enabled").eq("user_id",user.id).maybeSingle(),
       supabase.from("connect_account_details").select("user_id,first_name,last_name,age").eq("user_id",user.id).maybeSingle(),
       supabase.from("connect_claims").select("id,article_id,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(12),
     ]);
     if(!valid)return;
     if(p.error||d.error||c.error){setError("Profilni yuklashda xato yuz berdi. Keyinroq urinib ko‘ring.");return;}
     setProfile((p.data as Profile)||null);
     setDetails((d.data as Details)||null);
     setClaims((c.data||[]) as Claim[]);
     const meta=user.user_metadata||{};
     setFirst(d.data?.first_name||meta.first_name||"");
     setLast(d.data?.last_name||meta.last_name||"");
     setAge(String(d.data?.age||meta.age||""));
   };
   void refresh();
   return ()=>{valid=false};
 },[user?.id]);

 useEffect(()=>{
   if(!query.trim()||query.trim().length<2){setMatches([]);return;}
   let alive=true;
   const timer=window.setTimeout(()=>{
     void supabase.from("articles").select("id,title,slug").eq("status","published")
       .ilike("title","%"+query.trim().replace(/[%_]/g,"")+"%").limit(8).then(({data})=>{
         if(alive)setMatches((data||[]) as Article[]);
       });
   },340);
   return ()=>{alive=false;window.clearTimeout(timer)};
 },[query]);

 const run=async(fn:()=>Promise<void>)=>{
   if(busy)return;
   setBusy(true);setError("");setNotice("");
   try{await fn();}catch(e){setError(e instanceof Error?e.message:String(e))}
   finally{setBusy(false);}
 };
 const safeAge=Number(age);
 async function authSubmit(e:React.FormEvent<HTMLFormElement>) {
   e.preventDefault();
   await run(async()=>{
     if(mode==="signup"&&(!first.trim()||!last.trim()||!Number.isInteger(safeAge)||safeAge<13||safeAge>100)){
       throw new Error("Ism, familiya va 13–100 oralig‘idagi yoshingizni kiriting.");
     }
     const address=email.trim().toLowerCase();
     const response=mode==="signup"
       ? await supabase.auth.signUp({
           email:address,password,
           options:{ emailRedirectTo:"https://www.bunyodkor.com/profil",
             data:{first_name:first.trim(),last_name:last.trim(),age:safeAge}}
         })
       : await supabase.auth.signInWithPassword({email:address,password});
     if(response.error)throw response.error;
     setPassword("");
     if(mode==="signup"&&!response.data.session){
       setPendingEmail(address);
       setNotice("Tasdiqlash xabari emailingizga jo‘natildi. Xatdagi havolani bosing. Agar email shabloningiz kod yuborsa, quyida 6 xonali kodni kiriting.");
     }else setNotice("Xush kelibsiz!");
   });
 }
 async function verifyEmail(e:React.FormEvent<HTMLFormElement>){
   e.preventDefault();
   await run(async()=>{
     const {error:authError}=await supabase.auth.verifyOtp({email:pendingEmail,token:otp.trim(),type:"signup"});
     if(authError)throw authError;
     setPendingEmail("");setOtp("");
     setNotice("Email tasdiqlandi. Shaxsiy profilingizni to‘ldiring.");
   });
 }
 async function resend(){
   await run(async()=>{
     const {error:authError}=await supabase.auth.resend({type:"signup",email:pendingEmail,options:{emailRedirectTo:"https://www.bunyodkor.com/profil"}});
     if(authError)throw authError;
     setNotice("Tasdiqlash xabari qayta yuborildi.");
   });
 }
 async function loadOwnProfile(){
   if(!user)return;
   const [p,d,c]=await Promise.all([
     supabase.from("connect_profiles").select("user_id,display_name,avatar_path,verified_article_id,chat_enabled").eq("user_id",user.id).maybeSingle(),
     supabase.from("connect_account_details").select("user_id,first_name,last_name,age").eq("user_id",user.id).maybeSingle(),
     supabase.from("connect_claims").select("id,article_id,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(12),
   ]);
   if(p.error||d.error||c.error)throw new Error(p.error?.message||d.error?.message||c.error?.message);
   setProfile((p.data as Profile)||null);setDetails((d.data as Details)||null);setClaims((c.data||[]) as Claim[]);
 }
 async function save(){
   if(!user)return;
   await run(async()=>{
     if(first.trim().length<2||last.trim().length<2||!Number.isInteger(safeAge)||safeAge<13||safeAge>100)
       throw new Error("Ism va familiya 2 belgidan uzun, yosh 13–100 oralig‘ida bo‘lsin.");
     // Save private age/details before enabling or updating public chat profile.
     const d=details
       ? await supabase.from("connect_account_details").update({first_name:first.trim(),last_name:last.trim(),age:safeAge,updated_at:new Date().toISOString()}).eq("user_id",user.id)
       : await supabase.from("connect_account_details").insert({user_id:user.id,first_name:first.trim(),last_name:last.trim(),age:safeAge});
     if(d.error)throw d.error;
     const p=profile
       ? await supabase.from("connect_profiles").update({display_name:(first.trim()+" "+last.trim())}).eq("user_id",user.id)
       : await supabase.from("connect_profiles").insert({user_id:user.id,display_name:(first.trim()+" "+last.trim())});
     if(p.error)throw p.error;
     await loadOwnProfile();setNotice("Profilingiz saqlandi.");
   });
 }
 async function photoUpload(event:React.ChangeEvent<HTMLInputElement>){
   const file=event.target.files?.[0];event.target.value="";
   if(!file||!user||!profile)return;
   if(file.size>2*1024*1024){setError("Rasm 2 MB dan katta bo‘lmasin.");return;}
   const ext:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
   if(!ext[file.type]){setError("Faqat JPG, PNG yoki WebP rasm tanlang.");return;}
   setUploading(true);setError("");setNotice("");
   const path=user.id+"/avatar-"+Date.now()+"."+ext[file.type];
   try{
     const upload=await supabase.storage.from("connect-avatars").upload(path,file,{contentType:file.type,upsert:false,cacheControl:"3600"});
     if(upload.error)throw upload.error;
     const saved=await supabase.from("connect_profiles").update({avatar_path:path}).eq("user_id",user.id);
     if(saved.error){await supabase.storage.from("connect-avatars").remove([path]);throw saved.error;}
     const old=profile.avatar_path;
     setProfile({...profile,avatar_path:path});
     setNotice("Profil rasmi yangilandi.");
     if(old&&old.startsWith(user.id+"/"))void supabase.storage.from("connect-avatars").remove([old]);
   }catch(e){setError(e instanceof Error?e.message:String(e))}
   finally{setUploading(false);}
 }
 async function sendClaim(){
   if(!user||!article)return;
   await run(async()=>{
     if(!details||!profile)throw new Error("Avval shaxsiy profilingizni saqlang.");
     if(claimText.trim().length<15)throw new Error("Izoh kamida 15 belgidan iborat bo‘lsin.");
     const {error:e}=await supabase.from("connect_claims").insert({user_id:user.id,article_id:article.id,note:claimText.trim()});
     if(e)throw e;
     setArticle(null);setQuery("");setClaimText("");
     await loadOwnProfile();setNotice("Maqola egasi ekaningizni tasdiqlash so‘rovi tahririyatga yuborildi.");
   });
 }
 async function toggleChat(checked:boolean){
   if(!user||!profile)return;
   await run(async()=>{
     const {error:e}=await supabase.from("connect_profiles").update({chat_enabled:checked}).eq("user_id",user.id);
     if(e)throw e;
     setProfile({...profile,chat_enabled:checked});
     setNotice(checked?"Chat so‘rovlarini qabul qilish yoqildi.":"Chat so‘rovlarini qabul qilish o‘chirildi.");
   });
 }
 const identity={display_name:profile?.display_name||[first,last].join(" ").trim()||"Profil",avatar_path:profile?.avatar_path||null};
 const verified=Boolean(user?.email_confirmed_at);
 return <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
   <header className="mb-8 flex items-start justify-between gap-4">
     <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#2d73df]">BUNYODKOR ACCOUNT</p>
       <h1 className="mt-2 text-3xl font-black tracking-tight text-[#152e57] sm:text-4xl">Shaxsiy profil</h1>
       <p className="mt-2 max-w-xl text-sm leading-6 text-[#6a7990]">Bitta hisob orqali ensiklopediya profilingizni boshqaring va yoshlar bilan muloqot qiling.</p>
     </div>
     <Link href="/" className="rounded-full border border-[#dae5f5] px-4 py-2 text-xs font-bold text-[#2759a0]">Bosh sahifa ↗</Link>
   </header>
   {error&&<div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
   {notice&&<div role="status" className="mb-5 rounded-2xl border border-[#cadffc] bg-[#eff6ff] p-4 text-sm font-medium text-[#164991]">{notice}</div>}
   {checking ? <p className={section}>Profil tekshirilmoqda...</p> : !user ? (
     <div className={section+" mx-auto max-w-lg"}>
       <div className="mb-7 flex rounded-2xl bg-[#f1f5fa] p-1">
         <button type="button" onClick={()=>setMode("login")} className={"flex-1 rounded-xl px-4 py-3 text-sm font-bold "+(mode==="login"?"bg-white text-[#1b58b9] shadow-sm":"text-[#7a889b]")}>Kirish</button>
         <button type="button" onClick={()=>setMode("signup")} className={"flex-1 rounded-xl px-4 py-3 text-sm font-bold "+(mode==="signup"?"bg-white text-[#1b58b9] shadow-sm":"text-[#7a889b]")}>Ro‘yxatdan o‘tish</button>
       </div>
       <h2 className="text-2xl font-black text-[#1b2b47]">{mode==="signup"?"Yangi hisob yarating":"Xush kelibsiz!"}</h2>
       <p className="mt-2 text-sm text-[#65748d]">Emailingiz tasdiqlangandan keyin shaxsiy kabinet ochiladi.</p>
       <form className="mt-6 space-y-4" onSubmit={authSubmit}>
         {mode==="signup"&&<div className="grid grid-cols-2 gap-3">
           <label className="text-xs font-bold text-[#475b79]">Ism<input required minLength={2} maxLength={60} value={first} onChange={e=>setFirst(e.target.value)} autoComplete="given-name" className={input}/></label>
           <label className="text-xs font-bold text-[#475b79]">Familiya<input required minLength={2} maxLength={60} value={last} onChange={e=>setLast(e.target.value)} autoComplete="family-name" className={input}/></label>
         </div>}
         {mode==="signup"&&<label className="block text-xs font-bold text-[#475b79]">Yosh<input required type="number" inputMode="numeric" min={13} max={100} value={age} onChange={e=>setAge(e.target.value)} className={input}/></label>}
         <label className="block text-xs font-bold text-[#475b79]">Email (Gmail ham mumkin)<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className={input} placeholder="example@gmail.com" /></label>
         <label className="block text-xs font-bold text-[#475b79]">Parol<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signup"?"new-password":"current-password"} className={input} placeholder="Kamida 8 ta belgi"/></label>
         {mode==="signup"&&<p className="text-xs leading-5 text-[#667994]">Shaxsiy chat faqat 18 yosh va undan kattalar uchun mavjud. Voyaga yetmaganlar profil yaratishi mumkin, lekin shaxsiy xabar yozolmaydi.</p>}
         <button type="submit" disabled={busy} className={button+" w-full"}>{busy?"Kuting...":mode==="signup"?"Hisob yaratish":"Hisobga kirish"}</button>
       </form>
       {pendingEmail&&<div className="mt-6 border-t border-[#e5edf7] pt-5">
         <h3 className="text-sm font-extrabold">Email tasdiqlash</h3>
         <p className="mt-2 text-xs leading-6 text-[#63758e]">Emaildagi tasdiqlash havolasini oching. Agar 6 xonali kod kelgan bo‘lsa, kiriting:</p>
         <form className="mt-3 flex gap-2" onSubmit={verifyEmail}>
           <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" aria-label="6 xonali kod" className={input+" mt-0 min-w-0 flex-1 tracking-[.3em]"} />
           <button disabled={busy||otp.length!==6} className={button}>Tasdiqlash</button>
         </form>
         <button type="button" onClick={()=>void resend()} disabled={busy} className="mt-4 text-xs font-bold text-[#235ec2] underline">Xabarni qayta yuborish</button>
       </div>}
     </div>
   ) : (
     <div className="space-y-5">
       <section className={section}>
         <div className="flex flex-wrap items-center gap-5">
           <div className="relative">
             <ConnectAvatar identity={identity} size={92} ring />
             {profile&&<label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#286af1] text-white" title="Profil rasmini yuklash">
               <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e=>void photoUpload(e)} disabled={uploading}/>
               <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3"/></svg>
             </label>}
           </div>
           <div className="min-w-0 flex-1"><h2 className="break-words text-xl font-black text-[#18335b]">{identity.display_name}</h2>
             <p className="mt-1 break-words text-sm text-[#657991]">{user.email}</p>
             <span className={"mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold "+(verified?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700")}>{verified?"✓ Email tasdiqlangan":"Email tasdiqlanmagan"}</span>
             <p className="mt-2 text-xs text-[#8290a2]">{uploading?"Rasm yuklanmoqda...":"Rasm: JPG, PNG yoki WebP, 2 MB gacha"}</p>
           </div>
           <button onClick={()=>void supabase.auth.signOut()} className="rounded-xl border border-[#e0e8f5] px-4 py-2.5 text-sm font-bold text-[#4b6083]">Chiqish</button>
         </div>
       </section>
       <section className={section}>
         <h3 className="text-xl font-black text-[#1d3458]">Shaxsiy ma’lumotlar</h3>
         <p className="mt-1 text-sm text-[#7b899e]">Yoshingiz boshqa foydalanuvchilarga ko‘rsatilmaydi.</p>
         <div className="mt-5 grid gap-4 sm:grid-cols-3">
           <label className="text-xs font-bold text-[#566b85]">Ism<input className={input} minLength={2} maxLength={60} value={first} onChange={e=>setFirst(e.target.value)} /></label>
           <label className="text-xs font-bold text-[#566b85]">Familiya<input className={input} minLength={2} maxLength={60} value={last} onChange={e=>setLast(e.target.value)} /></label>
           <label className="text-xs font-bold text-[#566b85]">Yosh<input type="number" className={input} min={13} max={100} value={age} onChange={e=>setAge(e.target.value)} /></label>
         </div>
         <button type="button" className={button+" mt-5"} disabled={busy||!verified} onClick={()=>void save()}>Ma’lumotlarni saqlash</button>
         {!verified&&<p className="mt-3 text-xs text-amber-700">Emailni tasdiqlagandan so‘ng profilni saqlash mumkin.</p>}
       </section>
       <section className={section}>
         <div className="flex flex-wrap items-start justify-between gap-3">
           <div><h3 className="text-xl font-black text-[#1d3458]">Ensiklopedik maqolam</h3><p className="mt-1 text-sm text-[#7b899e]">Faqat tahririyat tekshirgan shaxs maqolani o‘ziga biriktira oladi.</p></div>
           {profile?.verified_article_id&&<span className="rounded-full bg-[#e8f8f2] px-4 py-2 text-xs font-extrabold text-[#10825a]">✓ Tasdiqlangan</span>}
         </div>
         {profile?.verified_article_id ? <div className="mt-5 rounded-2xl bg-[#f1f6ff] p-4">
           <p className="text-sm font-bold text-[#204b93]">Bu akkauntga ensiklopedik maqola biriktirilgan.</p>
           <label className="mt-5 flex items-center gap-3 text-sm font-bold text-[#344f72]">
             <input type="checkbox" className="h-5 w-5 accent-[#245fff]" disabled={busy||Number(details?.age||0)<18} checked={profile.chat_enabled} onChange={e=>void toggleChat(e.target.checked)}/>
             Savol va hamkorlik so‘rovlarini qabul qilish
           </label>
           {Number(details?.age||0)<18&&<p className="mt-2 text-xs text-[#a16a12]">Xavfsizlik sabab shaxsiy chat 18 yoshdan boshlab yoqiladi.</p>}
         </div> : <div className="mt-5">
           <input className={input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Maqolangizdagi ism-familiyani qidiring..." />
           {matches.length>0&&<div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#dce8f5]">{matches.map(m=><button type="button" key={m.id} onClick={()=>{setArticle(m);setQuery(m.title);setMatches([])}} className="block w-full border-b px-4 py-3 text-left text-sm text-[#344f72] hover:bg-[#edf5ff]">{m.title}</button>)}</div>}
           {article&&<p className="mt-3 text-sm font-bold text-[#205bb2]">Tanlangan maqola: {article.title}</p>}
           <textarea className={input+" mt-4"} rows={3} value={claimText} onChange={e=>setClaimText(e.target.value)} maxLength={1000} placeholder="Shaxsingizni tekshirish uchun izoh yozing (kamida 15 belgi)." />
           <button disabled={busy||!profile||!details||!article||claimText.trim().length<15} onClick={()=>void sendClaim()} className={button+" mt-4"}>Tasdiqlashga yuborish</button>
         </div>}
         {claims.length>0&&<div className="mt-5 space-y-2">{claims.map(c=><p key={c.id} className="rounded-xl bg-[#f6f9fd] p-3 text-xs text-[#546d8e]">{c.status==="pending"?"⌛ Tahririyat tekshirmoqda":c.status==="approved"?"✓ Maqola tasdiqlandi":"So‘rov rad etildi"} · {new Date(c.created_at).toLocaleDateString("uz-UZ")}</p>)}</div>}
       </section>
       <div className="flex justify-end"><Link href="/chat" className={button}>Xabarlarga o‘tish ↗</Link></div>
     </div>
   )}
 </div>;
}
