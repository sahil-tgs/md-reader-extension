import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import hljs from "highlight.js/lib/common";
import DOMPurify from "dompurify";

const MD_EXT = /\.(md|mdx|markdown|mdown|mkd|mkdn)(?:[?#].*)?$/i;

function isMarkdownUrl(url: string): boolean {
  return MD_EXT.test(url);
}

function looksLikeRawTextDocument(): boolean {
  const body = document.body;
  if (!body) return false;
  const children = Array.from(body.children);
  if (children.length === 1 && children[0].tagName === "PRE") return true;
  if (children.length === 0 && body.textContent && body.textContent.trim().length > 0) return true;
  return false;
}

function extractRawMarkdown(): string {
  const pre = document.body?.querySelector(":scope > pre");
  if (pre && pre.textContent != null) return pre.textContent;
  return document.body?.textContent ?? "";
}

function buildMarked() {
  const m = new Marked();
  m.use(gfmHeadingId());
  m.use(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
        try {
          return hljs.highlight(code, { language, ignoreIllegals: true }).value;
        } catch {
          return code;
        }
      },
    }),
  );
  m.setOptions({ gfm: true, breaks: false });
  return m;
}

function fileTitleFromUrl(): string {
  try {
    const u = new URL(location.href);
    const last = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() ?? "");
    return last || "Markdown";
  } catch {
    return "Markdown";
  }
}

function makeToolbar(): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "md-reader-toolbar";

  const title = document.createElement("div");
  title.className = "md-reader-title";
  title.textContent = fileTitleFromUrl();

  const actions = document.createElement("div");
  actions.className = "md-reader-actions";

  const themeBtn = document.createElement("button");
  themeBtn.className = "md-reader-btn";
  themeBtn.type = "button";
  themeBtn.textContent = "Theme";
  themeBtn.addEventListener("click", () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-md-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-md-theme", next);
    try { localStorage.setItem("md-reader-theme", next); } catch {}
  });

  const rawBtn = document.createElement("button");
  rawBtn.className = "md-reader-btn";
  rawBtn.type = "button";
  rawBtn.textContent = "Raw";
  rawBtn.title = "View raw markdown source";
  rawBtn.addEventListener("click", () => {
    const root = document.documentElement;
    const raw = root.getAttribute("data-md-raw") === "1" ? "0" : "1";
    root.setAttribute("data-md-raw", raw);
    rawBtn.classList.toggle("md-reader-btn-active", raw === "1");
  });

  actions.append(themeBtn, rawBtn);
  bar.append(title, actions);
  return bar;
}

function injectHljsStyles() {
  const id = "md-reader-hljs-style";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = HLJS_CSS;
  document.head.appendChild(style);
}

function applySavedTheme() {
  try {
    const saved = localStorage.getItem("md-reader-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-md-theme", saved);
    }
  } catch {}
}

function setHashAfterRender() {
  if (!location.hash) return;
  const id = decodeURIComponent(location.hash.slice(1));
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  });
}

async function render() {
  if (!isMarkdownUrl(location.href)) return;
  if (!looksLikeRawTextDocument()) return;

  const raw = extractRawMarkdown();
  if (!raw.trim()) return;

  const marked = buildMarked();
  const dirtyHtml = await marked.parse(raw);
  const cleanHtml = DOMPurify.sanitize(dirtyHtml, {
    ADD_ATTR: ["target", "id"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|file|data):|[#/?])/i,
  });

  document.title = fileTitleFromUrl();
  document.documentElement.classList.add("md-reader-html");
  document.body.classList.add("md-reader-body");
  applySavedTheme();
  injectHljsStyles();

  const toolbar = makeToolbar();
  const rawPre = document.createElement("pre");
  rawPre.className = "md-reader-raw";
  rawPre.textContent = raw;

  const article = document.createElement("article");
  article.className = "md-reader markdown-body";
  article.innerHTML = cleanHtml;

  article.querySelectorAll("a[href]").forEach((a) => {
    const href = (a as HTMLAnchorElement).getAttribute("href") || "";
    if (/^https?:\/\//i.test(href)) {
      (a as HTMLAnchorElement).target = "_blank";
      (a as HTMLAnchorElement).rel = "noopener noreferrer";
    }
  });

  document.body.replaceChildren(toolbar, article, rawPre);

  setHashAfterRender();
}

const HLJS_CSS = `
.hljs{color:#24292e;background:transparent}
.hljs-comment,.hljs-quote{color:#6a737d}
.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#d73a49}
.hljs-number,.hljs-literal,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr{color:#005cc5}
.hljs-string,.hljs-doctag{color:#032f62}
.hljs-title,.hljs-section,.hljs-selector-id{color:#6f42c1}
.hljs-type,.hljs-class .hljs-title{color:#22863a}
.hljs-tag,.hljs-name,.hljs-attribute{color:#22863a}
.hljs-regexp,.hljs-link{color:#032f62}
.hljs-symbol,.hljs-bullet{color:#e36209}
.hljs-built_in,.hljs-builtin-name{color:#005cc5}
.hljs-meta{color:#6a737d}
.hljs-deletion{background:#ffeef0}
.hljs-addition{background:#f0fff4}
.hljs-emphasis{font-style:italic}
.hljs-strong{font-weight:600}
[data-md-theme="dark"] .hljs{color:#e6edf3}
[data-md-theme="dark"] .hljs-comment,[data-md-theme="dark"] .hljs-quote{color:#8b949e}
[data-md-theme="dark"] .hljs-keyword,[data-md-theme="dark"] .hljs-selector-tag,[data-md-theme="dark"] .hljs-subst{color:#ff7b72}
[data-md-theme="dark"] .hljs-number,[data-md-theme="dark"] .hljs-literal,[data-md-theme="dark"] .hljs-variable,[data-md-theme="dark"] .hljs-template-variable,[data-md-theme="dark"] .hljs-tag .hljs-attr{color:#79c0ff}
[data-md-theme="dark"] .hljs-string,[data-md-theme="dark"] .hljs-doctag{color:#a5d6ff}
[data-md-theme="dark"] .hljs-title,[data-md-theme="dark"] .hljs-section,[data-md-theme="dark"] .hljs-selector-id{color:#d2a8ff}
[data-md-theme="dark"] .hljs-type,[data-md-theme="dark"] .hljs-class .hljs-title{color:#7ee787}
[data-md-theme="dark"] .hljs-tag,[data-md-theme="dark"] .hljs-name,[data-md-theme="dark"] .hljs-attribute{color:#7ee787}
[data-md-theme="dark"] .hljs-regexp,[data-md-theme="dark"] .hljs-link{color:#a5d6ff}
[data-md-theme="dark"] .hljs-symbol,[data-md-theme="dark"] .hljs-bullet{color:#ffa657}
[data-md-theme="dark"] .hljs-built_in,[data-md-theme="dark"] .hljs-builtin-name{color:#79c0ff}
[data-md-theme="dark"] .hljs-meta{color:#8b949e}
[data-md-theme="dark"] .hljs-deletion{background:#67060c}
[data-md-theme="dark"] .hljs-addition{background:#033a16}
`;

void render();
