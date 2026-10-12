"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PublicArticleCard from "@/components/PublicArticleCard";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description?: string | null;
  published_at: string | null;
  created_at: string;
};

export default function InfiniteArticlesCarousel({ articles }: { articles: Article[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const playing = !paused && !interacting && !reducedMotion && articles.length > 1;

  // Render only ten cards, then advance the window through all biographies.
  const visibleArticles = useMemo(() => {
    if (articles.length <= 1) return articles;
    return Array.from({ length: 10 }, (_, i) => articles[(startIndex + i) % articles.length]);
  }, [articles, startIndex]);

  const normalizeScroll = useCallback(() => {
    const scroll = scrollerRef.current;
    const track = scroll?.firstElementChild as HTMLElement | null;
    const first = track?.children[0] as HTMLElement | undefined;
    const second = track?.children[1] as HTMLElement | undefined;
    if (!scroll || !first || !second || articles.length < 2) return;
    const step = second.offsetLeft - first.offsetLeft;
    if (step <= 0) return;
    const advance = Math.min(7, Math.floor(scroll.scrollLeft / step));
    if (advance > 0) {
      scroll.scrollLeft -= advance * step;
      setStartIndex((value) => (value + advance) % articles.length);
    }
  }, [articles.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let previous = 0;
    const tick = (timestamp: number) => {
      const scroll = scrollerRef.current;
      if (scroll && !document.hidden) {
        if (previous) scroll.scrollLeft += Math.min(timestamp - previous, 80) * .018;
        normalizeScroll();
      }
      previous = timestamp;
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [playing, normalizeScroll]);

  if (articles.length === 0) return null;

  return (
    <div className="home-bio-carousel" aria-label="Bunyodkor yoshlarning biografik maqolalari">
      <div className="home-bio-carousel-controls">
        <button type="button" className="home-bio-carousel-pause" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          {paused ? "▶ Davom ettirish" : "Ⅱ Aylanishni to‘xtatish"}
        </button>
      </div>
      <div
        ref={scrollerRef}
        className="home-bio-carousel-scroll"
        tabIndex={0}
        aria-label="Maqolalarni chapga yoki o‘ngga surib ko‘ring"
        onScroll={normalizeScroll}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteracting(false); }}
      >
        <div className="home-bio-carousel-track">
          {visibleArticles.map((article, index) => (
            <div className="home-bio-carousel-item" key={article.id + "-" + index}>
              <PublicArticleCard
                title={article.title}
                slug={article.slug}
                imageUrl={article.image_url}
                category={article.category}
                description={article.description}
                date={article.published_at || article.created_at}
                compact
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
