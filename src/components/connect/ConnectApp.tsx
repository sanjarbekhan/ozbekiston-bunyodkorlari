"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import ConnectAvatar, { type ChatIdentity } from "./ConnectAvatar";

type Thread = {
 id:string; requester_id:string; recipient_id:string;
 requester_name:string;recipient_name:string;kind:"question"|"collaboration";
 status:"pending"|"accepted"|"declined";updated_at:string;
 requester_read_at:string|null;recipient_read_at:string|null;
};
type Message = {id:string;thread_id:string;sender_id:string;body:string;created_at:string};
type Profile = {user_id:string;display_name:string;avatar_path:string|null;verified_article_id:string|null;chat_enabled:boolean};
type Article = {id:string;title:string;slug:string};
type Peer = ChatIdentity & {user_id:string;verified_article_id:string|null};
type Tab = "all"|"unread"|"requests";

const Icon=({name,size=22}:{name:"search"|"compose"|"send"|"back"|"more"|"shield"|"close"|"person",size?:number})=>{
 const paths:Record<string,React.ReactNode>={
 search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
 compose:<><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7"/><path d="m15 5 4-2 2 2-2 4-9 9-4 1 1-4z"/></>,
 send:<><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
 back:<><path d="m15 18-6-6 6-6"/></>,
 more:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
 shield:<><path d="m12 22 7-4V5l-7-3-7 3v13Z"/><path d="m9 12 2 2 4-4"/></>,
 close:<><path d="M6 6l12 12M18 6 6 18"/></>,
 person:<><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>,
 };
 return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};
const smallButton="rounded-full border border-[#d9e3f1] bg-[#f5f8fd] px-4 py-2.5 text-xs font-semibold text-[#265184] transition hover:bg-[#eaf2ff] disabled:opacity-50";
const mainButton="rounded-full bg-[#3989fb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2676ed] disabled:opacity-50";
function timeAgo(date:string){
 const diff=Math.max(0,Date.now()-new Date(date).getTime());
 if(diff<60000)return "hozir";
 if(diff<3600000)return Math.floor(diff/60000)+" daq";
 if(diff<86400000)return Math.floor(diff/3600000)+" soat";
 if(diff<172800000)return "kecha";
 return new Intl.DateTimeFormat("uz-UZ",{day:"2-digit",month:"short"}).format(new Date(date));
}
function errorMessage(error:unknown){return error instanceof Error?error.message:String(error||"Xatolik yuz berdi.");}

