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
};

function cleanText(text: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PublicArticles({ articles }: { articles: Article[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const allCategories = articles
      .flatMap((article) =>
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
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-md">
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <input
            className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base outline-none focus:border-emerald-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya yoki yo‘nalish bo‘yicha qidirish..."
          />

          <select
            className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base outline-none focus:border-emerald-700"
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

        <p className="mt-4 text-sm text-gray-600">
          Topildi: <b>{filteredArticles.length}</b> ta maqola
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/bunyodkorlar/${article.slug}`}
            className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            {article.image_url && (
              <div className="flex h-72 w-full items-center justify-center bg-[#f7f3ea] p-2">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="p-5">
              {article.category && (
                <p className="mb-2 text-sm font-semibold text-emerald-700">
                  {article.category}
                </p>
              )}

              <h3 className="text-xl font-bold">{article.title}</h3>

              {article.description && (
                <div
                  className="mt-3 line-clamp-3 text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: article.description }}
                />
              )}
            </div>
          </Link>
        ))}

        {filteredArticles.length === 0 && (
          <div className="col-span-full rounded-3xl bg-white p-10 text-center shadow-md">
            <h3 className="text-2xl font-bold">Maqola topilmadi</h3>
            <p className="mt-2 text-gray-600">
              Boshqa ism, familiya yoki yo‘nalish bilan qidirib ko‘ring.
            </p>
          </div>
        )}
      </div>
    </>
  );
}