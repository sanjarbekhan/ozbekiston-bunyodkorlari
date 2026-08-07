import type { ContentBlock } from "@/lib/article-types";

function safeLevel(value?: number) {
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 2;
}

function plain(value?: string | null) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("uz");
}

function isMajorHeading(value?: string | null) {
  const text = plain(value);
  return [
    "qisqacha",
    "biografiya",
    "ta’lim",
    "ta'lim",
    "yutuq",
    "ilmiy faoliyat",
    "jamoatchilik",
    "faoliyati",
    "qadriyat",
    "qarash",
    "maqsad",
    "tavsiya",
    "xulosa",
  ].some((keyword) => text.includes(keyword));
}

function cleanLegacyHtml(html: string, title?: string | null, description?: string | null) {
  let output = html;
  const titlePlain = plain(title);
  const descriptionPlain = plain(description);

  const firstHeading = output.match(/<h[1-3]\b[^>]*>[\s\S]*?<\/h[1-3]>/i)?.[0];
  if (firstHeading && titlePlain && plain(firstHeading) === titlePlain) {
    output = output.replace(firstHeading, "");
  }

  const firstText = output.match(/<(?:div|p)\b[^>]*class=["'][^"']*t-redactor__text[^"']*["'][^>]*>[\s\S]*?<\/(?:div|p)>/i)?.[0];
  if (
    firstText &&
    descriptionPlain &&
    (plain(firstText) === descriptionPlain || plain(firstText).startsWith(descriptionPlain))
  ) {
    output = output.replace(firstText, "");
  }

  output = output.replace(
    /<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi,
    (match, attrs, inner) =>
      isMajorHeading(inner)
        ? match
        : `<h4 class="article-minor-heading"${attrs}>${inner}</h4>`
  );

  return output;
}

export default function ArticleContent({
  blocks,
  legacyHtml,
  articleTitle,
  articleDescription,
}: {
  blocks?: ContentBlock[] | null;
  legacyHtml?: string | null;
  articleTitle?: string | null;
  articleDescription?: string | null;
}) {
  const normalized = Array.isArray(blocks) ? blocks : [];

  if (normalized.length === 0 && legacyHtml) {
    return (
      <div
        className="article-rich-text"
        dangerouslySetInnerHTML={{
          __html: cleanLegacyHtml(legacyHtml, articleTitle, articleDescription),
        }}
      />
    );
  }

  const titlePlain = plain(articleTitle);
  const descriptionPlain = plain(articleDescription);
  let skippedTitle = false;
  let skippedDescription = false;

  return (
    <div className="article-rich-text">
      {normalized.map((block, index) => {
        const key = block.id || `${block.ty}-${index}`;
        const blockPlain = plain(block.te);

        if (
          block.ty === "heading" &&
          !skippedTitle &&
          titlePlain &&
          blockPlain === titlePlain
        ) {
          skippedTitle = true;
          return null;
        }

        if (
          ["text", "preface", "html"].includes(block.ty) &&
          !skippedDescription &&
          descriptionPlain &&
          (blockPlain === descriptionPlain || blockPlain.startsWith(descriptionPlain))
        ) {
          skippedDescription = true;
          return null;
        }

        if (block.ty === "heading") {
          const level = safeLevel(block.le);
          if (level === 4 || (level === 3 && !isMajorHeading(block.te))) {
            return <h4 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
          }
          if (level === 3) {
            return <h3 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
          }
          return <h2 key={key} dangerouslySetInnerHTML={{ __html: block.te || "" }} />;
        }

        if (["text", "preface", "html"].includes(block.ty)) {
          const html =
            block.ty === "html"
              ? cleanLegacyHtml(block.te || "", articleTitle, articleDescription)
              : block.te || "";
          return (
            <div
              key={key}
              className={block.ty === "preface" ? "article-preface" : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
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
            <a
              key={key}
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-file-card"
            >
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
