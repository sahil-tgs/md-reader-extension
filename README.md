# Markdown Reader (Chrome Extension)

Drop any `.md` file into Chrome and it renders with a clean, Notion-like layout — headings, GFM tables, task lists, code blocks with syntax highlighting, dark mode, anchor links, and a raw-source toggle.

## Install (developer mode)

```bash
bun install
bun run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and pick the [`dist/`](dist/) folder
4. Click **Details** on the extension card and turn on **Allow access to file URLs** (required for local `.md` files)

## Use it

- Drag any `.md` / `.markdown` / `.mdx` file into a Chrome tab — it renders automatically
- Or open a remote URL ending in `.md` (e.g. a raw GitHub URL)
- Toolbar:
  - **Theme** — toggles light/dark (saved per browser)
  - **Raw** — flips between rendered view and the original source

Try it with the included [`sample.md`](sample.md).

## How it works

- A content script runs at `document_end` on every URL
- It bails unless the URL ends in a markdown extension *and* the page looks like Chrome's plain-text view (a single `<pre>` containing the file)
- Markdown is parsed by [`marked`](https://github.com/markedjs/marked) (GFM enabled), code is highlighted by [`highlight.js`](https://highlightjs.org/), output is sanitized by [DOMPurify](https://github.com/cure53/DOMPurify), then injected into the body with the bundled stylesheet

## Project layout

```
src/
  content.ts     # main content script (bundled to dist/content.js)
  styles.css     # Notion-like theme (light + dark)
manifest.json    # MV3 manifest
build.ts         # bun-build script
dist/            # build output — load this in chrome://extensions
```

## Limitations

- Math (`$…$`) and Mermaid diagrams are **not** rendered — out of scope for v1
- Remote `.md` URLs only work if the server returns the file as `text/plain` or `text/markdown` (so Chrome shows it as a `<pre>` text view); GitHub-rendered HTML pages will not be re-rendered
- File-URL access requires the per-extension toggle in `chrome://extensions`
