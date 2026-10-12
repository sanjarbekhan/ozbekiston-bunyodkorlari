"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = { user_id: string; display_name: string; verified_article_id: string | null; chat_enabled: boolean };
type Claim = { id: string; article_id: string; note: string; status: string; created_at: string };
type Thread = {
  id: string; requester_id: string; recipient_id: string; requester_name: string;
  recipient_name: string; kind: "question" | "collaboration"; status: "pending" | "accepted" | "declined";
  updated_at: string; requester_read_at: string | null; recipient_read_at: string | null;
};
type ChatMessage = { id: string; sender_id: string; body: string; created_at: string };
type ArticleItem = { id: string; title: string; slug: string };
type State = "checking" | "guest" | "signed-in";

function errorMessage(value: unknown) {
  return value instanceof Error ? value.message : String(value || "Noma’lum xatolik");
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
const field = "w-full rounded-2xl border border-[#dce6f5] bg-[#f8fbff] px-4 py-3 text-sm text-[#18315a] outline-none focus:border-[#2866ff]";
const primary = "rounded-2xl bg-[#245fff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#164bd8] disabled:cursor-not-allowed disabled:opacity-50";
const subtle = "rounded-xl border border-[#dce6f5] bg-white px-4 py-2 text-sm font-semibold text-[#265388] hover:bg-[#f1f7ff]";
const card = "rounded-[26px] border border-[#dbe7f5] bg-white p-5 shadow-[0_14px_34px_rgba(25,59,110,.06)]";

export default function ConnectApp() {
  const [authState, setAuthState] = useState<State>("checking");
  const [user, setUser] = useState<User | null>(null);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [kind, setKind] = useState<"question" | "collaboration">("question");
  const [targetArticle, setTargetArticle] = useState<ArticleItem | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [articleMatches, setArticleMatches] = useState<ArticleItem[]>([]);
  const [claimArticle, setClaimArticle] = useState<ArticleItem | null>(null);
  const [claimNote, setClaimNote] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"chats" | "profile">("chats");
  const [filter, setFilter] = useState<"all" | "unread" | "pending">("all");

  const selected = useMemo(() => threads.find((t) => t.id === selectedId) || null, [threads, selectedId]);

  const loadPersonal = useCallback(async () => {
    if (!user) return;
    const [p, c, t] = await Promise.all([
      supabase.from("connect_profiles").select("user_id,display_name,verified_article_id,chat_enabled").eq("user_id", user.id).maybeSingle(),
      supabase.from("connect_claims").select("id,article_id,note,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("connect_threads").select("id,requester_id,recipient_id,requester_name,recipient_name,kind,status,updated_at,requester_read_at,recipient_read_at").order("updated_at", { ascending: false }).limit(60),
    ]);
    if (p.error || c.error || t.error) {
      setNotice("Chat bazasi hali ulanmagan yoki vaqtinchalik mavjud emas. Administratorga murojaat qiling.");
      return;
    }
    const next = (p.data as Profile | null) || null;
    setProfile(next);
    setName((current) => current || next?.display_name || "");
    setClaims((c.data || []) as Claim[]);
    setThreads((t.data || []) as Thread[]);
  }, [user]);

  const loadMessages = useCallback(async (id: string) => {
    const { data, error } = await supabase.from("connect_messages")
      .select("id,sender_id,body,created_at").eq("thread_id", id)
      .order("created_at", { ascending: false }).limit(60);
    if (error) { setNotice(error.message); return; }
    setMessages(((data || []) as ChatMessage[]).reverse());
    await supabase.rpc("connect_mark_read", { p_thread: id });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const article = params.get("article");
    const type = params.get("kind");
    if (type === "collaboration") setKind("collaboration");
    if (article && /^[0-9a-f-]{36}$/i.test(article)) {
      void supabase.from("articles").select("id,title,slug").eq("id", article).eq("status", "published").maybeSingle().then(({ data }) => {
        if (data) setTargetArticle(data as ArticleItem);
      });
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthState(session?.user ? "signed-in" : "guest");
    });
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthState(data.user ? "signed-in" : "guest");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { void loadPersonal(); }, [loadPersonal]);
  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);
  useEffect(() => {
    if (!user) return;
    // RLS on both tables ensures only participant records can be received.
    const channel = supabase.channel("bunyodkor-connect-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "connect_threads" }, () => { void loadPersonal(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "connect_messages" }, (payload) => {
        const item = payload.new as { thread_id?: string };
        if (item.thread_id && item.thread_id === selectedId) void loadMessages(selectedId);
        void loadPersonal();
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, selectedId, loadPersonal, loadMessages]);

  useEffect(() => {
    if (!user) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadPersonal();
      if (selectedId) void loadMessages(selectedId);
    }, 20000);
    return () => window.clearInterval(interval);
  }, [user, selectedId, loadPersonal, loadMessages]);

  useEffect(() => {
    if (!articleSearch.trim() || articleSearch.trim().length < 2) { setArticleMatches([]); return; }
    const handle = window.setTimeout(() => {
      void supabase.from("articles").select("id,title,slug").eq("status", "published")
        .ilike("title", "%" + articleSearch.trim().replace(/[%_]/g, "") + "%").limit(8)
        .then(({ data }) => setArticleMatches((data || []) as ArticleItem[]));
    }, 350);
    return () => window.clearTimeout(handle);
  }, [articleSearch]);

  async function action(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setNotice("");
    try { await work(); } catch (e) { setNotice(errorMessage(e)); }
    finally { setBusy(false); }
  }
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await action(async () => {
      const result = loginMode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      setNotice(loginMode === "signup" ? "Ro‘yxatdan o‘tish so‘rovi yuborildi. Emailingizni tasdiqlang." : "Hisobga kirdingiz.");
      setPassword("");
    });
  }
  async function saveProfile() {
    if (!user) return;
    const clean = name.trim();
    if (clean.length < 2 || clean.length > 80) { setNotice("Ismingiz 2–80 belgidan iborat bo‘lsin."); return; }
    await action(async () => {
      const result = profile
        ? await supabase.from("connect_profiles").update({ display_name: clean }).eq("user_id", user.id)
        : await supabase.from("connect_profiles").insert({ user_id: user.id, display_name: clean });
      if (result.error) throw result.error;
      await loadPersonal(); setNotice("Profil saqlandi.");
    });
  }
  async function setAvailability(next: boolean) {
    if (!user || !profile?.verified_article_id) return;
    await action(async () => {
      const { error } = await supabase.from("connect_profiles").update({ chat_enabled: next }).eq("user_id", user.id);
      if (error) throw error;
      await loadPersonal();
      setNotice(next ? "Chat qabul qilish yoqildi." : "Chat qabul qilish o‘chirildi.");
    });
  }
  async function submitClaim() {
    if (!user || !claimArticle) return;
    if (claimNote.trim().length < 15) { setNotice("Shaxsingizni tasdiqlash uchun izoh yozing (kamida 15 belgi)."); return; }
    await action(async () => {
      const { error } = await supabase.from("connect_claims").insert({
        user_id: user.id, article_id: claimArticle.id, note: claimNote.trim(),
      });
      if (error) throw error;
      setClaimNote(""); setClaimArticle(null); setArticleSearch("");
      await loadPersonal();
      setNotice("Ariza tahririyatga yuborildi. Tasdiqdan so‘ng chatni yoqishingiz mumkin.");
    });
  }
  async function startThread() {
    if (!targetArticle) return;
    await action(async () => {
      const { data, error } = await supabase.rpc("connect_start_thread", {
        p_article_id: targetArticle.id, p_kind: kind, p_message: firstMessage.trim(),
      });
      if (error) throw error;
      setSelectedId(data as string); setTargetArticle(null); setFirstMessage(""); setTab("chats");
      window.history.replaceState(null, "", "/chat");
      await loadPersonal();
      setNotice("Suhbat so‘rovi yuborildi. Nomzod qabul qilgach, yozishishni davom ettirasiz.");
    });
  }
  async function respondThread(accept: boolean) {
    if (!selected) return;
    await action(async () => {
      const { error } = await supabase.rpc("connect_respond", { p_thread: selected.id, p_accept: accept });
      if (error) throw error;
      await loadPersonal();
      setNotice(accept ? "Suhbat qabul qilindi." : "Suhbat so‘rovi rad etildi.");
    });
  }
  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !messageInput.trim()) return;
    await action(async () => {
      const { error } = await supabase.rpc("connect_send", { p_thread: selected.id, p_body: messageInput.trim() });
      if (error) throw error;
      setMessageInput("");
      await loadMessages(selected.id); await loadPersonal();
    });
  }
  async function blockOrReport(mode: "block" | "report") {
    if (!user || !selected) return;
    await action(async () => {
      if (mode === "block") {
        const other = selected.requester_id === user.id ? selected.recipient_id : selected.requester_id;
        const { error } = await supabase.from("connect_blocks").insert({ blocker_id: user.id, blocked_id: other });
        if (error && error.code !== "23505") throw error;
        setNotice("Foydalanuvchi bloklandi. Yangi xabarlar yuborilmaydi.");
      } else {
        if (reportReason.trim().length < 10) { setNotice("Shikoyat sababini kamida 10 belgida yozing."); return; }
        const { error } = await supabase.from("connect_reports").insert({
          thread_id: selected.id, reporter_id: user.id, reason: reportReason.trim(),
        });
        if (error) throw error;
        setReportReason("");
        setNotice("Shikoyat tahririyatga yuborildi.");
      }
    });
  }
  const shownThreads = threads.filter((t) => {
    if (filter === "pending") return t.status === "pending" && t.recipient_id === user?.id;
    if (filter === "unread") {
      const read = t.requester_id === user?.id ? t.requester_read_at : t.recipient_read_at;
      return !read || new Date(t.updated_at) > new Date(read);
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#2866ff]">BUNYODKOR CONNECT</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#16346c] md:text-5xl">Yoshlar bilan bog‘laning</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f7291]">Savol bering, tajriba almashing va hamkorlik taklif qiling. Suhbatlar faqat ishtirokchilarga ko‘rinadi.</p>
      </div>
      {notice && <div role="status" className="mb-5 rounded-2xl border border-[#bfd7fd] bg-[#eef5ff] p-4 text-sm font-semibold text-[#184b97]">{notice} <button className="ml-3 underline" onClick={() => setNotice("")}>Yopish</button></div>}
      {authState === "checking" ? <p className={card}>Hisob tekshirilmoqda...</p> : null}
      {authState === "guest" && (
        <div className={card + " mx-auto max-w-lg"}>
          <h2 className="text-xl font-extrabold text-[#153c77]">{loginMode === "login" ? "Hisobga kirish" : "Ro‘yxatdan o‘tish"}</h2>
          <p className="mt-2 text-sm text-[#64748b]">Yozishmalar uchun email orqali shaxsiy hisob talab qilinadi.</p>
          <form onSubmit={signIn} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Email <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field + " mt-2"} /></label>
            <label className="block text-sm font-semibold">Parol <input type="password" minLength={6} required autoComplete={loginMode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={field + " mt-2"} /></label>
            <button disabled={busy} className={primary + " w-full"}>{busy ? "Kuting..." : loginMode === "login" ? "Kirish" : "Hisob yaratish"}</button>
          </form>
          <button type="button" className="mt-4 text-sm font-bold text-[#245fff] underline" onClick={() => setLoginMode(loginMode === "login" ? "signup" : "login")}>
            {loginMode === "login" ? "Hisobim yo‘q — ro‘yxatdan o‘tish" : "Hisobim bor — kirish"}
          </button>
        </div>
      )}
      {authState === "signed-in" && user && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button className={tab === "chats" ? primary : subtle} onClick={() => setTab("chats")}>Xabarlar</button>
            <button className={tab === "profile" ? primary : subtle} onClick={() => setTab("profile")}>Shaxsiy kabinet</button>
            <span className="ml-auto text-xs text-[#64748b]">{user.email}</span>
            <button className={subtle} onClick={() => void supabase.auth.signOut()}>Chiqish</button>
          </div>
          {!profile && (
            <div className={card + " mb-6"}>
              <h2 className="text-lg font-bold text-[#153c77]">Birinchi qadam — profilingiz</h2>
              <p className="mt-1 text-sm text-[#64748b]">Xabar yuborishdan oldin ism-familiyangizni kiriting.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <input className={field + " max-w-md"} placeholder="Ism va familiya" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                <button className={primary} disabled={busy} onClick={() => void saveProfile()}>Saqlash</button>
              </div>
            </div>
          )}
          {tab === "profile" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className={card}>
                <h2 className="text-xl font-black text-[#153c77]">Shaxsiy ma’lumotlar</h2>
                <label className="mt-4 block text-sm font-semibold">Ko‘rinadigan ism
                  <input className={field + " mt-2"} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
                </label>
                <button className={primary + " mt-3"} disabled={busy} onClick={() => void saveProfile()}>Saqlash</button>
                {profile?.verified_article_id ? (
                  <div className="mt-6 rounded-2xl bg-[#eef7ff] p-4">
                    <p className="font-bold text-[#14549f]">Profil egasi tasdiqlangan</p>
                    <Link className="mt-2 block text-sm text-[#245fff] underline" href={"/chat?article=" + profile.verified_article_id}>Profilimga bog‘lanish</Link>
                    <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
                      <input type="checkbox" checked={profile.chat_enabled} onChange={(e) => void setAvailability(e.target.checked)} disabled={busy} className="h-5 w-5" />
                      Suhbat so‘rovlarini qabul qilish
                    </label>
                  </div>
                ) : <p className="mt-5 text-sm text-[#64748b]">Hali biriktirilgan ensiklopedik maqola yo‘q. Quyida tasdiqlash so‘rovini yuboring.</p>}
              </div>
              <div className={card}>
                <h2 className="text-xl font-black text-[#153c77]">Biografik maqolani biriktirish</h2>
                <p className="mt-2 text-sm text-[#64748b]">Faqat o‘zingizga tegishli maqolani tanlang. Tahririyat haqiqiy egasi ekaningizni tekshiradi.</p>
                <input className={field + " mt-4"} placeholder="Maqoladagi ism-familiyani qidiring..." value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} />
                {articleMatches.length>0 && <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-[#dce6f5]">{articleMatches.map((item)=><button type="button" key={item.id} className="block w-full border-b px-4 py-3 text-left text-sm hover:bg-[#eef5ff]" onClick={()=>{setClaimArticle(item);setArticleMatches([]);setArticleSearch(item.title)}}>{item.title}</button>)}</div>}
                {claimArticle && <p className="mt-3 text-sm font-bold text-[#155bb9]">Tanlandi: {claimArticle.title}</p>}
                <textarea rows={4} className={field + " mt-3"} maxLength={1000} placeholder="Maqola sizga tegishli ekanini qanday tasdiqlaysiz? Aloqa ma’lumotlari va izoh..." value={claimNote} onChange={(e)=>setClaimNote(e.target.value)} />
                <button className={primary + " mt-3"} disabled={busy||!profile||!claimArticle||claimNote.trim().length<15} onClick={()=>void submitClaim()}>Tahririyatga yuborish</button>
                {claims.length>0 && <div className="mt-5 space-y-2">{claims.map((item)=><p key={item.id} className="rounded-xl bg-[#f3f7fc] px-4 py-3 text-xs">So‘rov: <b>{item.status==="pending"?"Tekshirilmoqda":item.status==="approved"?"Tasdiqlandi":"Rad etildi"}</b> • {formatTime(item.created_at)}</p>)}</div>}
              </div>
            </div>
          )}
          {tab === "chats" && (
            <>
              {targetArticle && <div className={card + " mb-5"}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2866ff]">Yangi suhbat so‘rovi</p>
                <h2 className="mt-2 text-xl font-black text-[#153c77]">{targetArticle.title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className={kind==="question"?primary:subtle} onClick={()=>setKind("question")}>Savol berish</button>
                  <button className={kind==="collaboration"?primary:subtle} onClick={()=>setKind("collaboration")}>Hamkorlik taklifi</button>
                </div>
                <textarea rows={4} className={field + " mt-4"} value={firstMessage} onChange={(e)=>setFirstMessage(e.target.value)} maxLength={2000} placeholder="Suhbatni nima uchun boshlayotganingizni yozing (10–2000 belgi)..." />
                <p className="mt-2 text-xs text-[#64748b]">Nomzod qabul qilmaguncha keyingi xabarni yubora olmaysiz.</p>
                <button className={primary + " mt-3"} disabled={busy||!profile||firstMessage.trim().length<10} onClick={()=>void startThread()}>So‘rov yuborish</button>
              </div>}
              <div className="grid min-h-[480px] gap-4 lg:grid-cols-[320px_1fr]">
                <div className={card + " min-w-0"}>
                  <h2 className="text-xl font-black text-[#153c77]">Suhbatlar</h2>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(["all","unread","pending"] as const).map((f)=><button key={f} type="button" onClick={()=>setFilter(f)} className={filter===f?primary:subtle}>{f==="all"?"Barchasi":f==="unread"?"O‘qilmagan":"So‘rovlar"}</button>)}
                  </div>
                  <div className="mt-4 space-y-2">
                    {shownThreads.length===0 && <p className="rounded-2xl bg-[#f4f8fe] p-5 text-sm text-[#64748b]">Bu yerda hozircha suhbat yo‘q. Ensiklopediyadagi yoshga “Savol berish” tugmasi orqali murojaat qiling.</p>}
                    {shownThreads.map((t)=>{
                      const incoming=t.recipient_id===user.id;
                      const title=incoming?t.requester_name:t.recipient_name;
                      const readAt=incoming?t.recipient_read_at:t.requester_read_at;
                      const unread=!readAt||new Date(t.updated_at)>new Date(readAt);
                      return <button type="button" key={t.id} onClick={()=>setSelectedId(t.id)} className={"flex w-full flex-col rounded-2xl border p-4 text-left transition "+(selectedId===t.id?"border-[#70a5ff] bg-[#eaf3ff]":"border-[#e5edf9] hover:bg-[#f5f9ff]")}>
                        <span className="flex w-full items-center justify-between gap-2"><b className="line-clamp-1 text-sm text-[#183d78]">{title}</b>{unread&&<span className="h-2.5 w-2.5 rounded-full bg-[#2866ff]" />}</span>
                        <span className="mt-1 text-xs text-[#64748b]">{t.kind==="question"?"Savol":"Hamkorlik"} • {t.status==="pending"?"Kutilmoqda":t.status==="accepted"?"Faol":"Rad etilgan"}</span>
                        <span className="mt-1 text-[11px] text-[#94a3b8]">{formatTime(t.updated_at)}</span>
                      </button>;
                    })}
                  </div>
                </div>
                <div className={card + " flex min-w-0 flex-col"}>
                  {!selected ? <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center"><span className="text-5xl">✉</span><h3 className="text-xl font-extrabold text-[#153c77]">Suhbatni tanlang</h3><p className="text-sm text-[#64748b]">Savollar va hamkorlik takliflari shu yerda ko‘rinadi.</p></div> : <>
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#e7eef9] pb-4">
                      <div><h3 className="text-lg font-black text-[#153c77]">{selected.requester_id===user.id?selected.recipient_name:selected.requester_name}</h3>
                      <p className="text-xs text-[#64748b]">{selected.kind==="collaboration"?"Hamkorlik taklifi":"Savol"} • {selected.status==="pending"?"Tasdiq kutilmoqda":selected.status==="accepted"?"Suhbat faol":"Rad etilgan"}</p></div>
                      <button className={subtle} onClick={()=>setSelectedId(null)}>Yopish ×</button>
                    </div>
                    <div className="my-4 flex max-h-[440px] min-h-[240px] flex-1 flex-col gap-3 overflow-y-auto px-1" aria-live="polite">
                      {messages.map((msg)=><div key={msg.id} className={"max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 "+(msg.sender_id===user.id?"self-end bg-[#245fff] text-white":"self-start bg-[#eef4ff] text-[#183d78]")}><p className="whitespace-pre-wrap break-words">{msg.body}</p><span className={"mt-1 block text-right text-[10px] "+(msg.sender_id===user.id?"text-white/75":"text-[#8194ad]")}>{formatTime(msg.created_at)}</span></div>)}
                    </div>
                    {selected.status==="pending"&&selected.recipient_id===user.id&&<div className="mb-4 flex flex-wrap gap-2"><button className={primary} disabled={busy} onClick={()=>void respondThread(true)}>Suhbatni qabul qilish</button><button className={subtle} disabled={busy} onClick={()=>void respondThread(false)}>Rad etish</button></div>}
                    {selected.status==="accepted" ? <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#e7eef9] pt-4"><input className={field} maxLength={2000} value={messageInput} onChange={(e)=>setMessageInput(e.target.value)} placeholder="Xabar yozing..." /><button className={primary} disabled={busy||!messageInput.trim()}>Yuborish</button></form> : <p className="rounded-xl bg-[#f4f8fe] p-3 text-xs text-[#64748b]">Xabar almashish faqat so‘rov qabul qilingandan keyin yoqiladi.</p>}
                    <details className="mt-4 border-t border-[#e7eef9] pt-3 text-xs text-[#64748b]"><summary className="cursor-pointer font-semibold">Xavfsizlik: bloklash yoki shikoyat</summary>
                      <div className="mt-3 flex flex-wrap gap-2"><button className={subtle} disabled={busy} onClick={()=>void blockOrReport("block")}>Bloklash</button></div>
                      <textarea className={field + " mt-3"} rows={2} maxLength={600} placeholder="Shikoyat sababi (kamida 10 belgi)..." value={reportReason} onChange={(e)=>setReportReason(e.target.value)} />
                      <button className={subtle + " mt-2"} disabled={busy||reportReason.trim().length<10} onClick={()=>void blockOrReport("report")}>Shikoyat yuborish</button>
                    </details>
                  </>}
                </div>
              </div>
            </>
          )}
          <p className="mt-7 text-center text-xs leading-6 text-[#64748b]">Shaxsiy ma’lumotlar va hujjatlarni begonalarga yubormang. Voyaga yetmaganlar nomidan chat tahririyat ruxsatisiz ochilmaydi.</p>
        </>
      )}
    </div>
  );
}
