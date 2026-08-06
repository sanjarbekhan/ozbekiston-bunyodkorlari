import type { ContentBlock } from "@/lib/article-types";

function safeLevel(value?: number) {
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 2;
}

export default function ArticleContent({
  blocks,
  legacyHtml,
}: {
  blocks?: ContentBlock[] | null;
  legacyHtml?: string | null;
}) {
  const normalized = Array.isArray(blocks) ? blocks : [];

  if (normalized.length === 0 && legacyHtml) {
    return (
      <div
        className="article-rich-text"
        dangerouslySetInnerHTML={{ __html: legacyHtml }}
      />
    );
  }

  return (
    <div className="article-rich-text">
      {normalized.map((block, index) => {
        const key = block.id || `${block.ty}-${index}`;

        if (block.ty === "heading") {
          const level = safeLevel(block.le);
          if (level === 3) return <h3 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
          if (level === 4) return <h4 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
          return <h2 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
        }

        if (["text", "preface", "html"].includes(block.ty)) {
          return (
            <div
              key={key}
              className={block.ty === "preface" ? "article-preface" : undefined}
              dangerouslySetInnerHTML={{ __html: block.te || "" }}
            />
          );
        }

        if (block.ty === "image" && block.url) {
          return (
            <figure key={key}>
              <img src={block.url} alt={block.alt || block.caption || "Maqola rasmi"} loading="lazy" />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          );
        }

        if (block.ty === "video" && block.url) {
          const isYoutube = /youtube\.com|youtu\.be/.test(block.url);
          if (isYoutube) {
            const id = block.url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)?.[1];
            return id ? (
              <div key={key} className="article-video-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title={block.title || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null;
          }

          return (
            <video key={key} controls preload="metadata" poster={block.alt || undefined}>
              <source src={block.url} />
            </video>
          );
        }

        if (block.ty === "file" && block.url) {
          return (
            <a key={key} href={block.url} target="_blank" rel="noopener noreferrer" className="article-file-card">
              <span>{block.title || "Faylni ochish"}</span>
              <small>{block.caption || "Yangi oynada ochiladi"}</small>
            </a>
          );
        }

        if (block.ty === "quote") {
          return (
            <blockquote key={key}>
              <p dangerouslySetInnerHTML={{ __html: block.te || "" }} />
              {block.author && <cite>{block.author}</cite>}
            </blockquote>
          );
        }

        return null;
      })}
    </div>
  );
}
