# solid-marked

> MDX/Markdown compiler for SolidJS

[![NPM](https://img.shields.io/npm/v/solid-marked.svg)](https://www.npmjs.com/package/solid-marked) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/solid-marked/tree/main/examples/vite-demo)

## Install

```bash
npm i solid-js
npm i -D solid-marked
```

```bash
yarn add solid-js
yarn add -D solid-marked
```

```bash
pnpm add solid-js
pnpm add -D solid-marked
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

### Plugins

- [Vite](https://github.com/LXSMNSYC/solid-marked/tree/main/packages/vite-plugin-solid-marked)

### Using the compiler

```js
import { compile } from 'solid-marked';

const { map, code } = await compile(
  'mdx-provider',  // Where to import the builtin components
  'my-file.md',    // Name of the file
  '# Hello World', // Markdown code
);

console.log(code);

// Output:
// import { useMDX } from 'mdx-provider';

// export default function Component(props) {
//   const __ctx = useMDX();
//   return (
//     <Dynamic component={__ctx.builtins.Root}>
//       <Dynamic component={__ctx.builtins.Heading} depth={1}>Hello World</Dynamic>
//     </Dynamic>
//   );
// }
```

### `useMDX`

Components generated by `solid-marked` uses the fundamental components from an MDX provider, this is through the use of `useMDX` which is imported from the module.

### Typescript

```ts
/// <reference types="solid-marked/env">
```

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

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)