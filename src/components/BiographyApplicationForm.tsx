"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BIOGRAPHY_FILE_RULES,
  BIOGRAPHY_QUESTIONS,
  BiographyAnswers,
  BiographyFile,
  BiographyFileKind,
  EMPTY_BIOGRAPHY_ANSWERS,
  normalizeInstagram,
  normalizeTelegram,
  validateSelectedFile,
} from "@/lib/biography-application";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "ozbye-biography-draft-v1";
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const STEPS = [
  { title: "Aloqa", description: "Profil ma’lumotlari" },
  { title: "Asosiy ma’lumot", description: "1–5-savollar" },
  { title: "Faoliyat va qadriyat", description: "6–10-savollar" },
  { title: "Kelajak va iqtibos", description: "11–15-savollar" },
  { title: "Fayllar va tekshiruv", description: "Yakuniy bosqich" },
] as const;

type DraftState = {
  version: 1;
  submissionId: string;
  telegram: string;
  phone: string;
  instagram: string;
  answers: BiographyAnswers;
  step: number;
  savedAt: number;
};

type SelectedFiles = Record<BiographyFileKind, File | null>;

const EMPTY_FILES: SelectedFiles = {
  portrait: null,
  achievement: null,
  receipt: null,
};

function createSubmissionId() {
  return crypto.randomUUID();
}

function safeExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 8) return fromName;
  const byType: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return byType[file.type] || "bin";
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function FilePicker({
  kind,
  file,
  error,
  onChange,
}: {
  kind: BiographyFileKind;
  file: File | null;
  error?: string;
  onChange: (kind: BiographyFileKind, file: File | null) => void;
}) {
  const rule = BIOGRAPHY_FILE_RULES[kind];
  const accept = rule.mimeTypes.join(",");
  const inputId = `biography-file-${kind}`;

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    onChange(kind, event.target.files?.[0] || null);
    event.target.value = "";
  }

  return (
    <div className={`rounded-2xl border p-4 transition ${error ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={inputId} className="text-sm font-black text-[#101828]">
            {rule.label} {rule.required ? <span className="text-red-500">*</span> : null}
          </label>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
            {kind === "portrait"
              ? "To‘g‘riga qaragan, tiniq va imkon qadar rasmiy uslubdagi foto."
              : kind === "achievement"
                ? "Sertifikat, diplom yoki boshqa tasdiqlovchi hujjat."
                : "To‘lov qilgan bo‘lsangiz, chek rasmi yoki PDF fayli."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-black text-[#0043a4]">
          {Math.round(rule.maxBytes / 1024 / 1024)} MB
        </span>
      </div>

      {file ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f5f8fc] p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">
            {file.type.startsWith("image/") ? "🖼️" : "📄"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#101828]">{file.name}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(kind, null)}
            className="rounded-lg px-2 py-1 text-xs font-black text-red-500 transition hover:bg-red-50"
          >
            Olib tashlash
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="mt-3 flex min-h-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#0043a4]/40 bg-[#f7faff] px-4 text-center text-sm font-extrabold text-[#0043a4] transition hover:border-[#0043a4] hover:bg-[#eef4ff]"
        >
          + Fayl tanlash
        </label>
      )}

      <input id={inputId} type="file" accept={accept} onChange={handleFile} className="sr-only" />
      {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: (typeof BIOGRAPHY_QUESTIONS)[number];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`block rounded-2xl border bg-white p-4 transition sm:p-5 ${error ? "border-red-300" : "border-slate-200 focus-within:border-[#0f68ff] focus-within:shadow-[0_0_0_3px_rgba(15,104,255,.08)]"}`}>
      <span className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0043a4] text-sm font-black text-white">
          {question.number}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black leading-5 text-[#101828] sm:text-[15px]">{question.label}</span>
          <span className="mt-1 block text-xs font-medium leading-5 text-slate-400">{question.hint}</span>
        </span>
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, question.maxLength))}
        rows={question.number === 1 || question.number === 2 || question.number === 3 ? 3 : 5}
        aria-invalid={Boolean(error)}
        className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[15px] leading-6 outline-none transition focus:border-[#0f68ff] focus:bg-white"
        placeholder="Javobingizni yozing..."
      />
      <span className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={`font-bold ${error ? "text-red-600" : "text-slate-400"}`}>{error || "Batafsil va aniq yozish tavsiya etiladi."}</span>
        <span className="shrink-0 font-semibold text-slate-300">{value.length}/{question.maxLength}</span>
      </span>
    </label>
  );
}

export default function BiographyApplicationForm({ initialTelegram }: { initialTelegram: string }) {
  const [submissionId, setSubmissionId] = useState("");
  const [telegram, setTelegram] = useState(initialTelegram);
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [answers, setAnswers] = useState<BiographyAnswers>({ ...EMPTY_BIOGRAPHY_ANSWERS });
  const [files, setFiles] = useState<SelectedFiles>(EMPTY_FILES);
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Qoralama tayyor");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [reference, setReference] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      let restoredDraft: DraftState | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const candidate = JSON.parse(raw) as Partial<DraftState>;
          if (
            candidate.version === 1
            && typeof candidate.savedAt === "number"
            && Date.now() - candidate.savedAt < DRAFT_TTL_MS
            && typeof candidate.submissionId === "string"
            && candidate.answers
          ) {
            restoredDraft = candidate as DraftState;
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (restoredDraft) {
        setSubmissionId(restoredDraft.submissionId);
        setTelegram(initialTelegram || restoredDraft.telegram || "");
        setPhone(restoredDraft.phone || "");
        setInstagram(restoredDraft.instagram || "");
        setAnswers({ ...EMPTY_BIOGRAPHY_ANSWERS, ...restoredDraft.answers });
        setStep(Math.min(Math.max(restoredDraft.step || 0, 0), STEPS.length - 1));
        setRestored(true);
      } else {
        setSubmissionId(createSubmissionId());
        setTelegram(initialTelegram);
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(initialize);
  }, [initialTelegram]);

  useEffect(() => {
    if (!hydrated || reference || !submissionId) return;
    const timeout = window.setTimeout(() => {
      const draft: DraftState = {
        version: 1,
        submissionId,
        telegram,
        phone,
        instagram,
        answers,
        step,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaveLabel("Qoralama saqlandi");
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [answers, hydrated, instagram, phone, reference, step, submissionId, telegram]);

  const stepQuestions = useMemo(() => {
    if (step === 1) return BIOGRAPHY_QUESTIONS.slice(0, 5);
    if (step === 2) return BIOGRAPHY_QUESTIONS.slice(5, 10);
    if (step === 3) return BIOGRAPHY_QUESTIONS.slice(10, 15);
    return [];
  }, [step]);

  const completedAnswers = BIOGRAPHY_QUESTIONS.filter((question) => answers[question.id].trim().length >= 2).length;
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  function patchAnswer(id: keyof BiographyAnswers, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function selectFile(kind: BiographyFileKind, file: File | null) {
    if (file) {
      const error = validateSelectedFile(kind, file);
      if (error) {
        setErrors((current) => ({ ...current, [kind]: error }));
        return;
      }
    }
    setFiles((current) => ({ ...current, [kind]: file }));
    setErrors((current) => {
      const next = { ...current };
      delete next[kind];
      return next;
    });
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      const cleanTelegram = normalizeTelegram(telegram);
      const cleanInstagram = normalizeInstagram(instagram);
      if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(cleanTelegram)) {
        nextErrors.telegram = "Telegram username’ni to‘liq kiriting. Masalan: @username";
      }
      if (phone && phone.replace(/\D/g, "").length < 7) {
        nextErrors.phone = "Telefon raqamini to‘liq kiriting yoki bo‘sh qoldiring.";
      }
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanInstagram)) {
        nextErrors.instagram = "Instagram username’ni kiriting.";
      }
    }

    for (const question of stepQuestions) {
      if (answers[question.id].trim().length < 2) {
        nextErrors[question.id] = `${question.number}-savolga javob yozing.`;
      }
    }

    if (step === 4) {
      for (const question of BIOGRAPHY_QUESTIONS) {
        if (answers[question.id].trim().length < 2) {
          nextErrors[question.id] = `${question.number}-savol javobsiz qolgan.`;
        }
      }
      if (!files.portrait) nextErrors.portrait = "Maqola uchun asosiy rasm majburiy.";
      if (!consent) nextErrors.consent = "Ma’lumotlarni qayta ishlash va nashrga tayyorlashga rozilik bildiring.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function uploadFile(kind: BiographyFileKind, file: File) {
    const path = `applications/biographies/${submissionId}/${kind}-${crypto.randomUUID()}.${safeExtension(file)}`;
    const { error } = await supabase.storage.from("application-files").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(`${BIOGRAPHY_FILE_RULES[kind].label} yuklanmadi: ${error.message}`);
    return { kind, path, name: file.name, mime: file.type, size: file.size } satisfies BiographyFile;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || step !== STEPS.length - 1 || !validateCurrentStep()) return;
    if (website) {
      setReference("QABUL");
      return;
    }

    setBusy(true);
    setBusyLabel("Fayllar tekshirilmoqda...");
    setErrors({});

    try {
      const uploads = (Object.entries(files) as [BiographyFileKind, File | null][])
        .filter((entry): entry is [BiographyFileKind, File] => Boolean(entry[1]));

      const uploadedFiles: BiographyFile[] = [];
      for (const [kind, file] of uploads) {
        setBusyLabel(`${BIOGRAPHY_FILE_RULES[kind].label} yuklanmoqda...`);
        uploadedFiles.push(await uploadFile(kind, file));
      }

      setBusyLabel("Anketa saqlanmoqda...");
      const response = await fetch("/api/biography-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          telegram,
          phone,
          instagram,
          answers,
          files: uploadedFiles,
          website,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Anketani yuborib bo‘lmadi.");

      localStorage.removeItem(STORAGE_KEY);
      setReference(result.reference || submissionId.split("-")[0].toUpperCase());
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Anketani yuborishda xatolik yuz berdi." });
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  }

  if (!hydrated) {
    return (
      <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,.08)]">
        <div className="h-2 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 h-10 w-3/4 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (reference) {
    return (
      <section className="rounded-[30px] border border-emerald-100 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,.08)] sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl text-emerald-600" aria-hidden="true">✓</div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Muvaffaqiyatli yuborildi</p>
        <h2 className="mx-auto mt-3 max-w-lg text-3xl font-black tracking-[-0.04em] text-[#101828]">Anketangiz tahririyatga yetib bordi</h2>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-slate-500">
          Javoblar va fayllar tekshiriladi. Zarur bo‘lsa, siz bilan Telegram orqali bog‘lanamiz.
        </p>
        <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-[#f5f8fc] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Murojaat raqami</p>
          <p className="mt-1 font-mono text-xl font-black tracking-[0.1em] text-[#0043a4]">{reference}</p>
        </div>
        <a
          href="https://t.me/bunyodkor_cv"
          className="mt-7 inline-flex min-h-13 items-center justify-center rounded-2xl bg-[#0043a4] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#003681]"
        >
          Telegram sahifamizga qaytish
        </a>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,.08)]">
      <div ref={formTopRef} className="scroll-mt-4 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[#0f68ff]">{step + 1}/{STEPS.length}-bosqich</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#101828]">{STEPS[step].title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-400">{STEPS[step].description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-extrabold text-slate-400">{completedAnswers}/15 javob</p>
            <p className="mt-1 text-[11px] font-bold text-emerald-600">✓ {saveLabel}</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`${progress}% bajarildi`}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#0043a4] to-[#2d7dff] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 hidden grid-cols-5 gap-2 sm:grid">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                if (index <= step) {
                  setStep(index);
                  setErrors({});
                }
              }}
              className={`rounded-xl px-2 py-2 text-[11px] font-extrabold transition ${index === step ? "bg-[#0043a4] text-white" : index < step ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}
            >
              {index < step ? "✓ " : ""}{index + 1}. {item.title}
            </button>
          ))}
        </div>
      </div>

      {restored ? (
        <div className="mx-5 mt-5 flex items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-blue-800 sm:mx-7">
          <span>Oldingi qoralamangiz tiklandi. Foto va boshqa fayllarni qayta tanlang.</span>
          <button type="button" onClick={() => setRestored(false)} className="shrink-0 font-black">Yopish</button>
        </div>
      ) : null}

      <div className="p-5 sm:p-7">
        {step === 0 ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#f5f8fc] p-4 text-sm font-semibold leading-6 text-slate-600">
              Tahririyat savol tug‘ilganda siz bilan bog‘lana olishi uchun faol Telegram va Instagram profilingizni yozing.
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#101828]">Telegram username <span className="text-red-500">*</span></span>
              <div className={`mt-2 flex overflow-hidden rounded-2xl border bg-[#f8fafc] focus-within:border-[#0f68ff] focus-within:bg-white ${errors.telegram ? "border-red-300" : "border-slate-200"}`}>
                <span className="flex items-center border-r border-slate-200 px-4 font-black text-slate-400">@</span>
                <input
                  value={telegram.replace(/^@/, "")}
                  onChange={(event) => setTelegram(event.target.value.replace(/\s/g, ""))}
                  autoComplete="username"
                  placeholder="username"
                  aria-invalid={Boolean(errors.telegram)}
                  className="min-h-14 min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base outline-none"
                />
              </div>
              {errors.telegram ? <p className="mt-2 text-xs font-bold text-red-600">{errors.telegram}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#101828]">Telefon raqam <span className="font-semibold text-slate-400">(ixtiyoriy)</span></span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value.slice(0, 40))}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                aria-invalid={Boolean(errors.phone)}
                className={`mt-2 min-h-14 w-full rounded-2xl border bg-[#f8fafc] px-4 py-3.5 text-base outline-none transition focus:border-[#0f68ff] focus:bg-white ${errors.phone ? "border-red-300" : "border-slate-200"}`}
              />
              {errors.phone ? <p className="mt-2 text-xs font-bold text-red-600">{errors.phone}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#101828]">Instagram username <span className="text-red-500">*</span></span>
              <div className={`mt-2 flex overflow-hidden rounded-2xl border bg-[#f8fafc] focus-within:border-[#0f68ff] focus-within:bg-white ${errors.instagram ? "border-red-300" : "border-slate-200"}`}>
                <span className="flex items-center border-r border-slate-200 px-4 font-black text-slate-400">@</span>
                <input
                  value={instagram.replace(/^@/, "")}
                  onChange={(event) => setInstagram(event.target.value.replace(/\s/g, ""))}
                  autoComplete="username"
                  placeholder="instagram_username"
                  aria-invalid={Boolean(errors.instagram)}
                  className="min-h-14 min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base outline-none"
                />
              </div>
              {errors.instagram ? <p className="mt-2 text-xs font-bold text-red-600">{errors.instagram}</p> : null}
            </label>

            <label className="absolute left-[-9999px]" aria-hidden="true">
              Website
              <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        ) : null}

        {stepQuestions.length > 0 ? (
          <div className="space-y-4">
            {stepQuestions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                error={errors[question.id]}
                onChange={(value) => patchAnswer(question.id, value)}
              />
            ))}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-black tracking-[-0.02em] text-[#101828]">Kerakli fayllar</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-400">Fayllar qoralamada saqlanmaydi. Sahifani yopishdan oldin anketani yuboring.</p>
            </div>
            <div className="grid gap-3">
              {(Object.keys(BIOGRAPHY_FILE_RULES) as BiographyFileKind[]).map((kind) => (
                <FilePicker key={kind} kind={kind} file={files[kind]} error={errors[kind]} onChange={selectFile} />
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-[#101828]">Yakuniy tekshiruv</h3>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-black text-[#0043a4]">Javoblarni tahrirlash</button>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">F.I.Sh.</p>
                  <p className="mt-1 line-clamp-2 font-extrabold text-[#101828]">{answers.q1 || "Kiritilmagan"}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Aloqa</p>
                  <p className="mt-1 font-extrabold text-[#101828]">@{normalizeTelegram(telegram)} · @{normalizeInstagram(instagram)}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Javoblar</p>
                  <p className="mt-1 font-extrabold text-[#101828]">{completedAnswers}/15 ta to‘ldirilgan</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Fayllar</p>
                  <p className="mt-1 font-extrabold text-[#101828]">{Object.values(files).filter(Boolean).length} ta tanlangan</p>
                </div>
              </div>
            </div>

            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.consent ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  if (event.target.checked) setErrors((current) => ({ ...current, consent: "" }));
                }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#0043a4]"
              />
              <span className="text-xs font-semibold leading-5 text-slate-600">
                Kiritgan ma’lumotlarim to‘g‘riligini tasdiqlayman hamda ularni biografik maqolani tayyorlash, tahrirlash va kelishilganidan so‘ng nashr qilish uchun qayta ishlashga roziman. <a href="/ommaviy_ofertasi" target="_blank" className="font-black text-[#0043a4] underline decoration-blue-200 underline-offset-2">Ommaviy oferta</a>
              </span>
            </label>
            {errors.consent ? <p className="text-xs font-bold text-red-600">{errors.consent}</p> : null}
          </div>
        ) : null}

        {errors.submit ? (
          <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
            {errors.submit}
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={busy}
            className="min-h-13 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            ← Orqaga
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="min-h-13 flex-1 rounded-2xl bg-[#0043a4] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#003681]"
          >
            Davom etish →
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy}
            className="min-h-13 flex-1 rounded-2xl bg-[#0043a4] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#003681] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? busyLabel || "Yuborilmoqda..." : "Anketani yuborish ✓"}
          </button>
        )}
      </div>
    </form>
  );
}
