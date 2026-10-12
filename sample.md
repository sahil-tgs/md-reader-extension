# Markdown Reader — Sample

> A quick sample to verify the extension renders things the way you expect.

## Headings, text & links

This is **bold**, this is *italic*, and this is ***both***. You can ~~strike text~~ and [link to Anthropic](https://www.anthropic.com).

Inline `code` looks like this. A keyboard shortcut: <kbd>⌘</kbd> + <kbd>K</kbd>.

## Lists

- Bullet one
- Bullet two
  - Nested
  - Another nested
- Bullet three

1. Ordered first
2. Ordered second
3. Ordered third

### Task list

- [x] Bundle marked + highlight.js
- [x] Notion-like styles
- [ ] Mermaid support (TBD)

## Code blocks

```ts
import { marked } from "marked";

export async function render(src: string): Promise<string> {
  return marked.parse(src, { gfm: true });
}
```

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Quote / callout

> "Simple things should be simple, complex things should be possible."
> — Alan Kay

## Table

| Feature        | Supported | Notes                   |
| -------------- | :-------: | ----------------------- |
| GFM            | ✅        | tables, strike, tasks   |
| Highlight      | ✅        | highlight.js (common)   |
| Sanitization   | ✅        | DOMPurify               |
| Math (KaTeX)   | ❌        | Out of scope for v1     |

## Image

![placeholder](https://via.placeholder.com/640x200.png?text=Markdown+Reader)

---

Drop another `.md` file into Chrome and it should render the same way.
