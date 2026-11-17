# unplugin-solid-marked

> [Unplugin](https://github.com/unjs/unplugin) for [`solid-marked`](https://github.com/lxsmnsyc/solid-marked), the MDX/Markdown compiler for SolidJS.

[![NPM](https://img.shields.io/npm/v/unplugin-solid-marked.svg)](https://www.npmjs.com/package/unplugin-solid-marked)

Import a Markdown or MDX file and get back a SolidJS component, in Vite, Rollup, Rolldown, webpack, Rspack, esbuild or Farm.

📖 **[Full documentation](https://github.com/lxsmnsyc/solid-marked#readme)**

## Install

```bash
npm i solid-js @solidjs/web solid-marked
npm i -D unplugin-solid-marked @solidjs/vite-plugin
```

```bash
yarn add solid-js @solidjs/web solid-marked
yarn add -D unplugin-solid-marked @solidjs/vite-plugin
```

```bash
pnpm add solid-js @solidjs/web solid-marked
pnpm add -D unplugin-solid-marked @solidjs/vite-plugin
```

> [!IMPORTANT]
> Version 1.x requires Solid 2. Stay on `unplugin-solid-marked@0.8.x` for Solid 1.

## Usage

The plugin emits JSX, so it has to run **before** the Solid JSX transform. See [`unplugin`](https://github.com/unjs/unplugin) for the full list of bundler entry points.

```js
import solid from '@solidjs/vite-plugin';
import solidMarked from 'unplugin-solid-marked';

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
