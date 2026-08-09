"use client";

import { useEffect, useRef } from "react";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
}

function markdownToEditorHtml(value: string) {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (!paragraph.length) return;
    out.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length <= 2 ? "h2" : heading[1].length === 3 ? "h3" : "h4";
      out.push(`<${level}>${inlineMarkdown(heading[2])}</${level}>`);
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      out.push("<hr>");
      continue;
    }

    paragraph.push(line.trim());
  }

  flush();
  return out.join("");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(value);
}

function initialHtml(value: string) {
  if (!value) return "";
  return looksLikeHtml(value) ? value : markdownToEditorHtml(value);
}

function safeStyle(style: string) {
  const allowed: string[] = [];
  for (const declaration of style.split(";")) {
    const [rawName, ...rawValue] = declaration.split(":");
    const name = rawName?.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (!name || !value) continue;
    if (["font-weight", "font-style", "text-decoration", "font-size"].includes(name)) {
      if (/^[a-z0-9.\-\s%]+$/i.test(value)) allowed.push(`${name}:${value}`);
    }
  }
  return allowed.join(";");
}

function sanitizePastedHtml(html: string, plainText: string) {
  if (!html.trim()) return markdownToEditorHtml(plainText);

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const allowed = new Set([
    "P", "DIV", "BR", "H1", "H2", "H3", "H4", "STRONG", "B", "EM", "I", "U",
    "UL", "OL", "LI", "BLOCKQUOTE", "A", "SPAN", "HR", "CODE",
  ]);

  function clean(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const source = node as HTMLElement;
    if (!allowed.has(source.tagName)) {
      const fragment = document.createDocumentFragment();
      source.childNodes.forEach((child) => {
        const cleaned = clean(child);
        if (cleaned) fragment.appendChild(cleaned);
      });
      return fragment;
    }

    let tag = source.tagName.toLowerCase();
    if (tag === "h1") tag = "h2";
    if (tag === "b") tag = "strong";
    if (tag === "i") tag = "em";
    if (tag === "div") tag = "p";

    const element = document.createElement(tag);
    const style = safeStyle(source.getAttribute("style") || "");
    if (style && ["p", "span", "strong", "em"].includes(tag)) element.setAttribute("style", style);

    if (tag === "a") {
      const href = source.getAttribute("href") || "";
      if (/^(https?:|mailto:)/i.test(href)) {
        element.setAttribute("href", href);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    source.childNodes.forEach((child) => {
      const cleaned = clean(child);
      if (cleaned) element.appendChild(cleaned);
    });
    return element;
  }

  const wrapper = document.createElement("div");
  parsed.body.childNodes.forEach((child) => {
    const cleaned = clean(child);
    if (cleaned) wrapper.appendChild(cleaned);
  });
  return wrapper.innerHTML || markdownToEditorHtml(plainText);
}

function insertHtmlAtSelection(html: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  const last = fragment.lastChild;
  range.insertNode(fragment);
  if (last) {
    range.setStartAfter(last);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Maqola matnini kiriting yoki formatlangan matnni shu yerga paste qiling...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || document.activeElement === element) return;
    const next = initialHtml(value);
    if (element.innerHTML !== next) element.innerHTML = next;
  }, [value]);

  function command(name: string, argument?: string) {
    ref.current?.focus();
    document.execCommand(name, false, argument);
    onChange(ref.current?.innerHTML || "");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#0043a4]">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-[#f8fafc] p-2">
        <button type="button" onClick={() => command("formatBlock", "p")} className="rounded-lg bg-white px-3 py-2 text-xs font-bold shadow-sm">Oddiy</button>
        <button type="button" onClick={() => command("formatBlock", "h2")} className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm">Sarlavha</button>
        <button type="button" onClick={() => command("formatBlock", "h3")} className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold shadow-sm">Kichik sarlavha</button>
        <button type="button" onClick={() => command("bold")} className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm">B</button>
        <button type="button" onClick={() => command("italic")} className="rounded-lg bg-white px-3 py-2 text-xs italic shadow-sm">I</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onPaste={(event) => {
          event.preventDefault();
          const html = event.clipboardData.getData("text/html");
          const text = event.clipboardData.getData("text/plain");
          insertHtmlAtSelection(sanitizePastedHtml(html, text));
          onChange(ref.current?.innerHTML || "");
        }}
        className="rich-admin-editor min-h-64 px-4 py-4 text-base leading-7 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_h2]:mb-4 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-black [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-extrabold [&_p]:my-3 [&_strong]:font-black [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0043a4] [&_blockquote]:pl-4"
      />
    </div>
  );
}
