# component-demo

Runtime rendering: `Example.md` is imported as a raw string with Vite's `?raw`
suffix and rendered by `<Markdown>` from `solid-marked/component`. Use this
approach when the source is only known at runtime.

```bash
pnpm install
pnpm run build                 # build the workspace packages first
pnpm --filter component-demo dev
```

What it shows:

- `<Markdown>` with the builtins in [`src/builtins.tsx`](src/builtins.tsx)
- CommonMark and GFM: tables, task lists, footnotes, strikethrough
- Raw HTML handed to the `<HTML>` builtin rather than injected
- Syntax highlighting of `<Code>` blocks with [shiki](https://shiki.style)

MDX and frontmatter are **not** supported on this path — the document here is
plain CommonMark/GFM, unlike the one in [`vite-demo`](../vite-demo).
