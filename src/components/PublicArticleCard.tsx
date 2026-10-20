import Link from "next/link";
import { publicCategories } from "@/lib/public-format";

type PublicArticleCardProps = {
  title: string;
  slug: string;
  imageUrl?: string | null;
  category?: string | null;
  description?: string | null;
  date?: string | null;
  compact?: boolean;
};

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
] as const;

function cleanText(value?: string | null) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getUTCDate();
  const month = UZ_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}, ${year}`;
}

export default function PublicArticleCard({
  title,
  slug,
  imageUrl,
  category,
  description,
  date,
  compact = false,
}: PublicArticleCardProps) {
  const desc = cleanText(description);
  const formattedDate = formatDate(date);
  const categories = publicCategories(category);
  const initials = title.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("uz-UZ");

  return (
    <Link
      href={`/bunyodkorlar/${slug}`}
      className="public-profile-card group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#0043a4]/25 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
    >
      <div className="aspect-square overflow-hidden bg-[#edf1f6]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#e6f0ff] via-[#eff6ff] to-[#dceaff] px-6 text-center">
            <span aria-hidden="true" className="absolute -right-12 -top-10 h-40 w-40 rounded-full border-[28px] border-[#c3d9ff]/35" />
            <span aria-hidden="true" className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border-[28px] border-white/50" />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-white bg-white/80 text-4xl font-black tracking-[-.07em] text-[#2259ad] shadow-lg shadow-blue-900/5">{initials}</span>
            <span className="relative mt-5 text-[10px] font-black uppercase tracking-[.21em] text-[#668ac2]">Bunyodkor yoshlar</span>
          </div>
        )}
      </div>

      <div className="profile-card-content flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap gap-1.5">
          {(categories.length ? categories : ["Bunyodkor"]).slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#0043a4]"
            >
              {item}
            </span>
          ))}
        </div>

        <h3 className="profile-card-name mt-3 line-clamp-3 text-[21px] font-extrabold leading-[1.22] tracking-[-0.035em] text-[#101828] md:text-[23px]">
          {title}
        </h3>

        {!compact && desc && (
          <p className="mt-4 line-clamp-2 text-[13px] font-medium leading-6 text-slate-600">
            {desc}
          </p>
        )}

        <div className="profile-card-footer mt-auto flex items-center justify-between gap-4 pt-5 text-xs font-semibold text-slate-400">
          <span>{formattedDate || "Ensiklopediya profili"}</span>
          <span className="profile-card-read text-[#0043a4] transition-transform duration-300 group-hover:translate-x-1">
            Maqolani o‘qish <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
