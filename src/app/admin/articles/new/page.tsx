import type { Metadata } from "next";
import MobileArticleEditor from "@/components/admin/MobileArticleEditor";

export const metadata: Metadata = {
  title: "Yangi maqola",
  robots: { index: false, follow: false },
};

export default function NewArticlePage() {
  return <MobileArticleEditor />;
}
