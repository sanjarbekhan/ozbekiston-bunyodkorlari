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

function splitCategories(category: string | null) {
  return (category || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
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
    const normalized = new Map<string, string>();

    articles.forEach((article) => {
      splitCategories(article.category).forEach((category) => {
        const key = category.toLocaleLowerCase("uz");
        if (!normalized.has(key)) normalized.set(key, category);
      });
    });

    return Array.from(normalized.values()).sort((a, b) =>
      a.localeCompare(b, "uz")
    );
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");

    return articles.filter((article) => {
      const title = article.title.toLocaleLowerCase("uz");
      const slug = article.slug.toLocaleLowerCase("uz");
      const category = (article.category || "").toLocaleLowerCase("uz");
      const description = cleanText(article.description).toLocaleLowerCase("uz");

      const matchesSearch =
        !query ||
        title.includes(query) ||
        slug.includes(query) ||
        category.includes(query) ||
        description.includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        splitCategories(article.category).some(
          (item) =>
            item.toLocaleLowerCase("uz") ===
            categoryFilter.toLocaleLowerCase("uz")
        );

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, categoryFilter]);

  const isFiltering = search.trim().length > 0 || categoryFilter !== "all";
  const visibleArticles = isFiltering
    ? filteredArticles
    : filteredArticles.slice(0, 40);

  return (
    <>
      <div className="mb-8 rounded-[18px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] md:mb-12 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_280px] md:gap-4">
          <input
            className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0043a4] md:px-5 md:py-4 md:text-base md:font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
          />

          <select
            className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0043a4] md:px-5 md:py-4 md:text-base md:font-bold"
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
          {isFiltering
            ? `Topildi: ${filteredArticles.length} ta maqola`
            : `Ko‘rsatilmoqda: ${visibleArticles.length} ta · Jami: ${articles.length} ta maqola`}
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-5">
        {visibleArticles.map((article) => {
          const desc = cleanText(article.description);

          return (
            <Link
              key={article.id}
              href={`/bunyodkorlar/${article.slug}`}
              className="group block min-w-[82%] snap-start overflow-hidden rounded-[28px] bg-white shadow-[0_8px_22px_rgba(0,0,0,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] sm:min-w-[48%] md:min-w-0"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#e8e8e8]">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                    Rasm mavjud emas
                  </div>
                )}
              </div>

              <div className="p-5 md:p-5">
                <h3 className="line-clamp-3 text-[20px] font-black leading-[1.02] tracking-[-0.035em] text-[#111] md:text-[22px]">
                  {article.title}
                </h3>

                {desc && (
                  <p className="mt-4 line-clamp-4 text-[10px] font-bold leading-[1.55] text-[#0043a4] md:text-[11px]">
                    {desc}
                  </p>
                )}

                {article.created_at && (
                  <p className="mt-5 text-[11px] font-medium text-gray-400">
                    {formatDate(article.created_at)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {visibleArticles.length === 0 && (
          <div className="min-w-full rounded-[24px] bg-white p-8 text-center shadow-sm md:col-span-full md:min-w-0 md:p-10">
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
