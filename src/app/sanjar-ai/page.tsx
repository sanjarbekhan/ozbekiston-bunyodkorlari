"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

type Source = { title: string; url: string; category: string | null };
type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  mode?: "ai" | "encyclopedia" | "grounded";
};

const firstMessage: Message = {
  role: "assistant",
  text: "Salom! Men Sanjar AI — O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining raqamli yordamchisiman. Profil, yutuq, reyting, yo‘nalish yoki ariza bo‘yicha savolingizni yozing.",
};

const quickActions = [
  { label: "Profil topish", value: "Ism yoki yo‘nalish bo‘yicha profil topishga yordam ber" },
  { label: "Reyting", value: "Reyting qanday hisoblanadi?" },
  { label: "IT / AI", value: "IT va AI yo‘nalishidagi bunyodkorlarni ko‘rsat" },
  { label: "Ariza", value: "Ariza qanday topshiraman?" },
  { label: "Loyiha haqida", value: "Ensiklopediya haqida aytib ber" },
];

function SanjarMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "h-9 w-9" : "h-12 w-12"} relative flex shrink-0 items-center justify-center rounded-2xl bg-[#0b2944] shadow-[0_10px_28px_rgba(8,35,61,.18)]`}>
      <svg viewBox="0 0 40 40" className={`${compact ? "h-5 w-5" : "h-7 w-7"} text-white`} fill="none" aria-hidden="true">
        <path d="M8 23c5-1 8-5 11-10 2 4 5 6 13 7-4 2-7 5-10 11-3-4-7-7-14-8Z" fill="currentColor" />
        <path d="M20 8c1 3 3 5 6 7-3 0-5 1-7 3 0-4 0-7 1-10Z" fill="#25c3df" />
      </svg>
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#20bfdc] text-[8px] font-black text-white">✦</span>
    </div>
  );
}

function modeLabel(mode?: Message["mode"]) {
  if (mode === "grounded") return "Manbalar bilan tekshirilgan";
  if (mode === "encyclopedia") return "Ensiklopediya ma’lumoti";
  if (mode === "ai") return "AI + ensiklopediya";
  return "Ensiklopediya yordamchisi";
}

