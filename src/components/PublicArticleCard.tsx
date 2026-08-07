import Link from "next/link";

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

  return (
    <Link
      href={`/bunyodkorlar/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#0043a4]/25 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
    >
      <div className="aspect-square overflow-hidden bg-[#edf1f6]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">
            Rasm mavjud emas
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#0043a4]">
          {category || "Bunyodkor"}
        </p>
        <h3 className="mt-2 line-clamp-3 text-[21px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#101828] md:text-[23px]">
          {title}
        </h3>

        {!compact && desc && (
          <p className="mt-4 line-clamp-3 text-[13px] font-medium leading-6 text-slate-600">
            {desc}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-5 text-xs font-semibold text-slate-400">
          <span>{formattedDate || "Ensiklopediya profili"}</span>
          <span className="text-[#0043a4] transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
