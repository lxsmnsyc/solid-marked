# unplugin-solid-marked

> [Unplugin](https://github.com/unjs/unplugin) for [`solid-marked`](https://github.com/lxsmnsyc/solid-marked), the MDX/Markdown compiler for SolidJS.

[![NPM](https://img.shields.io/npm/v/unplugin-solid-marked.svg)](https://www.npmjs.com/package/unplugin-solid-marked)

Import a Markdown or MDX file and get back a SolidJS component, in Vite, Rollup, Rolldown, webpack, Rspack, esbuild or Farm. On Vite you can use [`vite-plugin-solid-marked`](https://github.com/lxsmnsyc/solid-marked/tree/main/packages/vite) instead.

📖 **[Full documentation](https://github.com/lxsmnsyc/solid-marked#readme)**

## Install

```bash
npm i solid-js solid-marked
npm i -D unplugin-solid-marked vite-plugin-solid
```

```bash
yarn add solid-js solid-marked
yarn add -D unplugin-solid-marked vite-plugin-solid
```

```bash
pnpm add solid-js solid-marked
pnpm add -D unplugin-solid-marked vite-plugin-solid
```

## Usage

The plugin emits JSX, so it has to run **before** the Solid JSX transform. See [`unplugin`](https://github.com/unjs/unplugin) for the full list of bundler entry points.

```js
import solidMarked from 'unplugin-solid-marked';
import solid from 'vite-plugin-solid';

// Vite
export default {
  plugins: [solidMarked.vite({}), solid()],
};

// Rollup, webpack, ...
solidMarked.rollup({});
solidMarked.webpack({});
```

`.md`, `.mdx`, `.markdown`, `.mdown`, `.mkdn`, `.mkd`, `.mkdown` and `.ron` files are picked up. Each becomes a module exporting the document, a `TableOfContents` when it has headings, and `frontmatter` when it has YAML or TOML frontmatter:

```js
import Doc, { TableOfContents, frontmatter } from './doc.md';
```

A compiled document resolves its components at render time, so wrap it in an `<MDXProvider>` — see the [`solid-marked` docs](https://github.com/lxsmnsyc/solid-marked#quick-start).

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