export default function SanjarAIPage() {
  const [messages, setMessages] = useState<Message[]>([firstMessage]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function runRequest(value: string, historyBase: Message[], appendUser: boolean) {
    const clean = value.trim();
    if (!clean || loading) return;

    const history = historyBase.slice(-8).map((message) => ({ role: message.role, text: message.text }));
    if (appendUser) setMessages((current) => [...current, { role: "user", text: clean }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/sanjar-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, history }),
      });
      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.answer || data.error || "Javobni tayyorlab bo‘lmadi.",
          sources: Array.isArray(data.sources) ? data.sources : [],
          mode: data.mode,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Hozir javobni tayyorlashda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function ask(text: string) {
    await runRequest(text, messages, true);
  }

  function regenerate() {
    if (loading) return;
    let lastUserIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "user") {
        lastUserIndex = index;
        break;
      }
    }
    if (lastUserIndex < 0) return;

    const value = messages[lastUserIndex].text;
    const base = messages.slice(0, lastUserIndex);
    setMessages(messages.slice(0, lastUserIndex + 1));
    setFeedback({});
    void runRequest(value, base, false);
  }

  function resetChat() {
    if (loading) return;
    setMessages([firstMessage]);
    setQuestion("");
    setCopiedIndex(null);
    setFeedback({});
  }

  async function copyAnswer(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1400);
    } catch {
      setCopiedIndex(null);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#122235]">
      <SiteMenu />

      <section className="px-3 pb-14 pt-20 sm:px-5 md:px-8 md:pb-20 md:pt-24">
        <div className="mx-auto grid max-w-[1380px] gap-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-5">
          <aside className="rounded-[28px] border border-[#dce7ee] bg-white p-4 shadow-[0_18px_60px_rgba(18,50,78,.06)] lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center gap-3 border-b border-[#edf2f5] pb-4">
              <SanjarMark />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#21aeca]">Bunyodkor AI</p>
                <h1 className="mt-0.5 text-xl font-black tracking-[-0.03em] text-[#0b2944]">Sanjar AI</h1>
              </div>
            </div>

            <button
              type="button"
              onClick={resetChat}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b2944] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123c60] disabled:opacity-50"
            >
              <span className="text-lg leading-none">＋</span> Yangi suhbat
            </button>

            <div className="mt-5">
              <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Imkoniyatlar</p>
              <div className="mt-2 space-y-1">
                {[
                  ["⌕", "Profil va yo‘nalish qidirish"],
                  ["↗", "Reytingni tushuntirish"],
                  ["✓", "Ariza bo‘yicha yo‘l-yo‘riq"],
                  ["◎", "Ensiklopediya haqida javob"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf8fb] text-[#169fba]">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#edf2f5] pt-4">
              <Link href="/bunyodkorlar" className="rounded-xl border border-[#dce7ee] bg-[#f9fbfc] px-3 py-2.5 text-center text-xs font-extrabold text-[#0b2944] transition hover:bg-[#f1f6f8]">
                Katalog
              </Link>
              <Link href="/reyting" className="rounded-xl border border-[#dce7ee] bg-[#f9fbfc] px-3 py-2.5 text-center text-xs font-extrabold text-[#0b2944] transition hover:bg-[#f1f6f8]">
                Reyting
              </Link>
            </div>
          </aside>

          <section className="overflow-hidden rounded-[30px] border border-[#d8e5ec] bg-white shadow-[0_22px_80px_rgba(14,54,84,.08)]">
            <header className="flex items-center justify-between gap-4 border-b border-[#e7eef2] bg-white px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SanjarMark compact />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-black text-[#0b2944]">Sanjar AI</h2>
                    <span className="hidden rounded-full bg-[#eaf9f1] px-2 py-1 text-[10px] font-black text-[#198754] sm:inline">● Online</span>
                  </div>
                  <p className="truncate text-xs font-semibold text-slate-400">O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi yordamchisi</p>
                </div>
              </div>
              <button type="button" onClick={resetChat} disabled={loading} className="rounded-xl border border-[#dbe6ec] px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-[#f6f9fb] disabled:opacity-50 sm:hidden">
                Yangi
              </button>
            </header>

            <div className="h-[62vh] min-h-[540px] overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfe_100%)] px-4 py-6 sm:px-7 md:min-h-[620px]">
              <div className="mx-auto max-w-4xl space-y-7" aria-live="polite">
                {messages.map((message, index) => {
                  if (message.role === "user") {
                    return (
                      <div key={`user-${index}`} className="ml-auto max-w-[86%] sm:max-w-[72%]">
                        <div className="rounded-[22px_22px_6px_22px] bg-[#0b2944] px-4 py-3 text-sm font-semibold leading-6 text-white shadow-[0_8px_24px_rgba(11,41,68,.12)] sm:px-5">
                          {message.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`assistant-${index}`} className="flex max-w-[96%] gap-3 sm:max-w-[90%]">
                      <SanjarMark compact />
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-[#0b2944]">Sanjar AI</span>
                          <span className="rounded-full bg-[#edf8fb] px-2.5 py-1 text-[10px] font-extrabold text-[#168fa8]">✓ {modeLabel(message.mode)}</span>
                        </div>

                        <p className="whitespace-pre-wrap text-[15px] font-medium leading-7 text-[#3f5062]">{message.text}</p>

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0b2944]">Manbalar</span>
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eaf6fa] px-1.5 text-[10px] font-black text-[#168fa8]">{message.sources.length}</span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {message.sources.slice(0, 4).map((source) => (
                                <a
                                  key={source.url}
                                  href={source.url}
                                  className="group rounded-2xl border border-[#dce8ee] bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#b9dce7] hover:shadow-[0_12px_28px_rgba(20,84,111,.08)]"
                                >
                                  <p className="line-clamp-2 text-xs font-extrabold leading-5 text-[#17324a]">{source.title}</p>
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="truncate text-[10px] font-bold text-slate-400">{source.category || "Bunyodkor.com"}</span>
                                    <span className="text-[11px] font-black text-[#17a8c3]">Ochish ↗</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {index > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-bold text-slate-400">
                            <button type="button" onClick={() => void copyAnswer(message.text, index)} className="rounded-lg px-2.5 py-1.5 transition hover:bg-[#f0f5f7] hover:text-[#0b2944]">
                              {copiedIndex === index ? "✓ Nusxalandi" : "⧉ Nusxalash"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedback((current) => ({ ...current, [index]: "up" }))}
                              className={`rounded-lg px-2.5 py-1.5 transition hover:bg-[#f0f5f7] ${feedback[index] === "up" ? "bg-[#eaf9f1] text-[#198754]" : ""}`}
                              aria-label="Javob foydali"
                            >
                              👍
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedback((current) => ({ ...current, [index]: "down" }))}
                              className={`rounded-lg px-2.5 py-1.5 transition hover:bg-[#f0f5f7] ${feedback[index] === "down" ? "bg-[#fff1f1] text-[#bd3b3b]" : ""}`}
                              aria-label="Javob foydali emas"
                            >
                              👎
                            </button>
                            {index === messages.length - 1 && (
                              <button type="button" onClick={regenerate} disabled={loading} className="rounded-lg px-2.5 py-1.5 transition hover:bg-[#f0f5f7] hover:text-[#0b2944] disabled:opacity-40">
                                ↻ Qayta javob
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-3">
                    <SanjarMark compact />
                    <div className="pt-1">
                      <p className="text-xs font-black text-[#0b2944]">Sanjar AI</p>
                      <div className="mt-2 flex items-center gap-1.5 rounded-2xl border border-[#e0eaf0] bg-[#f8fbfc] px-4 py-3">
                        {[0, 1, 2].map((dot) => (
                          <span key={dot} className="h-2 w-2 animate-pulse rounded-full bg-[#25b9d4]" style={{ animationDelay: `${dot * 180}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            <div className="border-t border-[#e4edf1] bg-white px-3 pb-3 pt-3 sm:px-5 sm:pb-5">
              <div className="mx-auto max-w-4xl">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {quickActions.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => void ask(item.value)}
                      disabled={loading}
                      className="shrink-0 rounded-full border border-[#dce8ee] bg-[#f8fbfc] px-3.5 py-2 text-[11px] font-extrabold text-[#28506a] transition hover:border-[#b8dbe6] hover:bg-[#edf8fb] hover:text-[#087f99] disabled:opacity-40"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={submit}>
                  <div className="flex items-end gap-2 rounded-[22px] border border-[#cadce5] bg-white p-2 shadow-[0_10px_32px_rgba(20,67,93,.07)] transition focus-within:border-[#40b9cf] focus-within:ring-4 focus-within:ring-[#23b8d3]/10">
                    <textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          if (!loading && question.trim().length >= 2) void ask(question);
                        }
                      }}
                      rows={1}
                      maxLength={700}
                      placeholder="Sanjar AI’dan so‘rang..."
                      className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-semibold leading-6 text-[#263b4d] outline-none placeholder:text-slate-400"
                    />
                    <button
                      disabled={loading || question.trim().length < 2}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#18b5d0] text-lg font-black text-white shadow-[0_8px_22px_rgba(24,181,208,.24)] transition hover:bg-[#0fa6c1] disabled:cursor-not-allowed disabled:opacity-35"
                      type="submit"
                      aria-label="Savolni yuborish"
                    >
                      ➤
                    </button>
                  </div>
                </form>

                <p className="mt-2.5 px-2 text-center text-[10px] font-semibold leading-4 text-slate-400">
                  Sanjar AI ochiq ensiklopediya ma’lumotlariga tayanadi. Muhim faktlarni ko‘rsatilgan manbalar orqali tekshirishingiz mumkin.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
