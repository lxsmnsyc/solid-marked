# vite-demo

Compile-time rendering: `Example.md` is imported as a module and turned into a
SolidJS component by [`vite-plugin-solid-marked`](../../packages/vite) at build
time. No Markdown parser ships to the browser.

```bash
pnpm install
pnpm run build            # build the workspace packages first
pnpm --filter vite-demo dev
```

What it shows:

- `<MDXProvider>` supplying the builtins in [`src/builtins.tsx`](src/builtins.tsx)
- `<TableOfContents />` used from inside the document itself
- MDX: the document is the project README, JSX and all
- Syntax highlighting of `<Code>` blocks with [shiki](https://shiki.style)
