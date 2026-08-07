"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_CATEGORIES = [
  "Ta'lim",
  "IT",
  "Sport",
  "Huquq",
  "Tibbiyot",
  "OAV",
  "San'at",
  "Siyosat",
  "Tashkilot",
  "Harbiy",
  "Valantyorlik",
];

function splitCategories(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [knownCategories, setKnownCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");

  const selected = useMemo(() => splitCategories(value), [value]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      const { data } = await supabase
        .from("articles")
        .select("category")
        .not("category", "is", null)
        .limit(1000);

      if (!active || !data) return;

      const fromDatabase = data.flatMap((row) => splitCategories(row.category || ""));
      const fromCurrent = splitCategories(value);
      const merged = Array.from(
        new Set([...DEFAULT_CATEGORIES, ...fromDatabase, ...fromCurrent])
      ).sort((a, b) => a.localeCompare(b, "uz"));

      setKnownCategories(merged);
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  function toggle(category: string) {
    const next = selected.includes(category)
      ? selected.filter((item) => item !== category)
      : [...selected, category];
    onChange(next.join(";"));
  }

  function addNewCategory() {
    const clean = newCategory.trim().replace(/;+$/g, "");
    if (!clean) return;

    const existing = knownCategories.find(
      (item) => item.toLocaleLowerCase("uz") === clean.toLocaleLowerCase("uz")
    );
    const category = existing || clean;

    if (!existing) {
      setKnownCategories((current) =>
        [...current, category].sort((a, b) => a.localeCompare(b, "uz"))
      );
    }

    if (!selected.includes(category)) {
      onChange([...selected, category].join(";"));
    }

    setNewCategory("");
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        {knownCategories.map((category) => {
          const active = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                active
                  ? "bg-[#0043a4] text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {active ? "✓ " : ""}
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-[#0043a4]/25 bg-[#f7faff] p-3">
        <p className="text-xs font-extrabold text-[#0043a4]">+ Yangi yo‘nalish qo‘shish</p>
        <div className="mt-2 flex gap-2">
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addNewCategory();
              }
            }}
            placeholder="Masalan: Arxitektura"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#0043a4]"
          />
          <button
            type="button"
            onClick={addNewCategory}
            disabled={!newCategory.trim()}
            className="rounded-xl bg-[#0043a4] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40"
          >
            Qo‘shish
          </button>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">
          Yangi yo‘nalish shu maqolaga avtomatik tanlanadi. Maqola saqlangach, keyingi maqolalarda ham ro‘yxatda chiqadi.
        </p>
      </div>
    </div>
  );
}
