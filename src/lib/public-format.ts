const APOSTROPHES = /[ʻʼ’‘`´]/g;

const CATEGORY_ALIASES: Record<string, string> = {
  "ta'lim": "Ta’lim",
  "talim": "Ta’lim",
  "pedagogika": "Pedagogika",
  "sport": "Sport",
  "oav": "OAV",
  "ommaviy axborot vositalari": "OAV",
  "valantyorlik": "Volontyorlik",
  "volantyorlik": "Volontyorlik",
  "volontyorlik": "Volontyorlik",
  "san'at": "San’at",
  "sanat": "San’at",
  "madaniyat": "Madaniyat",
  "adabiyot": "Adabiyot",
  "ilm-fan": "Ilm-fan",
  "ilm fan": "Ilm-fan",
  "fan": "Fan",
  "it": "IT",
  "axborot texnologiyalari": "Axborot texnologiyalari",
  "texnologiya": "Texnologiya",
  "texnologiyalar": "Texnologiyalar",
  "tadbirkorlik": "Tadbirkorlik",
  "biznes": "Biznes",
  "media": "Media",
  "jurnalistika": "Jurnalistika",
  "huquq": "Huquq",
  "tibbiyot": "Tibbiyot",
  "sog'liqni saqlash": "Sog‘liqni saqlash",
  "siyosat": "Siyosat",
  "davlat boshqaruvi": "Davlat boshqaruvi",
  "ekologiya": "Ekologiya",
  "muhandislik": "Muhandislik",
};

function normalizeKey(value: string) {
  return value
    .replace(APOSTROPHES, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("uz-UZ");
}

function titleCaseUz(value: string) {
  const clean = value.replace(APOSTROPHES, "’").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (/^[A-Z0-9&+-]{2,8}$/.test(clean)) return clean;
  return clean.charAt(0).toLocaleUpperCase("uz-UZ") + clean.slice(1).toLocaleLowerCase("uz-UZ");
}

export function normalizeCategory(value: string) {
  const key = normalizeKey(value);
  return CATEGORY_ALIASES[key] || titleCaseUz(value);
}

export function publicCategories(category?: string | null) {
  const seen = new Set<string>();

  return (category || "")
    .split(/[;,]/)
    .map((item) => normalizeCategory(item))
    .filter(Boolean)
    .filter((item) => {
      const key = normalizeKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function publicCategoryLabel(category?: string | null) {
  const categories = publicCategories(category);
  return categories.length ? categories.join(" • ") : "Bunyodkor";
}

export function normalizePublicQuote(value?: string | null) {
  return (value || "")
    .replace(/\bkunikamiz\b/giu, "ko‘nikamiz")
    .replace(/\bkup\b/giu, "ko‘p")
    .replace(/\bo[ʻʼ’‘']\s+rgatadi\b/giu, "o‘rgatadi")
    .replace(/\btuxtab\b/giu, "to‘xtab")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([“"])\s+/g, "$1")
    .replace(/\s+([”"])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const MONTHS =
  "yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|sentyabr|oktabr|noyabr|dekabr";

function minorBirthYear(value: string) {
  const text = value.replace(/<[^>]+>/g, " ").replace(APOSTROPHES, "'");

  const patterns = [
    new RegExp(`(20\\d{2})[^.!?]{0,80}tug['"]?ilgan`, "iu"),
    new RegExp(`tug['"]?ilgan[^.!?]{0,80}(20\\d{2})`, "iu"),
    new RegExp(`(20\\d{2})[^.!?]{0,80}tavallud`, "iu"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const year = Number(match[1]);
    if (!Number.isFinite(year)) continue;

    const currentYear = new Date().getUTCFullYear();
    if (year > currentYear - 18 && year <= currentYear) return year;
  }

  return null;
}

export function protectMinorPersonalData(
  value?: string | null,
  context?: string | null,
) {
  if (!value) return "";
  const year = minorBirthYear(context || value);
  if (!year) return value;

  let output = value;
  const escapedYear = String(year);

  // Voyaga yetmaganlar uchun ochiq sahifada aniq kun/oyni ko‘rsatmaymiz.
  output = output.replace(
    new RegExp(`${escapedYear}\\s*[-–]?\\s*yil(?:ning)?\\s+(?:\\d{1,2})\\s*[-–.]?\\s*(?:${MONTHS})(?:da)?`, "giu"),
    `${year}-yil`,
  );
  output = output.replace(
    new RegExp(`(?:\\d{1,2})\\s*[-–.]?\\s*(?:${MONTHS})(?:da)?[,]?\\s+${escapedYear}\\s*[-–]?\\s*yil(?:da)?`, "giu"),
    `${year}-yil`,
  );
  output = output.replace(
    new RegExp(`(?:\\d{1,2})[./-](?:\\d{1,2})[./-]${escapedYear}`, "g"),
    escapedYear,
  );

  return output;
}
