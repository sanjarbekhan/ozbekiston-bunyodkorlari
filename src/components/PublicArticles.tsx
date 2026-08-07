"use client";

import { useMemo, useState } from "react";
import PublicArticleCard from "@/components/PublicArticleCard";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  status?: string;
  created_at?: string | null;
  published_at?: string | null;
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

    return Array.from(normalized.values()).sort((a, b) => a.localeCompare(b, "uz"));
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
          (item) => item.toLocaleLowerCase("uz") === categoryFilter.toLocaleLowerCase("uz")
        );

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, categoryFilter]);

  const hasFilters = search.trim().length > 0 || categoryFilter !== "all";

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
  }

  return (
    <>
      <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)] md:mb-10 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_300px_auto] md:gap-4">
          <label className="block">
            <span className="sr-only">Ism yoki kalit so‘z</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 text-sm font-semibold text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#0043a4] focus:bg-white md:px-5 md:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, familiya yoki kalit so‘z..."
            />
          </label>

          <label className="block">
            <span className="sr-only">Yo‘nalish</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#0043a4] focus:bg-white md:px-5 md:text-base"
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
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-extrabold text-slate-600 transition hover:border-[#0043a4]/30 hover:text-[#0043a4]"
            >
              Tozalash
            </button>
          )}
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-500">
          <span className="font-extrabold text-[#0043a4]">{filteredArticles.length}</span> ta profil topildi
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredArticles.map((article) => (
          <PublicArticleCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            imageUrl={article.image_url}
            category={article.category}
            description={article.description}
            date={article.published_at || article.created_at}
          />
        ))}

        {filteredArticles.length === 0 && (
          <div className="rounded-[26px] border border-slate-200 bg-white p-10 text-center shadow-sm sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Profil topilmadi
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600 md:text-base">
              Boshqa ism, familiya yoki yo‘nalish bilan qidirib ko‘ring.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-[#0043a4] px-6 py-3 text-sm font-extrabold text-white"
              >
                Barcha profillarni ko‘rish
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
