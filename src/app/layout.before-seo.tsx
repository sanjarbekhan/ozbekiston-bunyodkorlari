import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "O‘zbekiston Bunyodkor Yoshlari",
  description: "O‘zbekiston Bunyodkor Yoshlari ensiklopediyasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}