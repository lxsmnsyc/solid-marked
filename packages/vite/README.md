# vite-plugin-solid-marked

> Vite plugin for [`solid-marked`](https://github.com/lxsmnsyc/solid-marked), the MDX/Markdown compiler for SolidJS.

[![NPM](https://img.shields.io/npm/v/vite-plugin-solid-marked.svg)](https://www.npmjs.com/package/vite-plugin-solid-marked) [![Open in StackBlitz](https://img.shields.io/badge/Open%20in-StackBlitz-blue?style=flat-square&logo=stackblitz)](https://stackblitz.com/github/LXSMNSYC/solid-marked/tree/main/examples/vite-demo)

Import a Markdown or MDX file and get back a SolidJS component. This is a thin wrapper around [`unplugin-solid-marked`](https://github.com/lxsmnsyc/solid-marked/tree/main/packages/unplugin) — use that one for any bundler other than Vite.

📖 **[Full documentation](https://github.com/lxsmnsyc/solid-marked#readme)**

## Install

```bash
npm i solid-js solid-marked
npm i -D vite-plugin-solid-marked vite-plugin-solid
```

```bash
yarn add solid-js solid-marked
yarn add -D vite-plugin-solid-marked vite-plugin-solid
```

```bash
pnpm add solid-js solid-marked
pnpm add -D vite-plugin-solid-marked vite-plugin-solid
```

## Usage

`vite.config.js` — the Markdown plugin emits JSX, so it has to come **before** `vite-plugin-solid`.

```js
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import solidMarked from 'vite-plugin-solid-marked';

export default defineConfig({
  plugins: [solidMarked({}), solid()],
});
```

`.md`, `.mdx`, `.markdown`, `.mdown`, `.mkdn`, `.mkd`, `.mkdown` and `.ron` files are picked up. Each becomes a module exporting the document, a `TableOfContents` when it has headings, and `frontmatter` when it has YAML or TOML frontmatter:

```jsx
import Doc, { TableOfContents, frontmatter } from './doc.md';
```

A compiled document resolves its components at render time, so wrap it in an `<MDXProvider>` — see the [`solid-marked` docs](https://github.com/lxsmnsyc/solid-marked#quick-start) for the full setup, and [`examples/vite-demo`](https://github.com/lxsmnsyc/solid-marked/tree/main/examples/vite-demo) for a runnable project.

## Options

| Option                | Type                    | Default          | Description                                                                     |
| --------------------- | ----------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `source`              | `string`                | `'solid-marked'` | Module the generated code imports `useMDX` from. Point it at your own provider. |
| `noDynamicComponents` | `boolean \| 'only-mdx'` | `false`          | Controls where `<Dynamic>` is used in the output.                               |

## TypeScript

```ts
/// <reference types="solid-marked/env" />
```

> [!IMPORTANT]
> This package is ESM-only. Node 20.19+ and 22.12+ can `require()` it through `require(esm)`; older versions must `import` it.

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
