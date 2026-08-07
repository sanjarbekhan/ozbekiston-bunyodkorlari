import type { Metadata } from "next";
import AdminQuickNav from "@/components/admin/AdminQuickNav";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      nocache: true,
    },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AdminQuickNav />
    </>
  );
}
