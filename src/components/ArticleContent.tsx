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
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[\*_`~]/g, "")
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value: string) {
  let output = escapeHtml(value);

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  output = output.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  output = output.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  output = output.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return output;
}

function trimPublicMarkdown(
  markdown: string,
  articleTitle?: string | null,
  articleDescription?: string | null
) {
  let value = markdown.replace(/\r\n?/g, "\n").trim();

  // SEO fields belong to article metadata, not the public article body.
  value = value.split(/^#{1,6}\s+SEO and Social Networks\s*$/im)[0].trim();

  const lines = value.split("\n");
  const titlePlain = plain(articleTitle);
  const descriptionPlain = plain(articleDescription);

  while (lines.length && !lines[0].trim()) lines.shift();

  if (lines.length && titlePlain && plain(lines[0]) === titlePlain) {
    lines.shift();
    while (lines.length && !lines[0].trim()) lines.shift();
  }

  if (descriptionPlain) {
    const firstParagraph: string[] = [];
    let index = 0;
    while (index < lines.length && lines[index].trim()) {
      firstParagraph.push(lines[index]);
      index += 1;
    }
    if (firstParagraph.length && plain(firstParagraph.join(" ")) === descriptionPlain) {
      lines.splice(0, index);
      while (lines.length && !lines[0].trim()) lines.shift();
    }
  }

  return lines.join("\n").trim();
}

function markdownToHtml(
  markdown: string,
  articleTitle?: string | null,
  articleDescription?: string | null
) {
  const source = trimPublicMarkdown(markdown, articleTitle, articleDescription);
  if (!source) return "";

  const lines = source.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let quote: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map(inlineMarkdown).join("<br />")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    html.push(
      `<${listType}>${listItems
        .map((item) => `<li>${inlineMarkdown(item)}</li>`)
        .join("")}</${listType}>`
    );
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote><p>${quote.map(inlineMarkdown).join("<br />")}</p></blockquote>`);
    quote = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      const markdownLevel = heading[1].length;
      const tag = markdownLevel <= 2 ? "h2" : markdownLevel === 3 ? "h3" : "h4";
      html.push(`<${tag}>${inlineMarkdown(heading[2])}</${tag}>`);
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      html.push("<hr />");
      continue;
    }

    const unordered = trimmed.match(/^[-+*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(ordered[1]);
      continue;
    }

    if (trimmed.startsWith("> ") || trimmed === ">") {
      flushParagraph();
      flushList();
      quote.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushQuote();

  return html.join("\n");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(value);
}

function cleanLegacyHtml(
  html: string,
  title?: string | null,
  description?: string | null
) {
  let output = html;
  const titlePlain = plain(title);
  const descriptionPlain = plain(description);

  const firstHeading = output.match(/<h[1-3]\b[^>]*>[\s\S]*?<\/h[1-3]>/i)?.[0];
  if (firstHeading && titlePlain && plain(firstHeading) === titlePlain) {
    output = output.replace(firstHeading, "");
  }

  const firstText = output.match(
    /<(?:div|p)\b[^>]*class=["'][^"']*t-redactor__text[^"']*["'][^>]*>[\s\S]*?<\/(?:div|p)>/i
  )?.[0];
  if (
    firstText &&
    descriptionPlain &&
    (plain(firstText) === descriptionPlain ||
      plain(firstText).startsWith(descriptionPlain))
  ) {
    output = output.replace(firstText, "");
  }

  output = output.replace(
    /<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi,
    (match, attrs, inner) => {
      if (isMajorHeading(inner)) return match;
      const cleanAttrs = String(attrs).replace(/\sclass=(['"])[\s\S]*?\1/i, "");
      return `<h4 class="article-minor-heading"${cleanAttrs}>${inner}</h4>`;
    }
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
          blockPlain === descriptionPlain
        ) {
          skippedDescription = true;
          return null;
        }

        if (block.ty === "heading") {
          const level = safeLevel(block.le);
          if (level === 4 || (level === 3 && !isMajorHeading(block.te))) {
            return (
              <h4
                key={key}
                className="article-minor-heading"
                dangerouslySetInnerHTML={{ __html: block.te || "" }}
              />
            );
          }
          if (level === 3) {
            return (
              <h3
                key={key}
                dangerouslySetInnerHTML={{ __html: block.te || "" }}
              />
            );
          }
          return (
            <h2
              key={key}
              dangerouslySetInnerHTML={{ __html: block.te || "" }}
            />
          );
        }

        if (["text", "preface", "html"].includes(block.ty)) {
          const value = block.te || "";
          const html =
            block.ty === "html" || looksLikeHtml(value)
              ? cleanLegacyHtml(value, articleTitle, articleDescription)
              : markdownToHtml(value, articleTitle, articleDescription);
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
              <img
                src={block.url}
                alt={block.alt || block.caption || "Maqola rasmi"}
                loading="lazy"
              />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          );
        }

        if (block.ty === "video" && block.url) {
          const isYoutube = /youtube\.com|youtu\.be/.test(block.url);
          if (isYoutube) {
            const id = block.url.match(
              /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/
            )?.[1];
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
            <video
              key={key}
              controls
              preload="metadata"
              poster={block.alt || undefined}
            >
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
