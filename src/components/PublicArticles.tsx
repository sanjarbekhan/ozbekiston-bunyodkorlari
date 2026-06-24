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

  const datePart = date.slice(0, 10);
  const parts = datePart.split("-");

  if (parts.length !== 3) return "";

  const [year, month, day] = parts;

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
      <div className="mb-12 rounded-none bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <input
            className="w-full rounded-none border border-gray-200 bg-white px-5 py-4 text-base font-bold outline-none transition focus:border-[#0043a4]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
          />

          <select
            className="w-full rounded-none border border-gray-200 bg-white px-5 py-4 text-base font-bold outline-none transition focus:border-[#0043a4]"
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

        <p className="mt-4 text-sm font-bold text-[#0043a4]">
          Topildi: {filteredArticles.length} ta maqola
        </p>
      </div>

      <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {filteredArticles.map((article) => {
          const cat = firstCategory(article.category);
          const desc = cleanText(article.description);

          return (
            <Link
              key={article.id}
              href={`/bunyodkorlar/${article.slug}`}
              className="group block bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.14)]"
            >
              <div className="relative flex h-[315px] w-full items-center justify-center bg-[#f3f3f3]">
                {cat && (
                  <span className="absolute left-4 top-4 z-10 bg-[#0043a4] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    {cat}
                  </span>
                )}

                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-full w-full object-contain object-bottom transition duration-300 group-hover:scale-[1.02]"
                  />
                )}
              </div>

              <div className="min-h-[245px] p-7">
                <h3 className="text-[25px] font-black leading-[0.98] tracking-[-0.04em] text-[#111827]">
                  {article.title}
                </h3>

                {desc && (
                  <p className="mt-5 line-clamp-4 text-[12px] font-black leading-[1.55] text-[#0043a4]">
                    {desc}
                  </p>
                )}

                {article.created_at && (
                  <p className="mt-6 text-[12px] font-medium tracking-[0.18em] text-gray-500">
                    {formatDate(article.created_at)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="col-span-full bg-white p-10 text-center shadow-sm">
            <h3 className="text-2xl font-black text-[#111827]">
              Maqola topilmadi
            </h3>
            <p className="mt-2 text-gray-600">
              Boshqa ism, familiya yoki yo‘nalish bilan qidirib ko‘ring.
            </p>
          </div>
        )}
      </div>
    </>
  );
}