"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "sanjarhasanov465@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErrorText(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    setLoading(false);
    if (error || data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut(); setErrorText("Parol noto‘g‘ri yoki bu hisobga ruxsat berilmagan."); return;
    }
    router.replace("/admin"); router.refresh();
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#eef3fb] px-4">
    <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[.22em] text-[#0043a4]">O‘zBYE CMS</p>
      <h1 className="mt-2 text-3xl font-black">Admin panel</h1>
      <p className="mt-3 text-gray-600">Maqola va media materiallarini boshqarish.</p>
      <label className="mt-7 block text-sm font-bold">Admin hisob</label>
      <input type="email" value={ADMIN_EMAIL} readOnly className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-600" />
      <label className="mt-4 block text-sm font-bold">Parol</label>
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoFocus className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#0043a4]" />
      {errorText && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorText}</p>}
      <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#0043a4] px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? "Kirilmoqda..." : "Kirish"}</button>
    </form>
  </main>;
}
