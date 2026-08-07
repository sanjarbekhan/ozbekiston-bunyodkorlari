"use client";

import { FormEvent, useState } from "react";

const initialForm = {
  full_name: "",
  phone: "",
  telegram: "",
  gender: "",
  age_group: "",
  promo_code: "",
  website: "",
};

export default function ApplicationForm() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function patch(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");

    if (form.website) {
      setDone(true);
      return;
    }

    if (form.full_name.trim().length < 2) {
      setError("Ism va familiyangizni kiriting.");
      return;
    }
    if (form.phone.trim().length < 5) {
      setError("Telefon raqamingizni kiriting.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setError("Arizani yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
        return;
      }

      setForm(initialForm);
      setDone(true);
    } catch {
      setError("Arizani yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[28px] border border-emerald-100 bg-white p-7 text-center shadow-[0_16px_50px_rgba(15,23,42,.08)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[#101828]">Arizangiz qabul qilindi</h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
          Ma’lumotlaringiz admin panelga yuborildi. Tez orada siz bilan bog‘lanamiz.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 rounded-2xl bg-[#0043a4] px-5 py-3 text-sm font-extrabold text-white"
        >
          Yana ariza yuborish
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,.08)] sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-extrabold text-[#101828]">Ism va familiya *</span>
          <input
            value={form.full_name}
            onChange={(event) => patch("full_name", event.target.value)}
            autoComplete="name"
            placeholder="To‘liq ism familiyangiz"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-extrabold text-[#101828]">Telefon raqam *</span>
          <input
            value={form.phone}
            onChange={(event) => patch("phone", event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
        </label>

        <label>
          <span className="text-sm font-extrabold text-[#101828]">Telegram</span>
          <input
            value={form.telegram}
            onChange={(event) => patch("telegram", event.target.value)}
            placeholder="@username yoki Telegram raqam"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="text-sm font-extrabold text-[#101828]">Jinsingiz</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["Erkak", "Ayol"].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => patch("gender", gender)}
                className={`rounded-2xl border px-4 py-3.5 text-sm font-extrabold transition ${form.gender === gender ? "border-[#0043a4] bg-[#0043a4] text-white" : "border-slate-200 bg-[#f8fafc] text-slate-600"}`}
              >
                {form.gender === gender ? "✓ " : ""}{gender}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          <span className="text-sm font-extrabold text-[#101828]">Yoshingiz</span>
          <input
            value={form.age_group}
            onChange={(event) => patch("age_group", event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            inputMode="numeric"
            placeholder="Masalan: 19"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-extrabold text-[#101828]">Promokod <span className="font-medium text-slate-400">(agar bo‘lsa)</span></span>
          <input
            value={form.promo_code}
            onChange={(event) => patch("promo_code", event.target.value)}
            placeholder="Promokod"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
          />
        </label>

        <label className="absolute left-[-9999px]" aria-hidden="true">
          Website
          <input value={form.website} onChange={(event) => patch("website", event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 min-h-14 w-full rounded-2xl bg-[#0043a4] px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#003785] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Yuborilmoqda..." : "Arizani yuborish"}
      </button>
      <p className="mt-3 text-center text-xs font-medium leading-5 text-slate-400">
        Arizani yuborish orqali siz bilan bog‘lanish uchun taqdim etgan ma’lumotlaringizdan foydalanishga va xavfsizlik maqsadida so‘rov IP manzili qayd etilishiga rozilik bildirasiz.
      </p>
    </form>
  );
}
