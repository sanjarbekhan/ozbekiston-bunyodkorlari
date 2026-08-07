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
  ip_address: string | null;
  contacted: boolean;
  contacted_at: string | null;
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

function formatDate(value: string | null) {
  if (!value) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}

export default function ApplicationsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"inbox" | "contacted">("inbox");
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
        .select("id, full_name, phone, telegram, gender, age_group, promo_code, ip_address, contacted, contacted_at, status, admin_note, created_at")
        .order("created_at", { ascending: false });

      if (error) setMessage("Arizalarni yuklab bo‘lmadi: " + error.message);
      if (data) setItems(data as Application[]);
      setLoading(false);
    }
    load();
  }, [router]);

  const inboxCount = items.filter((item) => !item.contacted).length;
  const contactedCount = items.filter((item) => item.contacted).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return items.filter((item) => {
      const haystack = [
        item.full_name,
        item.phone,
        item.telegram || "",
        item.promo_code || "",
        item.ip_address || "",
      ].join(" ").toLocaleLowerCase("uz");
      const matchesTab = tab === "inbox" ? !item.contacted : item.contacted;
      return matchesTab && (!query || haystack.includes(query));
    });
  }, [items, search, tab]);

  function patchLocal(id: string, values: Partial<Application>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
  }

  async function toggleContacted(item: Application) {
    if (savingId) return;
    const next = !item.contacted;
    const contactedAt = next ? new Date().toISOString() : null;
    setSavingId(item.id);
    patchLocal(item.id, { contacted: next, contacted_at: contactedAt });

    const { error } = await supabase
      .from("applications")
      .update({ contacted: next, contacted_at: contactedAt })
      .eq("id", item.id);

    setSavingId(null);
    if (error) {
      patchLocal(item.id, { contacted: item.contacted, contacted_at: item.contacted_at });
      setMessage("Yulduzchani saqlashda xatolik: " + error.message);
    }
  }

  async function updateStatus(id: string, status: Application["status"]) {
    const old = items.find((item) => item.id === id)?.status;
    patchLocal(id, { status });
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error && old) {
      patchLocal(id, { status: old });
      setMessage("Holatni saqlashda xatolik: " + error.message);
    }
  }

  async function saveNote(item: Application, note: string) {
    patchLocal(item.id, { admin_note: note });
    const { error } = await supabase
      .from("applications")
      .update({ admin_note: note.trim() || null })
      .eq("id", item.id);
    if (error) setMessage("Izohni saqlashda xatolik: " + error.message);
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f3f4f6] p-5"><p className="font-bold">Arizalar yuklanmoqda...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] pb-10 text-[#1f2937]">
      <section className="mx-auto max-w-[1900px] px-2 py-3 sm:px-4 md:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0043a4]">O‘zBYE boshqaruv</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Arizalar</h1>
          </div>
          <Link href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold shadow-sm">← Admin panel</Link>
        </div>

        {message && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</div>}

        <div className="overflow-hidden rounded-t-xl border border-b-0 border-slate-200 bg-[#f7f7f7]">
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`border-r border-slate-200 px-6 py-3 text-sm font-semibold ${tab === "inbox" ? "border-t-2 border-t-[#e86f4a] bg-white text-slate-900" : "text-slate-400"}`}
            >
              Inbox <span className="text-slate-400">{inboxCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("contacted")}
              className={`border-r border-slate-200 px-6 py-3 text-sm font-semibold ${tab === "contacted" ? "border-t-2 border-t-[#e86f4a] bg-white text-slate-900" : "text-slate-400"}`}
            >
              Bog‘langan <span className="text-slate-400">{contactedCount}</span>
            </button>
            <div className="ml-auto hidden p-2 sm:block">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Qidirish..."
                className="w-72 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0043a4]"
              />
            </div>
          </div>
        </div>

        <div className="border-x border-slate-200 bg-white p-2 sm:hidden">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ism, telefon, Telegram yoki IP..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0043a4]"
          />
        </div>

        <div className="hidden overflow-x-auto border border-slate-200 bg-white shadow-sm md:block">
          <table className="min-w-[1550px] w-full border-collapse text-left text-[13px]">
            <thead className="bg-[#fafafa] text-[11px] uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="w-14 border-b border-r border-slate-200 px-3 py-3 text-center">★</th>
                <th className="min-w-56 border-b border-r border-slate-200 px-4 py-3">Name</th>
                <th className="min-w-44 border-b border-r border-slate-200 px-4 py-3">Phone</th>
                <th className="min-w-44 border-b border-r border-slate-200 px-4 py-3">Date</th>
                <th className="min-w-52 border-b border-r border-slate-200 px-4 py-3">Telegram</th>
                <th className="min-w-28 border-b border-r border-slate-200 px-4 py-3">Jinsi</th>
                <th className="min-w-24 border-b border-r border-slate-200 px-4 py-3">Yosh</th>
                <th className="min-w-40 border-b border-r border-slate-200 px-4 py-3">IP manzil</th>
                <th className="min-w-40 border-b border-r border-slate-200 px-4 py-3">Promokod</th>
                <th className="min-w-48 border-b border-r border-slate-200 px-4 py-3">Holat</th>
                <th className="min-w-64 border-b border-slate-200 px-4 py-3">Admin izohi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={item.contacted ? "bg-[#fff8e8]" : "bg-white hover:bg-slate-50"}>
                  <td className="border-b border-r border-slate-200 px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleContacted(item)}
                      disabled={savingId === item.id}
                      title={item.contacted ? `Bog‘langan: ${formatDate(item.contacted_at)}` : "Bog‘landim deb belgilash"}
                      className={`text-xl leading-none transition ${item.contacted ? "text-[#e96f47]" : "text-slate-300 hover:text-[#e96f47]"}`}
                    >
                      ★
                    </button>
                  </td>
                  <td className="border-b border-r border-slate-200 px-4 py-3 font-semibold">{item.full_name}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3"><a href={`tel:${item.phone}`} className="text-[#0043a4] hover:underline">{item.phone}</a></td>
                  <td className="border-b border-r border-slate-200 px-4 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3">{item.telegram || "—"}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3">{item.gender || "—"}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3">{item.age_group || "—"}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3 font-mono text-[12px]">{item.ip_address || "—"}</td>
                  <td className="border-b border-r border-slate-200 px-4 py-3">{item.promo_code || "—"}</td>
                  <td className="border-b border-r border-slate-200 px-3 py-2">
                    <select
                      value={item.status}
                      onChange={(event) => updateStatus(item.id, event.target.value as Application["status"])}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none"
                    >
                      {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2">
                    <input
                      defaultValue={item.admin_note || ""}
                      onBlur={(event) => saveNote(item, event.target.value)}
                      placeholder="Izoh..."
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-2 text-xs outline-none focus:border-slate-200 focus:bg-white"
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="p-12 text-center text-sm font-semibold text-slate-400">Bu bo‘limda ariza yo‘q.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-slate-200 bg-white p-3 shadow-sm md:hidden">
          <div className="space-y-3">
            {filtered.map((item) => (
              <article key={item.id} className={`rounded-2xl border p-4 ${item.contacted ? "border-amber-200 bg-[#fff8e8]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black">{item.full_name}</h2>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleContacted(item)}
                    disabled={savingId === item.id}
                    className={`text-3xl leading-none ${item.contacted ? "text-[#e96f47]" : "text-slate-300"}`}
                    aria-label={item.contacted ? "Bog‘langan belgisini olib tashlash" : "Bog‘landim deb belgilash"}
                  >★</button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Phone</p><a href={`tel:${item.phone}`} className="mt-1 block font-bold text-[#0043a4]">{item.phone}</a></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Telegram</p><p className="mt-1 font-bold">{item.telegram || "—"}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Jinsi / yosh</p><p className="mt-1 font-bold">{[item.gender, item.age_group].filter(Boolean).join(" · ") || "—"}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">IP manzil</p><p className="mt-1 break-all font-mono text-xs">{item.ip_address || "—"}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Promokod</p><p className="mt-1 font-bold">{item.promo_code || "—"}</p></div>
                  {item.contacted && <div><p className="text-[10px] font-black uppercase text-slate-400">Bog‘langan vaqt</p><p className="mt-1 font-bold">{formatDate(item.contacted_at)}</p></div>}
                </div>

                <div className="mt-4 grid gap-2">
                  <select
                    value={item.status}
                    onChange={(event) => updateStatus(item.id, event.target.value as Application["status"])}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold"
                  >
                    {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <input
                    defaultValue={item.admin_note || ""}
                    onBlur={(event) => saveNote(item, event.target.value)}
                    placeholder="Admin izohi..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none"
                  />
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="p-10 text-center text-sm font-semibold text-slate-400">Bu bo‘limda ariza yo‘q.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
