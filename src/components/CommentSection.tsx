"use client";

import { FormEvent, useState } from "react";

type PublicComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: PublicComment[];
}) {
  const [comments, setComments] = useState<PublicComment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    setError("");

    if (authorName.trim().length < 2) {
      setError("Ismingizni kiriting.");
      return;
    }
    if (body.trim().length < 2) {
      setError("Kommentariyangizni yozing.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          authorName,
          body,
          website,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Kommentariyani yuborib bo‘lmadi.");

      if (result?.comment?.id) {
        setComments((current) => [result.comment as PublicComment, ...current]);
      }
      setAuthorName("");
      setBody("");
      setWebsite("");
      setMessage(
        result?.moderationMode === "fallback"
          ? "Kommentariyangiz tekshirildi va e’lon qilindi. AI tekshiruvi vaqtincha cheklangan."
          : "Kommentariyangiz tekshirildi va e’lon qilindi.",
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Kommentariyani yuborishda xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)] sm:p-8 md:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0043a4]">Fikrlar</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-[#111827]">
            Kommentariyalar
          </h2>
        </div>
        <span className="text-sm font-bold text-slate-400">{comments.length} ta fikr</span>
      </div>

      {comments.length > 0 ? (
        <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
          {comments.map((comment) => (
            <article key={comment.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold text-[#111827]">{comment.author_name}</p>
                <time className="text-xs font-semibold text-slate-400">{formatDate(comment.created_at)}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600 sm:text-[15px]">
                {comment.body}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl bg-[#f7f9fc] px-5 py-6 text-sm font-semibold leading-6 text-slate-500">
          Hozircha kommentariya yo‘q. Birinchi bo‘lib fikr qoldirishingiz mumkin.
        </div>
      )}

      <form onSubmit={submit} className="mt-8 rounded-[22px] bg-[#f7f9fc] p-4 sm:p-6">
        <h3 className="text-lg font-extrabold text-[#111827]">Fikringizni qoldiring</h3>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
          Kommentariya Bunyodkor AI tomonidan avtomatik tekshiriladi. Haqorat, so‘kinish, tahdid va spam e’lon qilinmaydi.
        </p>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-sm font-extrabold text-[#111827]">Ismingiz</span>
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value.slice(0, 80))}
              placeholder="Ism yoki ism-familiya"
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0043a4] focus:ring-4 focus:ring-[#0043a4]/5"
            />
          </label>

          <label>
            <span className="text-sm font-extrabold text-[#111827]">Kommentariya</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value.slice(0, 1200))}
              rows={5}
              placeholder="Maqola haqida fikringizni yozing..."
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-[#0043a4] focus:ring-4 focus:ring-[#0043a4]/5"
            />
            <span className="mt-1 block text-right text-[11px] font-semibold text-slate-300">{body.length}/1200</span>
          </label>

          <label className="absolute left-[-9999px]" aria-hidden="true">
            Website
            <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-full bg-[#0043a4] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#003681] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Tekshirilmoqda..." : "Kommentariyani yuborish"}
        </button>
      </form>
    </section>
  );
}
