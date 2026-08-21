import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/ranking";

const SITE_URL = "https://www.bunyodkor.com";

type SearchArticle = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  content?: string | null;
  published_at: string | null;
};

type Source = {
  title: string;
  url: string;
  category: string | null;
};

const STOP_WORDS = new Set([
  "bilan", "uchun", "haqida", "qanday", "qaysi", "nima", "kim", "nega", "yoki", "ham", "bor", "edi",
  "shu", "menga", "bizga", "ular", "uning", "bo'yicha", "bo‘yicha", "ko'rsat", "ko‘rsat", "ayt", "ber",
  "yo'nalishidagi", "yo‘nalishidagi", "yo'nalishi", "yo‘nalishi", "bunyodkor", "bunyodkorlar", "bunyodkorlarni",
  "profil", "profillar", "top", "topib", "chiqar", "ko'rsatib", "ko‘rsatib",
]);

const SHORT_KEYWORDS = new Set(["it", "ai", "ui", "ux"]);

function tokenize(value: string) {
  const tokens = value
    .toLocaleLowerCase("uz")
    .replace(/[^a-z0-9а-яёўқғҳ‘’'\s-]+/gi, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => (item.length >= 3 || SHORT_KEYWORDS.has(item)) && !STOP_WORDS.has(item));

  const normalized = new Set(tokens);
  const lower = value.toLocaleLowerCase("uz");
  if (/dasturlash|programming|developer|software|axborot texnolog/.test(lower)) normalized.add("it");
  if (/sun['’‘]?iy intellekt|artificial intelligence/.test(lower)) normalized.add("ai");
  if (/huquq|yuridik|legal/.test(lower)) normalized.add("huquq");
  if (/ta['’‘]?lim|pedagog/.test(lower)) normalized.add("ta'lim");
  if (/san['’‘]?at|ijod|she['’‘]?r|adabiyot/.test(lower)) normalized.add("san'at");
  if (/tibbiyot|meditsina|shifokor/.test(lower)) normalized.add("tibbiyot");
  if (/iqtisod|moliya|biznes|marketing/.test(lower)) normalized.add("iqtisod");

  return Array.from(normalized);
}

function scoreArticle(article: SearchArticle, tokens: string[]) {
  const title = article.title.toLocaleLowerCase("uz");
  const category = (article.category || "").toLocaleLowerCase("uz");
  const description = stripHtml(article.description).toLocaleLowerCase("uz");
  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 8;
    if (category.includes(token)) score += 5;
    if (description.includes(token)) score += 2;
  }
  return score;
}

function platformAnswer(question: string, profileCount: number) {
  const q = question.toLocaleLowerCase("uz").trim();

  if (/^(salom|assalomu alaykum|assalom|hello|hi|privet)[!.,\s]*$/.test(q)) {
    return "Salom! Men Sanjar AI. O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi, undagi profillar, yutuqlar, reyting va ariza topshirish jarayoni bo‘yicha savollaringizga yordam beraman. Masalan: “Ensiklopediya nima?”, “Nima qila olasan?” yoki biror ism va yo‘nalishni yozishingiz mumkin.";
  }

  if (/nima qila olasan|nimalar qila olasan|qanday yordam bera olasan|imkoniyatlaring|vazifang/.test(q)) {
    return `Men asosan O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bo‘yicha ishlayman. Hozir bazada ${profileCount} ta e’lon qilingan profil bor. Men ism yoki yo‘nalish bo‘yicha profil topaman, profil yutuqlarini qisqacha tushuntiraman, reyting formulasini izohlayman, ensiklopediya va ariza topshirish jarayoni haqida javob beraman. Bazada bo‘lmagan biografik faktni o‘ylab topmayman.`;
  }

  if (/(ensiklopediya|o['’‘]?zbye|bunyodkor yoshlari|bu sayt|platforma).*(nima|haqida|maqsad|qanaqa|qanday)|^(ensiklopediya nima|loyiha haqida)/.test(q)) {
    return `O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi — yoshlarning ta’limi, faoliyati, yutuqlari, loyihalari va hayot yo‘lini hujjatlashtiradigan raqamli ensiklopedik platforma. Hozir unda ${profileCount} ta e’lon qilingan profil mavjud. Har bir profil alohida maqola sifatida saqlanadi, reyting esa maqoladagi qayd etilgan natijalar asosida shakllanadi.`;
  }

  if (/(nechta|qancha).*(profil|maqola|bunyodkor)|profil.*(nechta|qancha)/.test(q)) {
    return `Hozir ensiklopediyada ${profileCount} ta e’lon qilingan profil mavjud.`;
  }

  if (/reyting|rating|ball|hisoblan/.test(q)) {
    return "Bunyodkorlar reytingi 100 ballik ochiq formulaga asoslanadi: yutuqlar — 60 ballgacha, faollik — 20 ballgacha, tashabbuskorlik — 15 ballgacha, tasdiqlovchi dalillar — 5 ballgacha. Reyting maqolada qayd etilgan natijalarga tayanadi; shaxsiy yoki sensitiv belgilar ballga ta’sir qilmaydi.";
  }

  if (/ariza|qo‘shil|qo'shil|nomzod|topshir/.test(q)) {
    return "Ensiklopediyaga qo‘shilish uchun “Ariza qoldirish” sahifasidan ariza yuborasiz. Tahririyat siz bilan bog‘lanib, biografiya va yutuqlarni tasdiqlovchi ma’lumotlarni aniqlashtiradi. Ariza sahifasi: bunyodkor.com/ariza-qoldrish.";
  }

  if (/sanjar ai|sen kimsan|o'zing kimsan|o‘zing kimsan/.test(q)) {
    return "Men Sanjar AI — O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining raqamli yordamchisiman. Asosiy vazifam ensiklopediya bazasidagi ochiq ma’lumotlarni topish va tushunarli shaklda javob berish.";
  }

  return "";
}

function fallbackAnswer(question: string, matches: SearchArticle[], profileCount: number) {
  const fixed = platformAnswer(question, profileCount);
  if (fixed) return fixed;
  if (!matches.length) {
    return "Bu savol bo‘yicha ensiklopediya bazasida aniq ma’lumot topilmadi. Men asosan O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bo‘yicha javob beraman. Ism, yo‘nalish, yutuq yoki loyiha nomini aniqroq yozib ko‘ring.";
  }
  if (matches.length === 1) {
    const item = matches[0];
    const intro = stripHtml(item.description);
    return `${item.title}${item.category ? ` — ${item.category}` : ""}.${intro ? ` ${intro}` : ""}`;
  }
  return `Savolingizga eng yaqin ${matches.length} ta profil topildi: ${matches.map((item, index) => `${index + 1}) ${item.title}${item.category ? ` — ${item.category}` : ""}`).join("; ")}.`;
}

function parseOpenAIText(payload: unknown) {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (data.output_text) return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) return content.text;
    }
  }
  return "";
}

async function generateWithModel(question: string, matches: SearchArticle[], profileCount: number) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";

  const context = matches
    .map((item, index) => {
      const body = stripHtml(item.content).slice(0, 3600);
      return `SOURCE ${index + 1}\nTitle: ${item.title}\nCategory: ${item.category || "—"}\nURL: ${SITE_URL}/bunyodkorlar/${item.slug}\nDescription: ${stripHtml(item.description)}\nArticle excerpt: ${body}`;
    })
    .join("\n\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SANJAR_MODEL || "gpt-5.6-luna",
        input: `You are Sanjar AI, the public assistant for O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi. Answer in natural, concise Uzbek. Your main domain is THIS encyclopedia and its published profiles. You may answer general questions about the encyclopedia using PLATFORM CONTEXT even when there is no matching profile. For biographical claims about a person, use ONLY the provided approved public profile sources and never invent facts. If a person or fact is not found, clearly say the encyclopedia does not currently contain enough information. Do not infer or compare people using sensitive traits.\n\nPLATFORM CONTEXT:\n- The platform documents the education, activity, achievements, projects and life paths of active young people in Uzbekistan.\n- Published profiles currently available: ${profileCount}.\n- Ranking: achievements 0–60, activity 0–20, initiative/tashabbuskorlik 0–15, evidence 0–5.\n- Ranking is based on documented profile information, not a person's human worth.\n- Application page: ${SITE_URL}/ariza-qoldrish\n- Ranking page: ${SITE_URL}/reyting\n- Profiles catalog: ${SITE_URL}/bunyodkorlar\n- If the question is unrelated to the encyclopedia, answer briefly and steer the user back to encyclopedia-related help.\n\nQUESTION:\n${question}\n\nMATCHING APPROVED PROFILE SOURCES:\n${context || "No matching profile source found."}`,
      }),
    });
    if (!response.ok) return "";
    const text = parseOpenAIText(await response.json()).trim();
    return text.slice(0, 3000);
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (question.length < 2 || question.length > 700) {
      return NextResponse.json({ error: "Savol 2–700 ta belgidan iborat bo‘lsin." }, { status: 400 });
    }

    const tokens = tokenize(question);
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, slug, category, description, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(400);

    if (error) return NextResponse.json({ error: "Ma’lumot bazasini o‘qib bo‘lmadi." }, { status: 500 });

    const articles = (data || []) as SearchArticle[];
    const profileCount = articles.length;
    const ranked = articles
      .map((item) => ({ item, score: scoreArticle(item, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ item }) => item);

    let enriched = ranked;
    if (ranked.length) {
      const ids = ranked.map((item) => item.id);
      const { data: fullRows } = await supabase
        .from("articles")
        .select("id, title, slug, category, description, content, published_at")
        .in("id", ids)
        .eq("status", "published");
      const byId = new Map(((fullRows || []) as SearchArticle[]).map((item) => [item.id, item]));
      enriched = ids.map((id) => byId.get(id)).filter((item): item is SearchArticle => Boolean(item));
    }

    const fixed = platformAnswer(question, profileCount);
    const modelAnswer = fixed ? "" : await generateWithModel(question, enriched, profileCount);
    const answer = fixed || modelAnswer || fallbackAnswer(question, enriched, profileCount);
    const sources: Source[] = enriched.map((item) => ({
      title: item.title,
      category: item.category,
      url: `${SITE_URL}/bunyodkorlar/${item.slug}`,
    }));

    return NextResponse.json({
      ok: true,
      answer,
      sources,
      mode: fixed ? "encyclopedia" : modelAnswer ? "ai" : "grounded",
    });
  } catch {
    return NextResponse.json({ error: "Sanjar AI javobini tayyorlashda xatolik yuz berdi." }, { status: 500 });
  }
}
