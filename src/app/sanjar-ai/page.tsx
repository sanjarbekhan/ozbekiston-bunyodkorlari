"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

type Source = { title: string; url: string; category: string | null };
type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  mode?: "ai" | "encyclopedia" | "grounded";
};

const suggestions = [
  "Ensiklopediya haqida aytib ber",
  "Nima qila olasan?",
  "Reyting qanday hisoblanadi?",
  "IT yo‘nalishidagi bunyodkorlarni ko‘rsat",
  "Ariza qanday topshiraman?",
];

export default function SanjarAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Salom! Men Sanjar AI — O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining raqamli yordamchisiman. Ensiklopediya, profillar, yutuqlar, reyting va ariza topshirish bo‘yicha savollaringizga javob beraman.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    const value = text.trim();
    if (!value || loading) return;

    const history = messages.slice(-8).map((message) => ({
      role: message.role,
      text: message.text,
    }));

    setMessages((current) => [...current, { role: "user", text: value }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/sanjar-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value, history }),
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

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <main className="min-h-screen bg-[#edf8ff] text-[#112033]">
      <SiteMenu />
      <section className="px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0c9ed0]">Ensiklopediya yordamchisi</p>
            <h1 className="mt-4 text-[44px] font-black leading-[0.98] tracking-[-0.05em] text-[#08233d] sm:text-[58px]">Sanjar AI</h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 md:text-lg">
              O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bo‘yicha ma’lumotlarni topish, tushuntirish va kerakli profilga yo‘naltirish uchun yaratilgan raqamli yordamchi.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                ["◎", "Ensiklopediya va loyiha haqida tushuntiradi"],
                ["⌕", "Ism, yo‘nalish yoki kalit so‘z bo‘yicha profil topadi"],
                ["↗", "Reyting formulasini va ball sababini tushuntiradi"],
                ["✓", "Ariza topshirish va ensiklopediyaga qo‘shilish yo‘lini ko‘rsatadi"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-4 rounded-[22px] border border-[#b9e3f2] bg-white/85 p-4 shadow-[0_14px_35px_rgba(23,112,148,.06)] backdrop-blur">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0aa9d8] text-lg font-black text-white">{icon}</span>
                  <p className="text-sm font-bold leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-extrabold">
              <Link href="/reyting" className="rounded-full bg-[#08233d] px-5 py-3 text-white">Reytingni ko‘rish</Link>
              <Link href="/bunyodkorlar" className="rounded-full border border-[#b9dfea] bg-white px-5 py-3 text-[#0a6d93]">Katalog</Link>
            </div>
          </div>

          <section className="overflow-hidden rounded-[30px] border border-[#a9ddea] bg-white shadow-[0_24px_70px_rgba(24,117,151,.12)]">
            <header className="bg-[linear-gradient(100deg,#0798c8,#20c3de)] px-5 py-5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/18 text-lg font-black backdrop-blur">SA</div>
                <div>
                  <h2 className="text-lg font-black">Sanjar AI</h2>
                  <p className="text-xs font-semibold text-white/80">Ensiklopediya raqamli yordamchisi</p>
                </div>
              </div>
            </header>

            <div className="min-h-[520px] space-y-4 bg-white p-4 sm:p-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[92%]"}>
                  <div className={message.role === "user" ? "rounded-[22px_22px_6px_22px] bg-[#0b6db5] px-4 py-3 text-sm font-semibold leading-6 text-white" : "rounded-[22px_22px_22px_6px] border border-[#cae8f1] bg-[#f4fbfe] px-4 py-4 text-sm font-semibold leading-6 text-slate-600"}>
                    {message.text}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.sources.slice(0, 5).map((source) => (
                        <a key={source.url} href={source.url} className="rounded-full border border-[#c9e7ef] bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#087ca5] transition hover:bg-[#effaff]">
                          {source.title} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[80%] rounded-[22px_22px_22px_6px] border border-[#cae8f1] bg-[#f4fbfe] px-4 py-3 text-sm font-bold text-slate-400">
                  Sanjar AI javob tayyorlamoqda…
                </div>
              )}

              {!loading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((item) => (
                    <button key={item} type="button" onClick={() => void ask(item)} className="rounded-full bg-[#e8f8fd] px-4 py-2.5 text-xs font-extrabold text-[#087ca5] transition hover:bg-[#d8f3fb]">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-[#d8edf3] bg-[#fbfdfe] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={700}
                  placeholder="Ensiklopediya haqida savol yozing…"
                  className="min-w-0 flex-1 rounded-full border border-[#bfdfe8] bg-white px-5 py-3.5 text-sm font-semibold outline-none transition focus:border-[#0aa9d8] focus:ring-4 focus:ring-[#0aa9d8]/10"
                />
                <button disabled={loading || question.trim().length < 2} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#13b9d7] text-lg font-black text-white transition hover:bg-[#08a9cb] disabled:opacity-40" type="submit" aria-label="Savolni yuborish">
                  →
                </button>
              </div>
              <p className="mt-2 px-2 text-[11px] font-semibold text-slate-400">Sanjar AI ensiklopediya bazasidagi ochiq ma’lumotlarga tayanadi; bazada bo‘lmagan biografik faktni o‘ylab topmaydi.</p>
            </form>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