export default function ConnectApp() {
 const [user,setUser]=useState<User|null>(null);
 const [ready,setReady]=useState(false);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [adult,setAdult]=useState(false);
 const [threads,setThreads]=useState<Thread[]>([]);
 const [people,setPeople]=useState<Record<string,Peer>>({});
 const [lastMessages,setLastMessages]=useState<Record<string,Message>>({});
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [messages,setMessages]=useState<Message[]>([]);
 const [search,setSearch]=useState("");
 const [tab,setTab]=useState<Tab>("all");
 const [messageInput,setMessageInput]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [target,setTarget]=useState<Article|null>(null);
 const [compose,setCompose]=useState(false);
 const [candidates,setCandidates]=useState<(Peer & {article?:Article})[]>([]);
 const [composeSearch,setComposeSearch]=useState("");
 const [firstMessage,setFirstMessage]=useState("");
 const [kind,setKind]=useState<"question"|"collaboration">("question");
 const [report,setReport]=useState("");
 const [safetyOpen,setSafetyOpen]=useState(false);
 const bottomRef=useRef<HTMLDivElement>(null);
 const selected=useMemo(()=>threads.find(t=>t.id===selectedId)||null,[threads,selectedId]);
 const ownId=user?.id;
 const selectedPeerId=selected?(selected.requester_id===ownId?selected.recipient_id:selected.requester_id):"";
 const selectedPeer=selectedPeerId?people[selectedPeerId]:null;

 const loadInbox=useCallback(async(id:string)=>{
   const res=await supabase.from("connect_threads")
     .select("id,requester_id,recipient_id,requester_name,recipient_name,kind,status,updated_at,requester_read_at,recipient_read_at")
     .order("updated_at",{ascending:false}).limit(60);
   if(res.error){setNotice("Xabarlarni yuklab bo‘lmadi: "+res.error.message);return;}
   const list=(res.data||[]) as Thread[];
   setThreads(list);
   if(!list.length){setPeople({});setLastMessages({});return;}
   const ids=Array.from(new Set(list.map(t=>t.requester_id===id?t.recipient_id:t.requester_id)));
   const [profiles,latest]=await Promise.all([
     supabase.from("connect_profiles").select("user_id,display_name,avatar_path,verified_article_id").in("user_id",ids),
     supabase.from("connect_messages").select("id,thread_id,sender_id,body,created_at")
       .in("thread_id",list.map(t=>t.id)).order("created_at",{ascending:false}).limit(300),
   ]);
   if(!profiles.error)setPeople(Object.fromEntries(((profiles.data||[]) as Peer[]).map(p=>[p.user_id,p])));
   if(!latest.error){
     const mapping:Record<string,Message>={};
     for(const item of (latest.data||[]) as Message[]){if(!mapping[item.thread_id])mapping[item.thread_id]=item;}
     setLastMessages(mapping);
   }
 },[]);

 const loadMessages=useCallback(async(threadId:string)=>{
   const {data,error}=await supabase.from("connect_messages").select("id,thread_id,sender_id,body,created_at")
     .eq("thread_id",threadId).order("created_at",{ascending:false}).limit(60);
   if(error){setNotice(error.message);return;}
   setMessages(((data||[]) as Message[]).reverse());
   await supabase.rpc("connect_mark_read",{p_thread:threadId});
 },[]);

 useEffect(()=>{
   let alive=true;
   const params=new URLSearchParams(window.location.search);
   const param=params.get("article");
   if(params.get("kind")==="collaboration")setKind("collaboration");
   if(param&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(param)){
     void supabase.from("articles").select("id,title,slug").eq("id",param).eq("status","published").maybeSingle()
       .then(({data})=>{if(alive&&data){setTarget(data as Article);setCompose(true);}});
   }
   const {data:auth}=supabase.auth.onAuthStateChange((_e,session)=>{
     if(alive){setUser(session?.user||null);setReady(true);}
   });
   void supabase.auth.getUser().then(({data})=>{if(alive){setUser(data.user||null);setReady(true);}});
   return ()=>{alive=false;auth.subscription.unsubscribe()};
 },[]);
 useEffect(()=>{
   setThreads([]);setMessages([]);setPeople({});setLastMessages({});setSelectedId(null);setProfile(null);setAdult(false);
   if(!ownId)return;
   let alive=true;
   void Promise.all([
     supabase.from("connect_profiles").select("user_id,display_name,avatar_path,verified_article_id,chat_enabled").eq("user_id",ownId).maybeSingle(),
     supabase.from("connect_account_details").select("age").eq("user_id",ownId).maybeSingle(),
   ]).then(([p,d])=>{
     if(!alive)return;
     setProfile(p.data as Profile|null);
     setAdult(Number(d.data?.age||0)>=18);
     void loadInbox(ownId);
   });
   return ()=>{alive=false};
 },[ownId,loadInbox]);
 useEffect(()=>{if(selectedId)void loadMessages(selectedId);},[selectedId,loadMessages]);
 useEffect(()=>{bottomRef.current?.scrollIntoView({block:"end",behavior:"instant"});},[messages.length,selectedId]);

 useEffect(()=>{
   if(!ownId)return;
   const channel=supabase.channel("connect2-inbox-"+ownId)
     .on("postgres_changes",{event:"*",schema:"public",table:"connect_threads"},()=>{void loadInbox(ownId)})
     .on("postgres_changes",{event:"INSERT",schema:"public",table:"connect_messages"},(payload)=>{
       const row=payload.new as {thread_id?:string};
       if(row.thread_id===selectedId&&selectedId)void loadMessages(selectedId);
       void loadInbox(ownId);
     }).subscribe();
   const interval=window.setInterval(()=>{
     if(document.visibilityState!=="visible")return;
     void loadInbox(ownId);
     if(selectedId)void loadMessages(selectedId);
   },20000);
   return ()=>{window.clearInterval(interval);void supabase.removeChannel(channel);};
 },[ownId,selectedId,loadInbox,loadMessages]);

 useEffect(()=>{
   if(!compose||!ownId)return;
   let alive=true;
   const searchAvailable=async()=>{
     const {data,error}=await supabase.from("connect_profiles")
       .select("user_id,display_name,avatar_path,verified_article_id")
       .eq("chat_enabled",true).not("verified_article_id","is",null).limit(60);
     if(error||!data||!alive)return;
     const users=(data as Peer[]).filter(p=>p.user_id!==ownId);
     if(!users.length){setCandidates([]);return;}
     const {data:articles}=await supabase.from("articles").select("id,title,slug")
       .eq("status","published").in("id",users.map(u=>u.verified_article_id!));
     const map=new Map(((articles||[]) as Article[]).map(a=>[a.id,a]));
     if(alive)setCandidates(users.map(x=>({...x,article:map.get(x.verified_article_id!)})));
   };
   void searchAvailable();
   return ()=>{alive=false};
 },[compose,ownId]);

 const filtered=threads.filter(t=>{
   const otherId=t.requester_id===ownId?t.recipient_id:t.requester_id;
   const label=people[otherId]?.display_name||(t.requester_id===ownId?t.recipient_name:t.requester_name);
   const query=search.trim().toLocaleLowerCase("uz");
   if(query&&!label.toLocaleLowerCase("uz").includes(query)&&!(lastMessages[t.id]?.body||"").toLocaleLowerCase("uz").includes(query))return false;
   if(tab==="requests")return t.status==="pending"&&t.recipient_id===ownId;
   if(tab==="unread"){
     const read=t.requester_id===ownId?t.requester_read_at:t.recipient_read_at;
     return Boolean(!read||new Date(t.updated_at).getTime()>new Date(read).getTime()+500);
   }
   return true;
 });
 const requestCount=threads.filter(t=>t.status==="pending"&&t.recipient_id===ownId).length;
 const unreadCount=threads.filter(t=>{
   const r=t.requester_id===ownId?t.requester_read_at:t.recipient_read_at;
   return !r||new Date(t.updated_at)>new Date(r);
 }).length;
 const safe=async(work:()=>Promise<void>)=>{
   if(busy)return;setBusy(true);setNotice("");
   try{await work();}catch(e){setNotice(errorMessage(e));}finally{setBusy(false);}
 };
 async function startThread(){
   if(!ownId||!target||!firstMessage.trim())return;
   await safe(async()=>{
     const {data,error}=await supabase.rpc("connect_start_thread",{
       p_article_id:target.id,p_kind:kind,p_message:firstMessage.trim(),
     });
     if(error)throw error;
     setSelectedId(String(data));setTarget(null);setCompose(false);setFirstMessage("");
     window.history.replaceState(null,"","/chat");
     await loadInbox(ownId);
     setNotice("So‘rov yuborildi. Qabul qilingach, suhbatni davom ettirishingiz mumkin.");
   });
 }
 async function send(event:React.FormEvent<HTMLFormElement>){
   event.preventDefault();
   if(!selectedId||!messageInput.trim()||!ownId)return;
   await safe(async()=>{
     const text=messageInput.trim();
     const {error}=await supabase.rpc("connect_send",{p_thread:selectedId,p_body:text});
     if(error)throw error;
     setMessageInput("");await loadMessages(selectedId);await loadInbox(ownId);
   });
 }
 async function respond(accept:boolean){
   if(!selected||!ownId)return;
   await safe(async()=>{
     const {error}=await supabase.rpc("connect_respond",{p_thread:selected.id,p_accept:accept});
     if(error)throw error;
     await loadInbox(ownId);
     setNotice(accept?"Suhbat qabul qilindi.":"So‘rov rad etildi.");
   });
 }
 async function blockOrReport(type:"block"|"report"){
   if(!ownId||!selected)return;
   await safe(async()=>{
     if(type==="block"){
       const other=selectedPeerId;
       const {error}=await supabase.from("connect_blocks").insert({blocker_id:ownId,blocked_id:other});
       if(error&&error.code!=="23505")throw error;
       setNotice("Foydalanuvchi bloklandi.");
     }else{
       if(report.trim().length<10)throw new Error("Shikoyat sababini kamida 10 belgida yozing.");
       const {error}=await supabase.from("connect_reports").insert({thread_id:selected.id,reporter_id:ownId,reason:report.trim()});
       if(error)throw error;
       setReport("");setNotice("Shikoyat tahririyatga yuborildi.");
     }
     setSafetyOpen(false);
   });
 }
 const closeCompose=()=>{setCompose(false);setTarget(null);setFirstMessage("");setComposeSearch("");window.history.replaceState(null,"","/chat");};
 return <div className={"connect-shell relative min-h-[calc(100dvh-82px)] bg-[#ffffff] text-[#1d3554] "+(selected?"connect-thread-open":"")}>
   {!ready?<div className="p-8 text-center text-sm text-[#6c809a]">Yuklanmoqda...</div>:
   !user?<div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
     <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#edf5ff] text-[#286bc9]"><Icon name="send" size={36}/></div>
     <h1 className="text-3xl font-bold tracking-tight">Xabarlar</h1>
     <p className="mt-3 text-sm leading-7 text-[#637a98]">Bunyodkor yoshlari bilan shaxsiy suhbat boshlash uchun hisobingizga kiring.</p>
     <Link href="/profil" className={mainButton+" mt-7 w-full text-center"}>Kirish</Link>
     <Link href="/profil?mode=signup" className="mt-5 text-sm font-semibold text-[#276cc8]">Yangi hisob yaratish</Link>
   </div>:
   <div className="mx-auto flex max-w-[1200px] flex-col lg:min-h-[calc(100dvh-82px)] lg:flex-row lg:border-x lg:border-[#f3f7fd]">
     <aside className={"connect-inbox w-full shrink-0 border-[#e2e9f4] lg:w-[385px] lg:border-r "+(selected?"max-lg:hidden":"")}>
       <div className="sticky top-0 z-10 bg-[#ffffff]/95 px-5 pb-4 pt-7 backdrop-blur-lg sm:px-7">
         <div className="flex items-center justify-between gap-4">
           <div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c85a5]">Bunyodkor Connect</p>
             <h1 className="mt-1 text-[29px] font-bold tracking-[-.04em]">Xabarlar</h1></div>
           <div className="flex items-center gap-2">
             <button type="button" title="Yangi xabar" aria-label="Yangi xabar" onClick={()=>{setCompose(true);setTarget(null);}}
               className="flex h-11 w-11 items-center justify-center rounded-full text-[#215184] transition hover:bg-[#edf3fc]"><Icon name="compose" size={25}/></button>
             <Link href="/profil" aria-label="Profil" className="flex items-center justify-center">
               <ConnectAvatar identity={profile} size={39} ring />
             </Link>
           </div>
         </div>
         <label className="mt-6 flex h-11 items-center gap-3 rounded-xl bg-[#f0f5fc] px-4 text-[#6a809e]">
           <Icon name="search" size={20}/>
           <input type="search" autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)}
             className="w-full border-0 bg-transparent text-[14px] text-[#1d3554] outline-none placeholder:text-[#859ab3]" placeholder="Xabarlardan qidirish"/>
         </label>
         <div className="mt-5 flex items-center gap-6 border-b border-[#e4ebf5] pb-3">
           {(["all","unread","requests"] as Tab[]).map(item=><button type="button" key={item} onClick={()=>setTab(item)}
             className={"relative flex min-h-9 items-center gap-1.5 text-[13px] font-bold "+(tab===item?"text-[#1d3554]":"text-[#71839b]")}>
             {item==="all"?"Barchasi":item==="unread"?"O‘qilmagan":"So‘rovlar"}
             {item==="requests"&&requestCount>0?<span className="rounded-full bg-[#3587ff] px-1.5 text-[10px] text-white">{requestCount}</span>:null}
             {item==="unread"&&unreadCount>0?<span className="h-1.5 w-1.5 rounded-full bg-[#3989fb]"/>:null}
             {tab===item&&<span className="absolute -bottom-[13px] left-0 h-[3px] w-full rounded-full bg-[#3b8bf8]"/>}
           </button>)}
         </div>
       </div>
       <div className="pb-28 lg:pb-7">
         {!adult&&<div className="mx-5 mb-3 rounded-xl border border-[#d3e4fb] bg-[#eef5ff] p-4 text-xs leading-6 text-[#536e92]">
           Shaxsiy yozishmalar 18 yoshdan boshlab mavjud. <Link href="/profil" className="font-bold text-[#286ac2] underline">Profil ma’lumotlari</Link>
         </div>}
         {!profile&&<Link href="/profil" className="mx-5 mb-4 block rounded-xl bg-[#eaf3ff] p-4 text-sm font-bold text-[#2766ba]">Avval profilingizni to‘ldiring ↗</Link>}
         {filtered.length===0?<div className="px-7 py-16 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#cbdced] text-[#3d81cf]"><Icon name="send" size={28}/></div>
           <p className="font-bold">{search?"Natija topilmadi":tab==="requests"?"Yangi so‘rov yo‘q":"Hozircha xabarlar yo‘q"}</p>
           <p className="mt-2 text-sm leading-6 text-[#667b98]">Ensiklopediyadagi tasdiqlangan yoshlar bilan bog‘lanishingiz mumkin.</p>
           <button onClick={()=>setCompose(true)} className="mt-5 text-sm font-semibold text-[#266aca]">Yangi suhbat boshlash →</button>
         </div>:filtered.map(t=>{
           const peerId=t.requester_id===ownId?t.recipient_id:t.requester_id;
           const peer=people[peerId];
           const title=peer?.display_name||(t.requester_id===ownId?t.recipient_name:t.requester_name);
           const latest=lastMessages[t.id];
           const read=t.requester_id===ownId?t.requester_read_at:t.recipient_read_at;
           const unread=Boolean(!read||new Date(t.updated_at).getTime()>new Date(read).getTime()+500);
           const waiting=t.status==="pending";
           return <button type="button" key={t.id} onClick={()=>{setSelectedId(t.id);setSafetyOpen(false);}}
             className={"flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-[#f4f8fe] sm:px-7 "+(selectedId===t.id?"bg-[#ebf3ff]":"")}>
             <ConnectAvatar identity={{display_name:title,avatar_path:peer?.avatar_path||null}} size={61}/>
             <span className="min-w-0 flex-1">
               <span className={"block truncate text-[15px] "+(unread?"font-extrabold text-[#1d3554]":"font-semibold text-[#294260]")}>{title}</span>
               <span className={"mt-1 block truncate text-[13px] "+(unread?"font-semibold text-[#263d58]":"text-[#7889a1]")}>
                 {waiting?(t.recipient_id===ownId?"Yangi suhbat so‘rovi":"Javob kutilmoqda"):latest?(latest.sender_id===ownId?"Siz: ":"")+latest.body:"Suhbat boshlandi"}
                 <span className="px-1.5 text-[#9eaec2]">·</span>{timeAgo(latest?.created_at||t.updated_at)}
               </span>
             </span>
             {unread&&<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#448cff]"/>}
           </button>;
         })}
       </div>
     </aside>
     <section className={"connect-conversation flex min-h-[60dvh] min-w-0 flex-1 flex-col "+(!selected?"max-lg:hidden":"")}>
       {!selected?<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
         <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#8eb0dc] text-[#2769c1]"><Icon name="send" size={46}/></div>
         <h2 className="text-[23px] font-bold">Sizning xabarlaringiz</h2>
         <p className="max-w-xs text-sm leading-6 text-[#72849e]">Suhbatni tanlang yoki yangi xabar yozing.</p>
         <button onClick={()=>setCompose(true)} className={mainButton}>Yangi xabar yozish</button>
       </div>:
       <>
         <header className="sticky top-0 z-20 flex min-h-[77px] items-center gap-3 border-b border-[#e5eaf2] bg-[#ffffff]/95 px-4 backdrop-blur-xl sm:px-6">
           <button type="button" onClick={()=>{setSelectedId(null);setMessages([]);}} aria-label="Ortga qaytish"
             className="mr-1 flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#edf3fc] lg:hidden"><Icon name="back" size={24}/></button>
           <ConnectAvatar identity={{display_name:selectedPeer?.display_name||(selected.requester_id===ownId?selected.recipient_name:selected.requester_name),avatar_path:selectedPeer?.avatar_path||null}} size={43}/>
           <div className="min-w-0 flex-1">
             <p className="truncate text-[15px] font-bold">{selectedPeer?.display_name||(selected.requester_id===ownId?selected.recipient_name:selected.requester_name)}</p>
             <p className="mt-0.5 text-xs text-[#7890aa]">{selected.status==="accepted"?"Suhbat faol":selected.status==="pending"?"So‘rov kutilmoqda":"Suhbat rad etilgan"}</p>
           </div>
           <button type="button" title="Xavfsizlik sozlamalari" aria-label="Xavfsizlik sozlamalari"
             onClick={()=>setSafetyOpen(!safetyOpen)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#edf3fc]"><Icon name="more" size={25}/></button>
         </header>
         {safetyOpen&&<div className="border-b border-[#dbe6f4] bg-[#f5f8fd] px-5 py-5 text-sm">
           <p className="flex items-center gap-2 font-bold text-[#1d3554]"><Icon name="shield" size={18}/> Xavfsizlik</p>
           <div className="mt-4 flex flex-wrap gap-2">
             {selectedPeer?.verified_article_id&&<Link href="/bunyodkorlar" className={smallButton}>Ensiklopediyani ko‘rish</Link>}
             <button type="button" disabled={busy} onClick={()=>void blockOrReport("block")} className={smallButton}>Bloklash</button>
           </div>
           <label className="mt-4 block text-xs text-[#71849d]">Shikoyat sababi (10–600 belgi)
             <textarea value={report} onChange={e=>setReport(e.target.value)} rows={2} maxLength={600} placeholder="Qoidabuzarlikni tushuntiring..."
               className="mt-2 w-full rounded-xl border border-[#d1dfef] bg-[#ffffff] p-3 text-sm text-[#1d3554] outline-none"/>
           </label>
           <button type="button" disabled={busy||report.trim().length<10} onClick={()=>void blockOrReport("report")} className={smallButton+" mt-2"}>Shikoyat yuborish</button>
         </div>}
         <div className="connect-message-scroll flex min-h-[250px] flex-1 flex-col gap-3 overflow-y-auto px-4 pb-5 pt-6 sm:px-7">
           <div className="mx-auto mb-6 flex max-w-xs flex-col items-center gap-2 text-center">
             <ConnectAvatar identity={{display_name:selectedPeer?.display_name||selected.recipient_name,avatar_path:selectedPeer?.avatar_path||null}} size={75}/>
             <p className="mt-1 text-lg font-bold">{selectedPeer?.display_name||selected.recipient_name}</p>
             <p className="text-xs leading-5 text-[#7990aa]">{selected.kind==="collaboration"?"Hamkorlik taklifi":"Biografik maqola bo‘yicha savol"}. Yozishmalar faqat ishtirokchilarga ko‘rinadi.</p>
           </div>
           {messages.map(msg=><div key={msg.id} className={"flex "+(msg.sender_id===ownId?"justify-end":"justify-start")}>
             <div className={"max-w-[82%] rounded-[21px] px-4 py-2.5 text-[14px] leading-[1.55] sm:max-w-[68%] "+(msg.sender_id===ownId?"rounded-br-[5px] bg-[#3386f2] text-white":"rounded-bl-[5px] bg-[#e9f1ff] text-[#294260]")}>
               <p className="whitespace-pre-wrap break-words">{msg.body}</p>
               <span className={"mt-1 block text-right text-[10px] "+(msg.sender_id===ownId?"text-[#e9f3ff]":"text-[#71869f]")}>{timeAgo(msg.created_at)}</span>
             </div>
           </div>)}
           <div ref={bottomRef}/>
         </div>
         {selected.status==="pending"&&selected.recipient_id===ownId&&<div className="mx-4 mb-3 rounded-2xl border border-[#d4e3f6] bg-[#eff6ff] p-4 sm:mx-6">
           <p className="text-sm font-semibold">Yangi suhbat so‘rovi</p>
           <p className="mt-1 text-xs leading-5 text-[#69819c]">Bu foydalanuvchi siz bilan bog‘lanmoqchi. Qabul qilsangiz, yozishmalar ochiladi.</p>
           <div className="mt-3 flex flex-wrap gap-2">
             <button type="button" disabled={busy} onClick={()=>void respond(true)} className={mainButton}>Qabul qilish</button>
             <button type="button" disabled={busy} onClick={()=>void respond(false)} className={smallButton}>Rad etish</button>
           </div>
         </div>}
         {selected.status==="accepted"&&adult?
           <form onSubmit={send} className="sticky bottom-0 flex items-end gap-3 border-t border-[#dfe8f4] bg-[#ffffff] px-3 pb-5 pt-4 sm:px-6">
             <input type="text" value={messageInput} onChange={e=>setMessageInput(e.target.value)} maxLength={2000}
               autoComplete="off" placeholder="Xabar yozing..." aria-label="Xabar matni"
               className="min-h-12 min-w-0 flex-1 rounded-full border border-[#d5e2f2] bg-[#f9fbff] px-5 py-3 text-sm text-[#1d3554] outline-none placeholder:text-[#8092a9] focus:border-[#6a9eef]"/>
             <button type="submit" disabled={busy||!messageInput.trim()} aria-label="Xabar yuborish"
               className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3185f4] text-white disabled:opacity-40"><Icon name="send" size={20}/></button>
           </form>:
           <div className="border-t border-[#dfe8f4] px-5 py-5 text-center text-xs text-[#74869d]">Suhbatni davom ettirish uchun so‘rov qabul qilingan va akkaunt tasdiqlangan bo‘lishi kerak.</div>}
       </>}
     </section>
   </div>}
   {notice&&<div role="status" className="fixed bottom-24 left-1/2 z-[140] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl border border-[#c8dafa] bg-[#f4f8ff] px-4 py-3 text-sm text-[#1d3554] shadow-2xl">
     {notice}<button type="button" onClick={()=>setNotice("")} className="ml-3 font-bold text-[#296bc8]">Yopish</button>
   </div>}
   {compose&&user&&<div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeCompose();}}
     className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 px-3 py-6 backdrop-blur-sm">
     <section role="dialog" aria-modal="true" aria-label="Yangi suhbat" className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[25px] border border-[#d7e4f2] bg-[#ffffff] p-5 text-[#1d3554] shadow-2xl sm:p-6">
       <header className="flex items-center justify-between">
         <h2 className="text-lg font-bold">Yangi xabar</h2>
         <button type="button" aria-label="Yopish" onClick={closeCompose} className="rounded-full p-2 hover:bg-[#f1f6ff]"><Icon name="close"/></button>
       </header>
       {!adult?<div className="mt-5 rounded-xl bg-[#eff5ff] p-4 text-sm leading-6 text-[#476686]">
         Shaxsiy chat 18 yoshdan kattalar uchun. <Link href="/profil" className="underline">Profil ma’lumotlari</Link>
       </div>:!profile?<div className="mt-5 text-sm text-[#70839a]">Avval <Link href="/profil" className="text-[#286dc8] underline">profilingizni to‘ldiring</Link>.</div>:<>
         {target?<div className="mt-5 rounded-2xl bg-[#eff5ff] p-4">
           <p className="text-xs font-medium text-[#607eaa]">Qabul qiluvchi</p>
           <p className="mt-1 text-base font-bold">{target.title}</p>
           <button type="button" className="mt-2 text-xs text-[#2871d0] underline" onClick={()=>{setTarget(null);setComposeSearch("");}}>Boshqa nomzod tanlash</button>
         </div> : <>
           <label className="mt-5 flex h-12 items-center gap-3 rounded-xl bg-[#f3f7fd] px-4 text-[#7588a3]">
             <Icon name="search" size={18}/>
             <input value={composeSearch} onChange={e=>setComposeSearch(e.target.value)} placeholder="Tasdiqlangan yoshlarni qidiring..."
               className="w-full border-0 bg-transparent text-sm text-[#1d3554] outline-none placeholder:text-[#8092a9]"/>
           </label>
           <div className="mt-4 max-h-52 overflow-y-auto">
             {candidates.filter(c=>(c.display_name+" "+(c.article?.title||"")).toLocaleLowerCase("uz").includes(composeSearch.toLocaleLowerCase("uz")))
               .map(c=><button key={c.user_id} type="button" onClick={()=>{if(c.article)setTarget(c.article);}}
                 className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-[#f3f8ff]">
                 <ConnectAvatar identity={c} size={43}/>
                 <div className="min-w-0"><p className="truncate text-sm font-semibold">{c.display_name}</p><p className="truncate text-xs text-[#7c90a8]">{c.article?.title||"Ensiklopediya"}</p></div>
               </button>)}
             {!candidates.length&&<p className="py-7 text-center text-xs leading-6 text-[#7488a2]">Hozircha chatni yoqqan tasdiqlangan profil mavjud emas.</p>}
           </div>
         </>}
         {target&&<>
           <div className="mt-5 flex flex-wrap gap-2">
             <button type="button" onClick={()=>setKind("question")} className={kind==="question"?mainButton:smallButton}>Savol</button>
             <button type="button" onClick={()=>setKind("collaboration")} className={kind==="collaboration"?mainButton:smallButton}>Hamkorlik</button>
           </div>
           <textarea rows={4} maxLength={2000} value={firstMessage} onChange={e=>setFirstMessage(e.target.value)}
             placeholder="Nima haqida suhbatlashmoqchisiz? Kamida 10 ta belgi..."
             className="mt-4 w-full rounded-2xl border border-[#d3e0f1] bg-[#f9fbff] p-4 text-sm text-[#1d3554] outline-none placeholder:text-[#8698b1]"/>
           <p className="mt-2 text-xs leading-5 text-[#7389a6]">Nomzod so‘rovni qabul qilmaguncha boshqa xabar yuborolmaysiz.</p>
           <button type="button" onClick={()=>void startThread()} disabled={busy||firstMessage.trim().length<10} className={mainButton+" mt-5 w-full"}>So‘rov yuborish</button>
         </>}
       </>}
     </section>
   </div>}
 </div>;
}
