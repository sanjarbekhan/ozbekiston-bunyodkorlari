export const BIOGRAPHY_QUESTIONS = [
  {
    id: "q1",
    number: 1,
    label: "To‘liq ismingiz va familiyangiz?",
    hint: "Maqolada qanday yozilishini istasangiz, aynan shunday kiriting.",
    maxLength: 180,
  },
  {
    id: "q2",
    number: 2,
    label: "Tug‘ilgan yilingiz, kuni va joyingiz?",
    hint: "Masalan: 2004-yil 15-mart, Samarqand viloyati.",
    maxLength: 500,
  },
  {
    id: "q3",
    number: 3,
    label: "Hozirgi yashash joyingiz (viloyat/tuman/shahar)?",
    hint: "Aniq uy manzilini yozish shart emas.",
    maxLength: 500,
  },
  {
    id: "q4",
    number: 4,
    label: "Ta’lim darajangiz va o‘qigan o‘quv yurtlaringiz?",
    hint: "Ta’lim muassasasi, yo‘nalish, kurs va muhim qo‘shimcha ta’limlarni kiriting.",
    maxLength: 2_500,
  },
  {
    id: "q5",
    number: 5,
    label: "Qaysi sohada faoliyat yuritasiz yoki o‘qiyapsiz?",
    hint: "Asosiy sohangiz va hozirgi rolingizni yozing.",
    maxLength: 1_500,
  },
  {
    id: "q6",
    number: 6,
    label: "Faoliyatingizni qachondan va qanday boshlagansiz?",
    hint: "Boshlanish nuqtasi va ilk qadamingiz haqida yozing.",
    maxLength: 3_000,
  },
  {
    id: "q7",
    number: 7,
    label: "Erishgan muhim yutuqlaringiz (tanlovlar, sertifikatlar, loyihalar, mukofotlar)?",
    hint: "Muhimlarini yil va natijasi bilan sanab o‘ting.",
    maxLength: 4_000,
  },
  {
    id: "q8",
    number: 8,
    label: "Hayotingizda sizga ta’sir qilgan biror shaxs yoki voqea bormi?",
    hint: "Bu ta’sir sizni qanday o‘zgartirganini ham tushuntiring.",
    maxLength: 4_000,
  },
  {
    id: "q9",
    number: 9,
    label: "Sizni ilhomlantiradigan shior yoki hayotiy prinsipingiz qanday?",
    hint: "Shiorni qo‘shtirnoq ichida, izohini esa keyin yozishingiz mumkin.",
    maxLength: 2_500,
  },
  {
    id: "q10",
    number: 10,
    label: "Bo‘sh vaqtingizda nima bilan shug‘ullanasiz?",
    hint: "Qiziqishlaringiz va odatiy mashg‘ulotlaringizni yozing.",
    maxLength: 2_500,
  },
  {
    id: "q11",
    number: 11,
    label: "Sizningcha, yetakchi jamoani qanday boshqarishi kerak?",
    hint: "Shaxsiy qarashingizni bir-ikki misol bilan ochib bering.",
    maxLength: 3_000,
  },
  {
    id: "q12",
    number: 12,
    label: "Kelajakdagi rejalaringiz va orzu-maqsadlaringiz nimalardan iborat?",
    hint: "Yaqin va uzoq muddatli maqsadlaringizni yozing.",
    maxLength: 3_000,
  },
  {
    id: "q13",
    number: 13,
    label: "Sizdan boshqalar nimani o‘rganishlari mumkin deb o‘ylaysiz?",
    hint: "Tajriba, ko‘nikma yoki hayotiy saboq bo‘lishi mumkin.",
    maxLength: 3_000,
  },
  {
    id: "q14",
    number: 14,
    label: "O‘zingiz haqingizda yana qanday qiziqarli yoki muhim ma’lumot bo‘lishi mumkin?",
    hint: "Oldingi javoblarda aytilmagan muhim jihatlarni yozing.",
    maxLength: 3_000,
  },
  {
    id: "q15",
    number: 15,
    label: "Boshqa yoshlar uchun qanday maslahat yoki motivatsion fikr bildirasiz?",
    hint: "Bu javob maqoladagi iqtibos uchun ishlatilishi mumkin.",
    maxLength: 4_000,
  },
] as const;

export type BiographyQuestionId = (typeof BIOGRAPHY_QUESTIONS)[number]["id"];
export type BiographyAnswers = Record<BiographyQuestionId, string>;
export type BiographyFileKind = "portrait" | "achievement" | "receipt";

export type BiographyFile = {
  kind: BiographyFileKind;
  path: string;
  name: string;
  mime: string;
  size: number;
};

export type BiographySubmissionInput = {
  submission_id: string;
  telegram: string;
  phone: string;
  instagram: string;
  answers: BiographyAnswers;
  files: BiographyFile[];
};

export const EMPTY_BIOGRAPHY_ANSWERS = Object.fromEntries(
  BIOGRAPHY_QUESTIONS.map((question) => [question.id, ""]),
) as BiographyAnswers;

