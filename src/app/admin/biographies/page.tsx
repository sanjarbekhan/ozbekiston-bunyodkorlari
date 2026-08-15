"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BIOGRAPHY_QUESTIONS, BiographyAnswers, BiographyFile } from "@/lib/biography-application";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "988b7d1f-4028-42a6-9a8f-be869224be6e";

type SubmissionStatus = "new" | "reviewing" | "drafting" | "needs_changes" | "published" | "rejected";

type BiographySubmission = {
  id: string;
  full_name: string;
  telegram: string;
  phone: string | null;
  instagram: string;
  answers: BiographyAnswers;
  files: BiographyFile[];
  status: SubmissionStatus;
  admin_note: string | null;
  created_at: string;
};

const STATUS_OPTIONS: ReadonlyArray<[SubmissionStatus, string]> = [
  ["new", "Yangi"],
  ["reviewing", "Tekshirilmoqda"],
  ["drafting", "Maqola yozilmoqda"],
  ["needs_changes", "Qo‘shimcha kerak"],
  ["published", "Nashr qilindi"],
  ["rejected", "Rad etildi"],
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function statusClass(status: SubmissionStatus) {
  if (status === "published") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "needs_changes") return "bg-amber-50 text-amber-700";
  if (status === "drafting") return "bg-violet-50 text-violet-700";
  if (status === "reviewing") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

export default function BiographiesAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<BiographySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user || userData.user.id !== ADMIN_USER_ID) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("biography_submissions")
        .select("id, full_name, telegram, phone, instagram, answers, files, status, admin_note, created_at")
        .order("created_at", { ascending: false });

      if (error) setMessage("Biografik anketalarni yuklab bo‘lmadi: " + error.message);
      if (data) setItems(data as BiographySubmission[]);
      setLoading(false);
    }
    void load();
  }, [router]);

  const selected = selectedId ? items.find((item) => item.id === selectedId) || null : null;

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const haystack = [item.full_name, item.telegram, item.phone || "", item.instagram, ...Object.values(item.answers)]
        .join(" ")
        .toLocaleLowerCase("uz");
      return haystack.includes(query);
    });
  }, [items, search, statusFilter]);

  function patchLocal(id: string, values: Partial<BiographySubmission>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
  }

  async function updateStatus(item: BiographySubmission, status: SubmissionStatus) {
    if (busyId) return;
    setBusyId(item.id);
    patchLocal(item.id, { status });
    const { error } = await supabase.from("biography_submissions").update({ status }).eq("id", item.id);
    setBusyId(null);
    if (error) {
      patchLocal(item.id, { status: item.status });
      setMessage("Holat saqlanmadi: " + error.message);
    }
  }

  async function saveNote(item: BiographySubmission, note: string) {
    patchLocal(item.id, { admin_note: note.trim() || null });
    const { error } = await supabase
      .from("biography_submissions")
      .update({ admin_note: note.trim() || null })
      .eq("id", item.id);
    if (error) setMessage("Admin izohi saqlanmadi: " + error.message);
  }

  async function openFile(file: BiographyFile) {
    const popup = window.open("", "_blank");
    const { data, error } = await supabase.storage.from("application-files").createSignedUrl(file.path, 120);
    if (error || !data?.signedUrl) {
      popup?.close();
      setMessage("Faylni ochib bo‘lmadi: " + (error?.message || "noma’lum xatolik"));
      return;
    }
    if (popup) popup.location.href = data.signedUrl;
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function copyAnswers(item: BiographySubmission) {
    const text = BIOGRAPHY_QUESTIONS.map(
      (question) => `${question.number}. ${question.label}\n${item.answers[question.id] || "—"}`,
    ).join("\n\n");
    await navigator.clipboard.writeText(
      `${item.full_name}\nTelegram: @${item.telegram}\nInstagram: @${item.instagram}\nTelefon: ${item.phone || "—"}\n\n${text}`,
    );
    setMessage("15 ta javob nusxalandi.");
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f3f4f6] p-5"><p className="font-bold">Biografik anketalar yuklanmoqda...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] pb-12 text-[#1f2937]">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-5 md:py-7">
        <header className="rounded-[28px] bg-[#071426] p-5 text-white shadow-xl sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74a9ff]">O‘zBYE boshqaruv</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Biografik anketalar</h1>
              <p className="mt-2 text-sm font-medium text-white/55">Maqola uchun yuborilgan 15 savol va fayllar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/applications" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-extrabold transition hover:bg-white/20">Birinchi arizalar</Link>
              <Link href="/admin" className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#071426]">Admin panel</Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Jami", items.length],
              ["Yangi", items.filter((item) => item.status === "new").length],
              ["Jarayonda", items.filter((item) => ["reviewing", "drafting", "needs_changes"].includes(item.status)).length],
              ["Nashr", items.filter((item) => item.status === "published").length],
            ].map(([label, count]) => (
              <div key={label} className="rounded-2xl bg-white/[.07] p-3 sm:p-4">
                <p className="text-[11px] font-bold text-white/45">{label}</p>
                <p className="mt-1 text-2xl font-black">{count}</p>
              </div>
            ))}
          </div>
        </header>

        {message ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="font-black">Yopish</button>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ism, Telegram, Instagram yoki javobdan qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 text-sm outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${statusFilter === "all" ? "bg-[#0043a4] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Hammasi
            </button>
            {STATUS_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${statusFilter === value ? "bg-[#0043a4] text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black tracking-[-0.02em] text-[#101828]">{item.full_name}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(item.created_at)} · {item.id.split("-")[0].toUpperCase()}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ${statusClass(item.status)}`}>
                  {STATUS_OPTIONS.find(([value]) => value === item.status)?.[1] || item.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <a href={`https://t.me/${item.telegram}`} target="_blank" className="rounded-xl bg-[#f5f8fc] p-3 font-extrabold text-[#0043a4]">@{item.telegram}</a>
                <a href={`https://instagram.com/${item.instagram}`} target="_blank" className="truncate rounded-xl bg-[#f5f8fc] p-3 font-extrabold text-[#a73382]">@{item.instagram}</a>
                <div className="rounded-xl bg-[#f5f8fc] p-3"><span className="font-black">15/15</span> <span className="text-xs font-semibold text-slate-400">javob</span></div>
                <div className="rounded-xl bg-[#f5f8fc] p-3"><span className="font-black">{item.files.length}</span> <span className="text-xs font-semibold text-slate-400">fayl</span></div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <select
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(event) => void updateStatus(item, event.target.value as SubmissionStatus)}
                  className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none"
                >
                  {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="min-h-12 rounded-xl bg-[#0043a4] px-5 text-sm font-black text-white"
                >
                  To‘liq ochish →
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-white p-12 text-center text-sm font-semibold text-slate-400 lg:col-span-2">Bu bo‘limda anketa yo‘q.</div>
          ) : null}
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#071426]/70 p-2 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label={`${selected.full_name} anketasi`}>
          <div className="mx-auto my-2 max-w-4xl overflow-hidden rounded-[26px] bg-white shadow-2xl sm:my-6">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-4 backdrop-blur sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0043a4]">Biografik anketa</p>
                <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.03em] text-[#101828]">{selected.full_name}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(selected.created_at)} · {selected.id.split("-")[0].toUpperCase()}</p>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600">×</button>
            </header>

            <div className="p-4 sm:p-6">
              <div className="grid gap-3 rounded-2xl bg-[#f5f8fc] p-4 sm:grid-cols-3">
                <a href={`https://t.me/${selected.telegram}`} target="_blank" className="font-extrabold text-[#0043a4]">Telegram: @{selected.telegram}</a>
                <a href={`https://instagram.com/${selected.instagram}`} target="_blank" className="font-extrabold text-[#a73382]">Instagram: @{selected.instagram}</a>
                <a href={selected.phone ? `tel:${selected.phone}` : undefined} className="font-extrabold text-[#101828]">Telefon: {selected.phone || "—"}</a>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => void copyAnswers(selected)} className="rounded-xl bg-[#0043a4] px-4 py-3 text-sm font-black text-white">📋 15 javobni nusxalash</button>
                {selected.files.map((file) => (
                  <button key={file.kind} type="button" onClick={() => void openFile(file)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">
                    {file.kind === "portrait" ? "🖼️ Asosiy rasm" : file.kind === "achievement" ? "🏅 Yutuq fayli" : "🧾 To‘lov cheki"} · {formatBytes(file.size)}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {BIOGRAPHY_QUESTIONS.map((question) => (
                  <section key={question.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <h3 className="text-sm font-black leading-5 text-[#101828]">{question.number}. {question.label}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">{selected.answers[question.id] || "—"}</p>
                  </section>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[220px_1fr]">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Holat</span>
                  <select
                    value={selected.status}
                    onChange={(event) => void updateStatus(selected, event.target.value as SubmissionStatus)}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
                  >
                    {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Admin izohi</span>
                  <textarea
                    key={`${selected.id}-${selected.admin_note || ""}`}
                    defaultValue={selected.admin_note || ""}
                    onBlur={(event) => void saveNote(selected, event.target.value)}
                    rows={3}
                    placeholder="Kamchilik, kelishuv yoki tahrir izohi..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0043a4]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
