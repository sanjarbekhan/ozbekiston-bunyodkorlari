import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bunyodkorlar reytingi | O‘zbekiston Bunyodkor Yoshlari",
  description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining ochiq metodologiyaga asoslangan yutuqlar, faollik va liderlik reytingi.",
  alternates: { canonical: "https://www.bunyodkor.com/reyting" },
  openGraph: {
    title: "Bunyodkorlar reytingi",
    description: "Yutuqlar, faollik, liderlik va tasdiqlovchi dalillar asosidagi ochiq reyting.",
    url: "https://www.bunyodkor.com/reyting",
    type: "website",
  },
};

export default function RankingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
