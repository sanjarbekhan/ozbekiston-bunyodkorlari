import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanjar AI",
  description: "Bunyodkorlar, reyting va platformadagi tasdiqlangan ma’lumotlar bo‘yicha raqamli yordamchi.",
  alternates: { canonical: "https://www.bunyodkor.com/sanjar-ai" },
  openGraph: {
    title: "Sanjar AI",
    description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining raqamli yordamchisi.",
    url: "https://www.bunyodkor.com/sanjar-ai",
    type: "website",
  },
};

export default function SanjarAILayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
