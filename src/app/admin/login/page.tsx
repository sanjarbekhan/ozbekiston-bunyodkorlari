"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorText("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorText("Email yoki parol noto‘g‘ri.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-[#14231b]">
          Admin panel
        </h1>
        <p className="mb-8 text-gray-600">
          Maqolalarni boshqarish uchun tizimga kiring.
        </p>

        <label className="mb-2 block text-sm font-semibold">Email</label>
        <input
          type="email"
          className="mb-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@email.com"
          required
        />

        <label className="mb-2 block text-sm font-semibold">Parol</label>
        <input
          type="password"
          className="mb-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />

        {errorText && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0f3d2e] px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </main>
  );
}