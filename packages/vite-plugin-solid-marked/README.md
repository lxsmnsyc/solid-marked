# vite-plugin-solid-marked

> Vite plugin for solid-marked, MDX/Markdown compiler for SolidJS

[![NPM](https://img.shields.io/npm/v/vite-plugin-solid-marked.svg)](https://www.npmjs.com/package/vite-plugin-solid-marked) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/solid-marked/tree/main/examples/vite-demo)

## Install

```bash
npm i -D solid-marked vite-plugin-solid-marked vite-plugin-solid
```

```bash
yarn add -D solid-marked vite-plugin-solid-marked vite-plugin-solid
```

```bash
pnpm add -D solid-marked vite-plugin-solid-marked vite-plugin-solid
```

## Features

- Supports Markdown and MDX
- [Github-flavored Markdown](https://github.github.com/gfm/) support
- Fully customizable
- [mdast](https://github.com/syntax-tree/mdast) compliant

### TBA

- Frontmatter
- Directive
- Table of Contents
- Math
- Support for plugins

## Usage

### Vite

`vite.config.js`

```js
import solidPlugin from 'vite-plugin-solid';
import solidMarkedPlugin from 'vite-plugin-solid-marked';

export default {
  plugins: [
    solidMarkedPlugin({
      // Module where `useMDX` is going to be imported.
      source: 'my-mdx-provider',
    }),
    solidPlugin(),
  ],
};
```

### `useMDX`

Components generated by `solid-marked` uses the fundamental components from an MDX provider, this is through the use of `useMDX` which is imported from the module.

Example module

```js
export function useMDX() {
  return {
    builtins: {
      Link(props) {
        return (
          <a href={props.url} title={props.title}>{props.children}</a>
        );
      },
    },
  };
}
```

### Typescript

```ts
/// <reference types="solid-marked/env">
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)