"use client";

import { useEffect, useRef, useState } from "react";
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
  const playing = !paused && !interacting && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || articles.length < 2) return;
    let raf = 0;
    let last = 0;
    const tick = (timestamp: number) => {
      const scroller = scrollerRef.current;
      if (scroller) {
        const track = scroller.firstElementChild as HTMLElement | null;
        const first = track?.children[0] as HTMLElement | undefined;
        const loopStart = track?.children[articles.length] as HTMLElement | undefined;
        const loopWidth = first && loopStart ? loopStart.offsetLeft - first.offsetLeft : 0;
        if (loopWidth > 0 && scroller.scrollWidth > scroller.clientWidth) {
          if (last) scroller.scrollLeft += Math.min(timestamp - last, 80) * 0.018;
          if (scroller.scrollLeft >= loopWidth) scroller.scrollLeft -= loopWidth;
        }
      }
      last = timestamp;
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [playing, articles.length]);

  if (!articles.length) return null;
  const extra = articles.slice(0, Math.min(6, articles.length));
  const renderCard = (article: Article) => (
    <PublicArticleCard
      title={article.title}
      slug={article.slug}
      imageUrl={article.image_url}
      category={article.category}
      description={article.description}
      date={article.published_at || article.created_at}
      compact
    />
  );

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
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteracting(false); }}
      >
        <div className="home-bio-carousel-track">
          {articles.map((article) => (
            <div className="home-bio-carousel-item" key={article.id}>{renderCard(article)}</div>
          ))}
          {extra.map((article) => (
            <div className="home-bio-carousel-item" key={"repeat-" + article.id} aria-hidden="true" inert>
              {renderCard(article)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
