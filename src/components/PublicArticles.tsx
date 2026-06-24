"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  status: string;
  created_at?: string;
};

function cleanText(text: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function firstCategory(category: string | null) {
  if (!category) return "";
  return category.split(";").map((item) => item.trim()).filter(Boolean)[0] || "";
}

function formatDate(date?: string) {
  if (!date) return "";
  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

export default function PublicArticles({ articles }: { articles: Article[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const allCategories = articles.flatMap((article) =>
      (article.category || "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    );

    return Array.from(new Set(allCategories)).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      const title = article.title.toLowerCase();
      const slug = article.slug.toLowerCase();
      const category = (article.category || "").toLowerCase();
      const description = cleanText(article.description).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        slug.includes(query) ||
        category.includes(query) ||
        description.includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        (article.category || "")
          .split(";")
          .map((item) => item.trim())
          .includes(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, categoryFilter]);

  return (
    <>
      <div className="mb-8 bg-white p-4 shadow-sm md:mb-12 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_280px] md:gap-4">
          <input
            className="w-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0043a4] md:px-5 md:py-4 md:text-base md:font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
          />

          <select
            className="w-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0043a4] md:px-5 md:py-4 md:text-base md:font-bold"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Barcha yo‘nalishlar</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-xs font-bold text-[#0043a4] md:mt-4 md:text-sm">
          Topildi: {filteredArticles.length} ta maqola
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 md:mx-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-14">
        {filteredArticles.map((article) => {
          const cat = firstCategory(article.category);
          const desc = cleanText(article.description);

          return (
            <Link
              key={article.id}
              href={`/bunyodkorlar/${article.slug}`}
              className="group block min-w-[82%] snap-start overflow-hidden bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(0,0,0,0.14)] sm:min-w-[48%] md:min-w-0"
            >
              <div className="relative w-full overflow-hidden bg-white">
                {cat && (
                  <span className="absolute left-3 top-3 z-10 bg-[#0043a4] px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-white md:left-4 md:top-4 md:text-[10px]">
                    {cat}
                  </span>
                )}

                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="block h-auto w-full transition duration-300 group-hover:scale-[1.02]"
                  />
                )}
              </div>

              <div className="p-5 md:p-6">
                <h3 className="line-clamp-3 text-[22px] font-black leading-[1] tracking-[-0.04em] text-[#111827] md:text-[25px]">
                  {article.title}
                </h3>

                {desc && (
                  <p className="mt-4 line-clamp-4 text-[12px] font-black leading-[1.55] text-[#0043a4]">
                    {desc}
                  </p>
                )}

                {article.created_at && (
                  <p className="mt-5 text-[11px] font-medium tracking-[0.14em] text-gray-500 md:text-[12px] md:tracking-[0.18em]">
                    {formatDate(article.created_at)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="min-w-full bg-white p-8 text-center shadow-sm md:col-span-full md:min-w-0 md:p-10">
            <h3 className="text-xl font-black text-[#111827] md:text-2xl">
              Maqola topilmadi
            </h3>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              Boshqa ism, familiya yoki yo‘nalish bilan qidirib ko‘ring.
            </p>
          </div>
        )}
      </div>
    </>
  );
}