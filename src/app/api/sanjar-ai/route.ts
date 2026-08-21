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

function fixedAnswer(question: string) {
  const q = question.toLocaleLowerCase("uz");
  if (/reyting|rating|ball|hisoblan/.test(q)) {
    return "Bunyodkor reytingi 100 ballik ochiq formulaga asoslanadi: yutuqlar — 60 ballgacha, faollik — 20 ballgacha, liderlik — 15 ballgacha, tasdiqlovchi dalillar — 5 ballgacha. AI maqoladagi yutuqlarni ajratadi, lekin natija tahririyat tasdig‘idan keyingina ommaga chiqadi. Jins, millat, din, siyosiy qarash yoki boshqa shaxsiy/sensitiv belgilar reytingga ta’sir qilmaydi.";
  }
  if (/ariza|qo‘shil|qo'shil|nomzod|topshir/.test(q)) {
    return "Ensiklopediyaga qo‘shilish uchun “Ariza qoldirish” sahifasidan ariza yuborishingiz mumkin. Tahririyat siz bilan bog‘lanib, keyingi ma’lumot va hujjatlarni aniqlashtiradi.";
  }
  if (/sanjar ai|sen kimsan|nimalar qila olasan|yordamchi/.test(q)) {
    return "Men Sanjar AI — O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bo‘yicha raqamli yordamchiman. Bunyodkorlarni ism, yo‘nalish yoki kalit so‘z bilan topaman, reyting formulasini tushuntiraman va saytdagi tasdiqlangan ma’lumotlar asosida savollarga javob beraman.";
  }
  return "";
}

function fallbackAnswer(question: string, matches: SearchArticle[]) {
  const fixed = fixedAnswer(question);
  if (fixed) return fixed;
  if (!matches.length) {
    return "Bu savol bo‘yicha ensiklopediyaning ochiq bazasida yetarli tasdiqlangan ma’lumot topilmadi. Ism, yo‘nalish, hudud yoki aniqroq kalit so‘z bilan qayta so‘rashingiz mumkin.";
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

async function generateWithModel(question: string, matches: SearchArticle[]) {
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
        input: `You are Sanjar AI, the public assistant for O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi. Answer in concise, natural Uzbek. Use ONLY the provided approved public encyclopedia sources and the platform rules below. Never invent biographical facts. If sources are insufficient, say so. Do not infer or compare people using sensitive traits such as gender, ethnicity, religion, political affiliation, health/disability, sexual orientation or family status. When discussing rankings, explain that AI extracts documented achievements but a fixed transparent formula and editorial approval determine what becomes public. Do not claim a person is better as a human being; only discuss documented profile/ranking data.\n\nPLATFORM RULES:\n- Ranking: achievements 0–60, activity 0–20, leadership 0–15, evidence 0–5.\n- Public ranking requires editorial approval.\n- Application page: ${SITE_URL}/ariza-qoldrish\n- Ranking page: ${SITE_URL}/reyting\n\nQUESTION:\n${question}\n\nAPPROVED SOURCES:\n${context || "No matching source found."}`,
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

    const ranked = ((data || []) as SearchArticle[])
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

    const fixed = fixedAnswer(question);
    const modelAnswer = fixed ? "" : await generateWithModel(question, enriched);
    const answer = fixed || modelAnswer || fallbackAnswer(question, enriched);
    const sources: Source[] = enriched.map((item) => ({
      title: item.title,
      category: item.category,
      url: `${SITE_URL}/bunyodkorlar/${item.slug}`,
    }));

    return NextResponse.json({ ok: true, answer, sources, mode: modelAnswer ? "ai" : "grounded" });
  } catch {
    return NextResponse.json({ error: "Sanjar AI javobini tayyorlashda xatolik yuz berdi." }, { status: 500 });
  }
}