export const BIOGRAPHY_FILE_RULES: Record<
  BiographyFileKind,
  { label: string; required: boolean; maxBytes: number; mimeTypes: readonly string[] }
> = {
  portrait: {
    label: "Maqola uchun asosiy rasm",
    required: true,
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  achievement: {
    label: "Yutuqlarni tasdiqlovchi fayl",
    required: false,
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
  receipt: {
    label: "To‘lov cheki",
    required: false,
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  },
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TELEGRAM_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
const INSTAGRAM_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeTelegram(value: unknown) {
  return cleanText(value, 100)
    .replace(/^https?:\/\/(?:www\.)?t\.me\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
}

export function normalizeInstagram(value: unknown) {
  return cleanText(value, 120)
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
}

export function validateSelectedFile(kind: BiographyFileKind, file: File) {
  const rule = BIOGRAPHY_FILE_RULES[kind];
  if (!rule.mimeTypes.includes(file.type)) {
    return `${rule.label} formati qo‘llab-quvvatlanmaydi.`;
  }
  if (file.size <= 0 || file.size > rule.maxBytes) {
    return `${rule.label} hajmi ${Math.round(rule.maxBytes / 1024 / 1024)} MB dan oshmasligi kerak.`;
  }
  return "";
}

function isBiographyFile(value: unknown): value is BiographyFile {
  if (!value || typeof value !== "object") return false;
  const file = value as Partial<BiographyFile>;
  return (
    (file.kind === "portrait" || file.kind === "achievement" || file.kind === "receipt") &&
    typeof file.path === "string" &&
    typeof file.name === "string" &&
    typeof file.mime === "string" &&
    typeof file.size === "number"
  );
}

export function validateBiographySubmission(
  input: unknown,
): { data: BiographySubmissionInput; error: "" } | { data: null; error: string } {
  if (!input || typeof input !== "object") {
    return { data: null, error: "Yuborilgan ma’lumotlar noto‘g‘ri." };
  }

  const raw = input as Record<string, unknown>;
  const submissionId = cleanText(raw.submission_id, 64);
  const telegram = normalizeTelegram(raw.telegram);
  const phone = cleanText(raw.phone, 40);
  const instagram = normalizeInstagram(raw.instagram);

  if (!UUID_PATTERN.test(submissionId)) {
    return { data: null, error: "Ariza identifikatori noto‘g‘ri." };
  }
  if (!TELEGRAM_PATTERN.test(telegram)) {
    return { data: null, error: "Telegram username noto‘g‘ri. Masalan: @username" };
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    return { data: null, error: "Telefon raqamini to‘liq kiriting yoki maydonni bo‘sh qoldiring." };
  }
  if (!INSTAGRAM_PATTERN.test(instagram)) {
    return { data: null, error: "Instagram username noto‘g‘ri." };
  }

  const rawAnswers = raw.answers && typeof raw.answers === "object"
    ? (raw.answers as Record<string, unknown>)
    : {};
  const answers = { ...EMPTY_BIOGRAPHY_ANSWERS };

  for (const question of BIOGRAPHY_QUESTIONS) {
    const answer = cleanText(rawAnswers[question.id], question.maxLength);
    if (answer.length < 2) {
      return { data: null, error: `${question.number}-savolga javob yozing.` };
    }
    answers[question.id] = answer;
  }

  const rawFiles = Array.isArray(raw.files) ? raw.files : [];
  if (rawFiles.length < 1 || rawFiles.length > 3 || !rawFiles.every(isBiographyFile)) {
    return { data: null, error: "Biriktirilgan fayllar ma’lumoti noto‘g‘ri." };
  }

  const files: BiographyFile[] = [];
  const seenKinds = new Set<BiographyFileKind>();
  const expectedPrefix = `applications/biographies/${submissionId}/`;

  for (const rawFile of rawFiles) {
    if (seenKinds.has(rawFile.kind)) {
      return { data: null, error: "Bir xil turdagi fayl bir necha marta yuborilgan." };
    }
    seenKinds.add(rawFile.kind);

    const rule = BIOGRAPHY_FILE_RULES[rawFile.kind];
    const file: BiographyFile = {
      kind: rawFile.kind,
      path: cleanText(rawFile.path, 500),
      name: cleanText(rawFile.name, 255),
      mime: cleanText(rawFile.mime, 160),
      size: Number.isFinite(rawFile.size) ? Math.floor(rawFile.size) : 0,
    };

    if (!file.path.startsWith(expectedPrefix) || !file.name) {
      return { data: null, error: "Biriktirilgan fayl manzili noto‘g‘ri." };
    }
    if (!rule.mimeTypes.includes(file.mime) || file.size <= 0 || file.size > rule.maxBytes) {
      return { data: null, error: `${rule.label} ma’lumoti noto‘g‘ri.` };
    }
    files.push(file);
  }

  if (!seenKinds.has("portrait")) {
    return { data: null, error: "Maqola uchun asosiy rasmni biriktiring." };
  }

  return {
    data: {
      submission_id: submissionId,
      telegram,
      phone,
      instagram,
      answers,
      files,
    },
    error: "",
  };
}
