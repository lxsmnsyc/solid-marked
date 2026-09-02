# solid-marked

> MDX/Markdown compiler for SolidJS

[![NPM](https://img.shields.io/npm/v/solid-marked.svg)](https://www.npmjs.com/package/solid-marked) [![Open in StackBlitz](https://img.shields.io/badge/Open%20in-StackBlitz-blue?style=flat-square&logo=stackblitz)](https://stackblitz.com/github/LXSMNSYC/solid-marked/tree/main/examples/vite-demo)

`solid-marked` compiles a Markdown or MDX document into a SolidJS component. Every Markdown construct is rendered through a component **you** provide, so the result is ordinary Solid JSX: no Markdown parser ships to the browser, nothing is injected with `innerHTML`, and the markup is yours to style.

📖 **[Full documentation](https://github.com/lxsmnsyc/solid-marked#readme)** — every builtin, its props, and the code each one compiles to.

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

To `import` Markdown files you also need a bundler plugin — [`vite-plugin-solid-marked`](https://github.com/lxsmnsyc/solid-marked/tree/main/packages/vite) for Vite, or [`unplugin-solid-marked`](https://github.com/lxsmnsyc/solid-marked/tree/main/packages/unplugin) for Rollup, Rolldown, webpack, Rspack, esbuild and Farm.

## Usage

`vite.config.js` — the Markdown plugin emits JSX, so it has to come **before** the Solid plugin.

```js
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import solidMarked from 'vite-plugin-solid-marked';

export default defineConfig({
  plugins: [solidMarked({}), solid()],
});
```

A compiled document renders nothing on its own: it resolves its components from the nearest `<MDXProvider>` at render time.

```jsx
import { Dynamic, render } from 'solid-js/web';
import { MDXProvider } from 'solid-marked';
import Hello from './hello.md';

function App() {
  return (
    <MDXProvider
      builtins={{
        Root: props => <article>{props.children}</article>,
        Heading: props => (
          <Dynamic component={`h${props.depth}`} id={props.id}>
            {props.children}
          </Dynamic>
        ),
        Paragraph: props => <p>{props.children}</p>,
      }}
    >
      <Hello />
    </MDXProvider>
  );
}

render(() => <App />, document.getElementById('app'));
```

Every builtin is optional — a construct whose builtin is missing renders nothing, so you can start with `Root`, `Heading` and `Paragraph` and grow from there. There are 24 in total, listed in the [full documentation](https://github.com/lxsmnsyc/solid-marked#builtin-components).

Each markdown module exports the document, a `TableOfContents` when it has headings, and `frontmatter` when it has YAML or TOML frontmatter:

```js
import Doc, { TableOfContents, frontmatter } from './doc.md';
```

## Entry points

| Entry point              | What it is                                                              |
| ------------------------ | ----------------------------------------------------------------------- |
| `solid-marked`           | `MDXProvider`, `useMDX`, and the prop types.                            |
| `solid-marked/compiler`  | `compile(fileName, code, options?)`, for calling the compiler yourself. |
| `solid-marked/component` | `<Markdown>`, for rendering a Markdown string at runtime.               |
| `solid-marked/env`       | Ambient declarations, so `import Doc from './doc.md'` type-checks.      |

## Features

- Markdown and [MDX](https://mdxjs.com/)
- [Github-flavored Markdown](https://github.github.com/gfm/): tables, task lists, strikethrough, footnotes, autolinks
- YAML and TOML frontmatter
- A generated `TableOfContents`
- Runtime rendering through `<Markdown>`
- Source maps back to the original document
- [mdast](https://github.com/syntax-tree/mdast) compliant

Not supported yet: directives, math, and remark/rehype plugins.

## TypeScript

Reference the ambient module declarations once, so `import Doc from './doc.md'` type-checks:

```ts
/// <reference types="solid-marked/env" />
```

> [!IMPORTANT]
> This package is ESM-only, as is the `mdast`/`micromark` stack it builds on. Node 20.19+ and 22.12+ can `require()` it through `require(esm)`; older versions must `import` it.

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
