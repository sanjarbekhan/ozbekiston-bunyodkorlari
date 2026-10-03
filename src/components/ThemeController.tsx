"use client";

import { useEffect } from "react";

type ThemeMode = "day" | "night";

function resolveTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem("bunyodkor-theme");
    if (saved === "day" || saved === "night") return saved;
  } catch {}

  const hour = new Date().getHours();
  return hour >= 19 || hour < 7 ? "night" : "day";
}

function applyTheme() {
  document.documentElement.dataset.theme = resolveTheme();
}

export default function ThemeController() {
  useEffect(() => {
    applyTheme();
    const interval = window.setInterval(applyTheme, 60_000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "bunyodkor-theme") applyTheme();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
