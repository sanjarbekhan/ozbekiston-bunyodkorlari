import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bunyodkor AI",
  description:
    "Bunyodkorlar, reyting va platformadagi tasdiqlangan ma’lumotlar bo‘yicha raqamli yordamchi.",
  alternates: { canonical: "/bunyodkor-ai" },
  openGraph: {
    title: "Bunyodkor AI",
    description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining raqamli yordamchisi.",
    url: "/bunyodkor-ai",
    type: "website",
  },
};

export default function BunyodkorAILayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
