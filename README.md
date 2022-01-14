# solid-markdown

> MDX/Markdown compiler for SolidJS

[![NPM](https://img.shields.io/npm/v/solid-markdown.svg)](https://www.npmjs.com/package/solid-markdown) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/solid-markdown/tree/main/examples/solid-markdown-demo)

## Install

```bash
yarn add solid-js solid-markdown
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

### Using the compiler

```js
import { compile } from 'solid-markdown';

const { map, code } = await compile('my-file.md', '# Hello World');

console.log(code);

// Output:
// import { useMDXContext } from 'solid-markdown';

// export default function Component(props) {
//   const __ctx = useMDXContext();
//   return (
//     <Dynamic component={__ctx.builtins.Root}>
//       <Dynamic component={__ctx.builtins.Heading} depth={1}>Hello World</Dynamic>
//     </Dynamic>
//   );
// }
```

### `MDXProvider`

use `MDXProvider` for compiled Markdown components to receive the built-in components (e.g. Paragraph, Heading, etc.) and custom components.

```js
<MDXProvider
  builtins={{
    Paragraph: 'p'
  }}
>
  <CompiledMarkdownComponent />
</MDXProvider>
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
