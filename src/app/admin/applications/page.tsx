"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  full_name: string;
  phone: string;
  telegram: string | null;
  gender: string | null;
  age_group: string | null;
  promo_code: string | null;
  status: "new" | "reviewing" | "accepted" | "rejected";
  admin_note: string | null;
  created_at: string;
};

const statusOptions = [
  ["new", "Yangi"],
  ["reviewing", "Ko‘rib chiqilmoqda"],
  ["accepted", "Qabul qilindi"],
  ["rejected", "Rad etildi"],
] as const;

function statusLabel(status: Application["status"]) {
  return statusOptions.find(([value]) => value === status)?.[1] || status;
}

function statusClass(status: Application["status"]) {
  if (status === "new") return "bg-blue-50 text-blue-700";
  if (status === "reviewing") return "bg-amber-50 text-amber-700";
  if (status === "accepted") return "bg-emerald-50 text-emerald-700";
  return "bg-red-50 text-red-700";
}

export default function ApplicationsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("id, full_name, phone, telegram, gender, age_group, promo_code, status, admin_note, created_at")
        .order("created_at", { ascending: false });

      if (error) setMessage("Arizalarni yuklab bo‘lmadi: " + error.message);
      if (data) setItems(data as Application[]);
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return items.filter((item) => {
      const haystack = [item.full_name, item.phone, item.telegram || "", item.promo_code || ""]
        .join(" ")
        .toLocaleLowerCase("uz");
      return (!query || haystack.includes(query)) && (filter === "all" || item.status === filter);
    });
  }, [items, search, filter]);

  const newCount = items.filter((item) => item.status === "new").length;

  function patchLocal(id: string, values: Partial<Application>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
  }

  async function save(item: Application) {
    setSavingId(item.id);
    setMessage("");
    const { error } = await supabase
      .from("applications")
      .update({ status: item.status, admin_note: item.admin_note || null })
      .eq("id", item.id);
    setSavingId(null);
    if (error) {
      setMessage("Saqlashda xatolik: " + error.message);
      return;
    }
    setMessage("O‘zgarishlar saqlandi.");
  }

  async function remove(item: Application) {
    if (!confirm(`${item.full_name} arizasi o‘chirilsinmi?`)) return;
    setSavingId(item.id);
    const { error } = await supabase.from("applications").delete().eq("id", item.id);
    setSavingId(null);
    if (error) {
      setMessage("O‘chirishda xatolik: " + error.message);
      return;
    }
    setItems((current) => current.filter((row) => row.id !== item.id));
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f4f7fb] p-5"><p className="font-bold">Arizalar yuklanmoqda...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-12 text-[#111827]">
      <section className="mx-auto max-w-5xl px-3 py-4 sm:px-5 md:py-8">
        <header className="rounded-[28px] bg-[#071426] p-5 text-white shadow-xl sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">O‘zBYE boshqaruv</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Arizalar</h1>
              <p className="mt-2 text-sm font-medium text-white/60">Saytdagi web-formadan kelgan arizalar.</p>
            </div>
            <Link href="/admin" className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-white/20">← Admin</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/8 p-4"><p className="text-xs font-bold text-white/50">Jami ariza</p><p className="mt-1 text-2xl font-black">{items.length}</p></div>
            <div className="rounded-2xl bg-white/8 p-4"><p className="text-xs font-bold text-white/50">Yangi</p><p className="mt-1 text-2xl font-black">{newCount}</p></div>
          </div>
        </header>

        {message && <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold shadow-sm">{message}</div>}

        <div className="mt-4 rounded-[24px] bg-white p-3 shadow-[0_8px_26px_rgba(15,23,42,.05)] sm:p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ism, telefon yoki Telegram bo‘yicha qidirish..."
            className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 outline-none focus:border-[#0043a4]"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {([['all', 'Hammasi'], ...statusOptions] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold ${filter === value ? "bg-[#0043a4] text-white" : "bg-[#eef3fb] text-slate-600"}`}
              >{label}</button>
            ))}
          </div>
        </div>

        <p className="mt-4 px-1 text-sm font-semibold text-slate-500"><b className="text-[#111827]">{filtered.length}</b> ta ariza</p>

        <div className="mt-3 space-y-3">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{item.full_name}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{new Date(item.created_at).toLocaleString("uz-UZ")}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <a href={`tel:${item.phone}`} className="rounded-2xl bg-[#f8fafc] p-3"><span className="block text-[11px] font-bold text-slate-400">Telefon</span><span className="mt-1 block font-extrabold text-[#0043a4]">{item.phone}</span></a>
                <div className="rounded-2xl bg-[#f8fafc] p-3"><span className="block text-[11px] font-bold text-slate-400">Telegram</span><span className="mt-1 block font-extrabold">{item.telegram || "—"}</span></div>
                <div className="rounded-2xl bg-[#f8fafc] p-3"><span className="block text-[11px] font-bold text-slate-400">Jins / yosh</span><span className="mt-1 block font-extrabold">{[item.gender, item.age_group ? `${item.age_group} yosh` : null].filter(Boolean).join(" · ") || "—"}</span></div>
                {item.promo_code && <div className="rounded-2xl bg-[#f8fafc] p-3 sm:col-span-2 lg:col-span-3"><span className="block text-[11px] font-bold text-slate-400">Promokod</span><span className="mt-1 block font-extrabold">{item.promo_code}</span></div>}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
                <label className="text-sm font-extrabold">Holati
                  <select value={item.status} onChange={(event) => patchLocal(item.id, { status: event.target.value as Application["status"] })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3.5 font-semibold">
                    {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-extrabold">Admin izohi
                  <textarea value={item.admin_note || ""} onChange={(event) => patchLocal(item.id, { admin_note: event.target.value })} placeholder="Masalan: 9-avgust kuni bog‘lanildi..." className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3.5 font-medium outline-none focus:border-[#0043a4]" />
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => save(item)} disabled={savingId === item.id} className="min-h-11 flex-1 rounded-xl bg-[#0043a4] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50">{savingId === item.id ? "Saqlanmoqda..." : "Saqlash"}</button>
                <button onClick={() => remove(item)} disabled={savingId === item.id} className="min-h-11 rounded-xl bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 disabled:opacity-50">O‘chirish</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="rounded-[24px] bg-white p-10 text-center text-sm font-semibold text-slate-500">Ariza topilmadi.</div>}
        </div>
      </section>
    </main>
  );
}
