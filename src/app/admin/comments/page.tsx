"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CommentStatus = "pending" | "approved" | "rejected";

type CommentRow = {
  id: string;
  article_id: string;
  author_name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  moderated_at: string | null;
  article: { title: string; slug: string } | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CommentsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }
      setUserId(sessionData.session.user.id);

      const { data, error } = await supabase
        .from("article_comments")
        .select("id, article_id, author_name, body, status, created_at, moderated_at, article:articles(title, slug)")
        .order("created_at", { ascending: false });

      if (error) setMessage("Kommentariyalarni yuklab bo‘lmadi: " + error.message);
      if (data) setItems(data as unknown as CommentRow[]);
      setLoading(false);
    }
    void load();
  }, [router]);

  const counts = {
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return items.filter((item) => {
      const matchesTab = tab === "all" || item.status === tab;
      const haystack = `${item.author_name} ${item.body} ${item.article?.title || ""}`.toLocaleLowerCase("uz");
      return matchesTab && (!query || haystack.includes(query));
    });
  }, [items, search, tab]);

  async function setStatus(id: string, status: CommentStatus) {
    if (busyId) return;
    setBusyId(id);
    setMessage("");
    const old = items.find((item) => item.id === id);
    setItems((current) => current.map((item) => item.id === id ? { ...item, status, moderated_at: new Date().toISOString() } : item));

    const { error } = await supabase
      .from("article_comments")
      .update({ status, moderated_at: new Date().toISOString(), moderated_by: userId || null })
      .eq("id", id);

    if (error && old) {
      setItems((current) => current.map((item) => item.id === id ? old : item));
      setMessage("Holatni saqlashda xatolik: " + error.message);
    }
    setBusyId(null);
  }

  async function remove(id: string) {
    if (busyId || !window.confirm("Bu kommentariyani butunlay o‘chirasizmi?")) return;
    setBusyId(id);
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    const { error } = await supabase.from("article_comments").delete().eq("id", id);
    if (error) {
      setItems(previous);
      setMessage("Kommentariyani o‘chirishda xatolik: " + error.message);
    }
    setBusyId(null);
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f3f4f6] p-5"><p className="font-bold">Kommentariyalar yuklanmoqda...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] pb-12 text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0043a4]">O‘zBYE boshqaruv</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.03em]">Kommentariyalar</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/applications" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold">Arizalar</Link>
            <Link href="/admin" className="rounded-xl bg-[#071426] px-4 py-2.5 text-sm font-extrabold text-white">← Admin panel</Link>
          </div>
        </div>

        {message && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</div>}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["pending", `Kutilmoqda ${counts.pending}`],
                ["approved", `Tasdiqlangan ${counts.approved}`],
                ["rejected", `Rad etilgan ${counts.rejected}`],
                ["all", `Barchasi ${items.length}`],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${tab === value ? "bg-[#0043a4] text-white" : "bg-[#f4f7fb] text-slate-600 hover:bg-[#eaf2ff]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ism, maqola yoki matn bo‘yicha qidirish..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0043a4] lg:max-w-sm"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${item.status === "approved" ? "bg-emerald-50 text-emerald-700" : item.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                      {item.status === "approved" ? "Tasdiqlangan" : item.status === "rejected" ? "Rad etilgan" : "Tekshiruvda"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-black">{item.author_name}</h2>
                  {item.article ? (
                    <Link href={`/bunyodkorlar/${item.article.slug}`} target="_blank" className="mt-1 inline-block truncate text-sm font-bold text-[#0043a4] hover:underline">
                      {item.article.title} ↗
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-400">Maqola topilmadi</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busyId === item.id} onClick={() => void setStatus(item.id, "approved")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">Tasdiqlash</button>
                  <button type="button" disabled={busyId === item.id} onClick={() => void setStatus(item.id, "rejected")} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">Rad etish</button>
                  <button type="button" disabled={busyId === item.id} onClick={() => void remove(item.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600 disabled:opacity-50">O‘chirish</button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#f7f9fc] px-4 py-4 text-sm font-medium leading-6 text-slate-700">{item.body}</p>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-bold text-slate-400">
              Bu bo‘limda kommentariya yo‘q.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
