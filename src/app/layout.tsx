// Bunyodkor 2026 visual system: Manrope typography and white motion UI.
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://www.bunyodkor.com";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
    template: "%s | O‘zbekiston Bunyodkor Yoshlari",
  },
  description:
    "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlar haqidagi ensiklopedik platforma.",
  keywords: [
    "O‘zbekiston Bunyodkor Yoshlari",
    "Bunyodkor yoshlar",
    "O‘zBYE",
    "Ensiklopediya",
    "Yoshlar",
    "Bunyodkorlar",
    "O‘zbekiston",
  ],
  authors: [{ name: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi" }],
  creator: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
  publisher: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
  icons: {
    icon: [
      {
        url: "/tilda/images/ozbye-new-logo.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/tilda/images/ozbye-new-logo.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "O‘zbekiston Bunyodkor Yoshlari",
    title: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
    description:
      "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlar haqidagi ensiklopedik platforma.",
    images: [
      {
        url: "/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png",
        width: 1200,
        height: 630,
        alt: "O‘zbekiston Bunyodkor Yoshlari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
    description:
      "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlar haqidagi ensiklopedik platforma.",
    images: ["/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={manrope.variable}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="O‘zbekiston Bunyodkor Yoshlari — RSS"
          href={SITE_URL + "/rss.xml"}
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="O‘zbekiston Bunyodkor Yoshlari — Atom"
          href={SITE_URL + "/atom.xml"}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
