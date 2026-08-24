import Link from "next/link";

const links = [
  ["/bunyodkorlar", "Bunyodkorlar"],
  ["/reyting", "Reyting"],
  ["/sanjar-ai", "Bunyodkor AI"],
  ["/haqida", "Biz haqimizda"],
  ["/tavsiyalari", "Tavsiyalar"],
  ["/sahifasi", "Iqtiboslar"],
  ["/ariza-qoldrish", "Ariza qoldirish"],
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#071426] px-4 py-12 text-white md:px-8 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <img
            src="/tilda/images/ozbye-new-logo.svg"
            alt="O‘zbekiston Bunyodkor Yoshlari"
            className="h-14 w-auto max-w-[220px] object-contain object-left brightness-0 invert"
          />
          <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/65 md:text-base">
            O‘zbekiston rivojiga munosib hissa qo‘shayotgan yoshlarning faoliyati,
            yutuqlari va hayot yo‘lini hujjatlashtiruvchi ensiklopedik platforma.
          </p>
        </div>

        <div className="md:text-right">
          <nav className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-bold text-white/75 transition hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-xs font-semibold text-white/40">
            © {new Date().getFullYear()} O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
          </p>
        </div>
      </div>
    </footer>
  );
}
