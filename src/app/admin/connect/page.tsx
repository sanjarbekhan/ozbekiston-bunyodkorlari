"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "988b7d1f-4028-42a6-9a8f-be869224be6e";
type Claim = { id:string; user_id:string; article_id:string; note:string; status:string; created_at:string };
type Report = { id:string; thread_id:string; reason:string; reporter_id:string; status:string; created_at:string };

export default function ConnectAdmin() {
  const [allowed,setAllowed]=useState<boolean|null>(null);
  const [claims,setClaims]=useState<Claim[]>([]);
  const [reports,setReports]=useState<Report[]>([]);
  const [titles,setTitles]=useState<Record<string,string>>({});
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState<string|null>(null);

  async function reload() {
    const [c,r]=await Promise.all([
      supabase.from("connect_claims").select("id,user_id,article_id,note,status,created_at").eq("status","pending").order("created_at",{ascending:true}).limit(100),
      supabase.from("connect_reports").select("id,thread_id,reason,reporter_id,status,created_at").eq("status","pending").order("created_at",{ascending:true}).limit(100),
    ]);
    if(c.error||r.error){ setNotice("Chat bazasi ulanmagan yoki ruxsat yo‘q."); return; }
    const records=(c.data||[]) as Claim[];
    setClaims(records);
    setReports((r.data||[]) as Report[]);
    const ids=Array.from(new Set(records.map(x=>x.article_id)));
    if(ids.length){
      const {data}=await supabase.from("articles").select("id,title").in("id",ids);
      setTitles(Object.fromEntries((data||[]).map(x=>[x.id,x.title])));
    }
  }
  useEffect(()=>{
    void supabase.auth.getUser().then(({data})=>{
      const ok=data.user?.id===ADMIN_ID;
      setAllowed(ok);
      if(ok) void reload();
    });
  },[]);
  async function review(claim:Claim,approve:boolean){
    if(busy)return;
    if(approve&&!window.confirm("Nomzod shaxsi mustaqil tekshirildimi? Tasdiqlash shu biografiyani akkauntga biriktiradi."))return;
    setBusy(claim.id);setNotice("");
    const {error}=await supabase.rpc("connect_review_claim",{p_claim:claim.id,p_approve:approve});
    setBusy(null);
    if(error){setNotice(error.message);return;}
    setNotice(approve?"Profil egasi tasdiqlandi. Chat sukut bo‘yicha o‘chiq qoladi.":"So‘rov rad etildi.");
    await reload();
  }
  async function reviewReport(reportId:string){
    if(busy)return;
    setBusy(reportId);
    const {error}=await supabase.rpc("connect_review_report",{p_report:reportId});
    setBusy(null);
    if(error){setNotice(error.message);return;}
    setNotice("Shikoyat ko‘rib chiqilgan deb belgilandi.");
    await reload();
  }
  if(allowed===null)return <main className="p-8">Admin tekshirilmoqda...</main>;
  if(!allowed)return <main className="p-8">Bu sahifaga ruxsat yo‘q. <Link className="underline" href="/admin/login">Admin hisobiga kiring</Link>.</main>;
  return <main className="min-h-screen bg-[#f4f8ff] px-4 py-10 text-[#17345c]">
    <div className="mx-auto max-w-5xl">
      <Link href="/admin" className="text-sm font-bold text-[#245fff]">← Admin panel</Link>
      <h1 className="mt-4 text-3xl font-black">Bunyodkor Connect — Moderatsiya</h1>
      <p className="mt-2 text-sm text-[#64748b]">Faqat haqiqiy maqola egasi tekshirilgach tasdiqlang. Tasdiqlash chatni avtomatik yoqmaydi.</p>
      {notice&&<p role="status" className="my-5 rounded-xl bg-[#eaf2ff] p-4">{notice}</p>}
      <div className="mt-8 grid gap-6">
        <section className="rounded-3xl border border-[#deebfc] bg-white p-5">
          <h2 className="text-xl font-black">Profilni biriktirish so‘rovlari ({claims.length})</h2>
          {claims.length===0&&<p className="mt-4 text-sm text-[#64748b]">Hozircha so‘rov yo‘q.</p>}
          <div className="mt-4 space-y-4">{claims.map(c=><div key={c.id} className="rounded-2xl border border-[#deebfc] p-4">
            <h3 className="font-bold">{titles[c.article_id]||c.article_id}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#526781]">{c.note}</p>
            <p className="mt-2 text-xs text-[#94a3b8]">Akkaunt: {c.user_id} • {new Date(c.created_at).toLocaleString("uz-UZ")}</p>
            <div className="mt-3 flex gap-2">
              <button disabled={!!busy} onClick={()=>void review(c,true)} className="rounded-xl bg-[#245fff] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Tasdiqlash</button>
              <button disabled={!!busy} onClick={()=>void review(c,false)} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Rad etish</button>
            </div>
          </div>)}</div>
        </section>
        <section className="rounded-3xl border border-[#deebfc] bg-white p-5">
          <h2 className="text-xl font-black">Shikoyatlar ({reports.length})</h2>
          {reports.length===0&&<p className="mt-4 text-sm text-[#64748b]">Yangi shikoyat yo‘q.</p>}
          <div className="mt-4 space-y-4">{reports.map(r=><div key={r.id} className="rounded-2xl border border-[#deebfc] p-4">
            <p className="whitespace-pre-wrap text-sm">{r.reason}</p>
            <p className="mt-2 text-xs text-[#64748b]">Suhbat: {r.thread_id} • Shikoyatchi: {r.reporter_id}</p>
            <p className="mt-1 text-xs text-[#94a3b8]">{new Date(r.created_at).toLocaleString("uz-UZ")}</p>
            <p className="mt-2 text-xs text-[#64748b]">Yozishmalar maxfiy. Shikoyatni ko‘rib chiqing.</p>
            <button type="button" disabled={!!busy} onClick={()=>void reviewReport(r.id)} className="mt-3 rounded-xl border border-[#c6d8f3] px-4 py-2 text-xs font-bold text-[#245fff] disabled:opacity-50">Ko‘rib chiqildi</button>
          </div>)}</div>
        </section>
      </div>
    </div>
  </main>;
}
