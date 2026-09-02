# solid-marked

> MDX/Markdown compiler for SolidJS

[![NPM](https://img.shields.io/npm/v/solid-marked.svg)](https://www.npmjs.com/package/solid-marked) [![Open in StackBlitz](https://img.shields.io/badge/Open%20in-StackBlitz-blue?style=flat-square&logo=stackblitz)](https://stackblitz.com/github/LXSMNSYC/solid-marked/tree/main/examples/vite-demo)

`solid-marked` compiles a Markdown or MDX document into a SolidJS component. Every Markdown construct is rendered through a component **you** provide, so the result is ordinary Solid JSX: no Markdown parser ships to the browser, nothing is injected with `innerHTML`, and the markup is yours to style.

```md
> Hello **world**
```

```jsx
<Dynamic component={_ctx$.builtins.Blockquote}>
  <Dynamic component={_ctx$.builtins.Paragraph}>
    Hello <Dynamic component={_ctx$.builtins.Strong}>world</Dynamic>
  </Dynamic>
</Dynamic>
```

<TableOfContents />

## Install

`solid-marked` is the compiler and runtime. To `import` Markdown files directly you also need a bundler plugin, and `vite-plugin-solid` (or another Solid JSX transform) to compile the JSX that `solid-marked` emits.

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

### Integrations

| Package                                                                                         | Use it for                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`vite-plugin-solid-marked`](https://github.com/LXSMNSYC/solid-marked/tree/main/packages/vite)  | Vite only. Thin wrapper around the unplugin.                                    |
| [`unplugin-solid-marked`](https://github.com/LXSMNSYC/solid-marked/tree/main/packages/unplugin) | Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm.                         |
| `solid-marked/compiler`                                                                         | Calling the compiler yourself, e.g. from a custom loader or a static generator. |

Both plugins pick up `.md`, `.mdx`, `.markdown`, `.mdown`, `.mkdn`, `.mkd`, `.mkdown` and `.ron`.

## Quick start

`vite.config.js` — the Markdown plugin must come **before** the Solid plugin, since it emits JSX for the Solid plugin to transform.

```js
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import solidMarked from 'vite-plugin-solid-marked';

export default defineConfig({
  plugins: [solidMarked({}), solid()],
});
```

`src/hello.md`

```md
# Hello World

Lorem ipsum dolor.
```

`src/main.tsx` — a compiled document renders nothing on its own: it looks its components up from the nearest `<MDXProvider>`.

```jsx
import { render } from 'solid-js/web';
import { Dynamic } from 'solid-js/web';
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

Every builtin is optional. A construct whose builtin is missing renders nothing, so you can start with `Root`, `Heading` and `Paragraph` and fill in the rest as your documents grow. See [Builtin components](#builtin-components) for the full list.

Two runnable projects live in [`examples/`](https://github.com/LXSMNSYC/solid-marked/tree/main/examples): `vite-demo` (compile-time, via the Vite plugin) and `component-demo` (runtime, via `<Markdown>`).

## How it works

1. The document is parsed into an [`mdast`](https://github.com/syntax-tree/mdast#nodes) tree with `micromark`, including GFM, MDX and frontmatter extensions.
2. Each node is emitted as JSX that resolves its component from `useMDX()` at render time, rather than being hard-wired to an HTML tag.
3. The module that comes out exports:
   - `default` — the document component.
   - `TableOfContents` — generated when the document has headings.
   - `frontmatter` — the parsed YAML/TOML frontmatter, when present.
4. Your bundler's Solid plugin transforms that JSX like any other Solid component, so the document is compiled, tree-shaken and minified along with the rest of your app.

> [!IMPORTANT]
> `solid-marked` and its plugins are ESM-only, as is the `mdast`/`micromark` stack they build on. Node 20.19+ and 22.12+ can `require()` them through `require(esm)`; older versions must `import` them.

> [!NOTE]
> The generated code shown throughout this README is formatted for readability. The compiler emits it on a single line with a source map.

## API

### `compile`

Compiles a Markdown/MDX source string. Synchronous.

```js
import { compile } from 'solid-marked/compiler';

const { code, map } = compile(
  'my-file.md', // Name of the file, used for the source map
  '# Hello World', // Markdown code
  {
    mdxImportSource: 'mdx-provider',
    noDynamicComponents: 'only-mdx',
  },
);

console.log(code);
```

**Parameters**

| Parameter      | Type      | Description                                                                  |
| -------------- | --------- | ---------------------------------------------------------------------------- |
| `fileName`     | `string`  | Name recorded in the source map, and the key for its `sourcesContent` entry. |
| `markdownCode` | `string`  | The document source.                                                         |
| `options`      | `Options` | Optional. See below.                                                         |

**Options**

| Option                | Type                    | Default          | Description                                                                            |
| --------------------- | ----------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `mdxImportSource`     | `string`                | `'solid-marked'` | Module the generated code imports `useMDX` from. Point it at your own provider module. |
| `noDynamicComponents` | `boolean \| 'only-mdx'` | `false`          | Controls where `<Dynamic>` is used. See [MDX](#mdx) for the three modes side by side.  |

**Returns** `{ code: string; map: RawSourceMap }`.

### `MDXProvider` and `useMDX`

A compiled document resolves its components through `useMDX()`. By default that hook is imported from `solid-marked` and reads the nearest `<MDXProvider>`:

```jsx
import { MDXProvider } from 'solid-marked';

<MDXProvider
  builtins={{
    Heading(props) {
      return <Dynamic component={`h${props.depth}`}>{props.children}</Dynamic>;
    },
  }}
  components={{
    // JSX elements used inside MDX documents
    Callout: props => <aside>{props.children}</aside>,
  }}
>
  <App />
</MDXProvider>;
```

| Prop         | Type                        | Description                                                         |
| ------------ | --------------------------- | ------------------------------------------------------------------- |
| `builtins`   | `MDXBuiltinComponents`      | Components for Markdown constructs. Every entry is optional.        |
| `components` | `Record<string, Component>` | Components for JSX elements written inside MDX documents. Optional. |

`useMDX()` throws `Missing MDXProvider` when called outside a provider.

Set `mdxImportSource` if you would rather supply the components yourself — anything exporting a `useMDX` function will do, which lets you skip the context lookup entirely:

```jsx
export function useMDX() {
  return {
    builtins: {
      Link(props) {
        return (
          <a href={props.url} title={props.title}>
            {props.children}
          </a>
        );
      },
    },
  };
}
```

### `<Markdown>`

Everything above happens at build time. When the source is only known at runtime — fetched from an API, typed into a textarea, stored in a database — render it with the `<Markdown>` component instead. It takes the same `builtins`, so a set of components can be shared between both paths.

```jsx
import Markdown from 'solid-marked/component';

const content = (
  <Markdown
    builtins={{
      Root: props => <div>{props.children}</div>,
      Blockquote: props => <blockquote>{props.children}</blockquote>,
      Paragraph: props => <p>{props.children}</p>,
    }}
  >
    {'> This is a blockquote.'}
  </Markdown>
);
```

| Prop         | Type                        | Description                                     |
| ------------ | --------------------------- | ----------------------------------------------- |
| `children`   | `string`                    | The Markdown source. Re-parsed when it changes. |
| `builtins`   | `MDXBuiltinComponents`      | Components for Markdown constructs.             |
| `components` | `Record<string, Component>` | Accepted for parity; unused at runtime.         |

> [!NOTE]
> `<Markdown>` supports CommonMark and GFM only. MDX expressions and frontmatter are not parsed, and a document containing them throws while rendering. Raw HTML is **not** injected into the page — it is handed to the [`<HTML>`](#html) builtin as a string, so escaping it or rendering it is your decision.

## Features

### Builtin components

`builtins` maps Markdown constructs to your components. Every entry is optional: when a builtin is missing, that construct renders nothing. All prop types are exported from `solid-marked`.

| Builtin              | `mdast` node         | Props                                              |
| -------------------- | -------------------- | -------------------------------------------------- |
| `Root`               | `root`               | `children`                                         |
| `Paragraph`          | `paragraph`          | `children`                                         |
| `Heading`            | `heading`            | `children`, `depth` (`1`–`6`), `id`                |
| `ThematicBreak`      | `thematicBreak`      | —                                                  |
| `Blockquote`         | `blockquote`         | `children`                                         |
| `List`               | `list`               | `children`, `ordered`, `spread`, `start`           |
| `ListItem`           | `listItem`           | `children`, `checked`, `spread`                    |
| `Code`               | `code`               | `children` (string), `lang`, `meta`                |
| `InlineCode`         | `inlineCode`         | `children` (string)                                |
| `HTML`               | `html`               | `children` (string)                                |
| `Definition`         | `definition`         | `url`, `title`, `identifier`, `label`              |
| `Emphasis`           | `emphasis`           | `children`                                         |
| `Strong`             | `strong`             | `children`                                         |
| `Break`              | `break`              | —                                                  |
| `Link`               | `link`               | `children`, `url`, `title`                         |
| `Image`              | `image`              | `url`, `title`, `alt`                              |
| `LinkReference`      | `linkReference`      | `children`, `identifier`, `label`, `referenceType` |
| `ImageReference`     | `imageReference`     | `identifier`, `label`, `referenceType`, `alt`      |
| `FootnoteDefinition` | `footnoteDefinition` | `children`, `identifier`, `label`                  |
| `FootnoteReference`  | `footnoteReference`  | `identifier`, `label`                              |
| `Table`              | `table`              | `children`, `align`                                |
| `TableRow`           | `tableRow`           | `children`, `isHead`                               |
| `TableCell`          | `tableCell`          | `children`                                         |
| `Delete`             | `delete`             | `children`                                         |

`Table`, `TableRow`, `TableCell`, `Delete`, `FootnoteDefinition` and `FootnoteReference` are [GFM](https://github.github.com/gfm/) constructs. The remaining ones are CommonMark.

The sections below show, for each builtin, the Markdown that produces it and the code the compiler emits.

### `<Root>`

`<Root>` wraps the whole document. It is the only builtin that is not tied to a piece of Markdown syntax, and it is where an `<article>`, a `class` or a `prose` wrapper usually goes.

### Markdown

The components below, and their prop definitions, are derived from [`mdast`](https://github.com/syntax-tree/mdast#nodes).

#### `<Paragraph>`

```md
Lorem ipsum dolor.
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>Lorem ipsum dolor.</Dynamic>
    </Dynamic>
  );
}
```

#### `<Heading>`

> [!NOTE]
> Presence of a `<Heading>` allows the Markdown component to generate a `<TableOfContents>`.

```md
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Heading} depth={1} id={'heading-1'}>
        Heading 1
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={2} id={'heading-2'}>
        Heading 2
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={3} id={'heading-3'}>
        Heading 3
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={4} id={'heading-4'}>
        Heading 4
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={5} id={'heading-5'}>
        Heading 5
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={6} id={'heading-6'}>
        Heading 6
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<ThematicBreak>`

```md
Lorem

---

Ipsum

---

Dolor
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>Lorem</Dynamic>
      <Dynamic component={_ctx$.builtins.ThematicBreak} />
      <Dynamic component={_ctx$.builtins.Paragraph}>Ipsum</Dynamic>
      <Dynamic component={_ctx$.builtins.ThematicBreak} />
      <Dynamic component={_ctx$.builtins.Paragraph}>Dolor</Dynamic>
    </Dynamic>
  );
}
```

#### `<Blockquote>`

```md
> Lorem ipsum dolor.
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Blockquote}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          Lorem ipsum dolor.
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<List>` and `<ListItem>`

##### Ordered lists

```md
1. Lorem
2. Ipsum
3. Dolor
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.List}
        ordered={true}
        spread={false}
        start={1}
      >
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Lorem</Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Ipsum</Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Dolor</Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

##### Unordered lists

```md
- Lorem
- Ipsum
- Dolor
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.List} ordered={false} spread={false}>
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Lorem</Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Ipsum</Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
          <Dynamic component={_ctx$.builtins.Paragraph}>Dolor</Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Code>`

````md
```js highlight-line="2"
foo();
bar();
baz();
```
````

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.Code}
        lang={'js'}
        meta={'highlight-line="2"'}
      >
        {'foo()\nbar()\nbaz()'}
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Definition>`

```md
[Github]: https://github.com
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.Definition}
        url={'https://github.com'}
        identifier={'github'}
        label={'Github'}
      />
    </Dynamic>
  );
}
```

#### `<Emphasis>`

```md
_alpha_ _bravo_
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic component={_ctx$.builtins.Emphasis}>alpha</Dynamic>{' '}
        <Dynamic component={_ctx$.builtins.Emphasis}>bravo</Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Strong>`

```md
**alpha** **bravo**
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic component={_ctx$.builtins.Strong}>alpha</Dynamic>{' '}
        <Dynamic component={_ctx$.builtins.Strong}>bravo</Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<InlineCode>`

```md
`foo()`
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic component={_ctx$.builtins.InlineCode}>{'foo()'}</Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Break>`

```md
a  
b
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        a<Dynamic component={_ctx$.builtins.Break} />b
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Link>`

```md
[alpha](https://example.com 'bravo')
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic
          component={_ctx$.builtins.Link}
          url={'https://example.com'}
          title={'bravo'}
        >
          alpha
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Image>`

```md
![alpha](https://example.com/favicon.ico 'bravo')
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic
          component={_ctx$.builtins.Image}
          url={'https://example.com/favicon.ico'}
          title={'bravo'}
          alt={'alpha'}
        />
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<LinkReference>`

Must be have an associated `<Definition>`.

```md
[This is an example][alpha]

[alpha]: bravo
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic
          component={_ctx$.builtins.LinkReference}
          identifier={'alpha'}
          label={'alpha'}
          referenceType={'full'}
        >
          This is an example
        </Dynamic>
      </Dynamic>
      <Dynamic
        component={_ctx$.builtins.Definition}
        url={'bravo'}
        identifier={'alpha'}
        label={'alpha'}
      />
    </Dynamic>
  );
}
```

#### `<ImageReference>`

Must be have an associated `<Definition>`.

```md
![This is an example][alpha]

[alpha]: bravo
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic
          component={_ctx$.builtins.ImageReference}
          identifier={'alpha'}
          label={'alpha'}
          referenceType={'full'}
          alt={'This is an example'}
        />
      </Dynamic>
      <Dynamic
        component={_ctx$.builtins.Definition}
        url={'bravo'}
        identifier={'alpha'}
        label={'alpha'}
      />
    </Dynamic>
  );
}
```

#### `<HTML>`

Raw HTML in a Markdown document is passed to the `<HTML>` builtin as a string.

> [!NOTE]
> The compiler parses documents as MDX, so raw HTML becomes a JSX expression
> there. `<HTML>` is only reached by the runtime `<Markdown>` component, which
> parses CommonMark and GFM.

```md
<div>Hello World</div>
```

```js
<Dynamic component={_ctx$.builtins.HTML}>{'<div>Hello World</div>'}</Dynamic>
```

### Github-flavored Markdown

These constructs come from [Github-flavored Markdown](https://github.github.com/gfm/) and are enabled by default, in both the compiler and the runtime `<Markdown>` component.

#### `<FootnoteDefinition>`

```md
[^alpha]: bravo and charlie.
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.FootnoteDefinition}
        identifier={'alpha'}
        label={'alpha'}
      >
        <Dynamic component={_ctx$.builtins.Paragraph}>
          bravo and charlie.
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<FootnoteReference>`

Must have an associated `<FootnoteDefinition>`

```md
[^alpha]

[^alpha]: bravo and charlie.
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic
          component={_ctx$.builtins.FootnoteReference}
          identifier={'alpha'}
          label={'alpha'}
        />
      </Dynamic>
      <Dynamic
        component={_ctx$.builtins.FootnoteDefinition}
        identifier={'alpha'}
        label={'alpha'}
      >
        <Dynamic component={_ctx$.builtins.Paragraph}>
          bravo and charlie.
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Table>`, `<TableRow>` and `<TableCell>`

```md
| first | second | third |
| :---- | :----: | ----: |
| foo   |  bar   |   baz |
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.Table}
        align={['left', 'center', 'right']}
      >
        <Dynamic component={_ctx$.builtins.TableRow} isHead={true}>
          <Dynamic component={_ctx$.builtins.TableCell}>first</Dynamic>
          <Dynamic component={_ctx$.builtins.TableCell}>second</Dynamic>
          <Dynamic component={_ctx$.builtins.TableCell}>third</Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.TableRow}>
          <Dynamic component={_ctx$.builtins.TableCell}>foo</Dynamic>
          <Dynamic component={_ctx$.builtins.TableCell}>bar</Dynamic>
          <Dynamic component={_ctx$.builtins.TableCell}>baz</Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

#### `<Delete>`

```md
~~alpha~~
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Paragraph}>
        <Dynamic component={_ctx$.builtins.Delete}>alpha</Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
```

### MDX

`solid-marked` supports [MDX](https://mdxjs.com/): a document may contain `import`/`export` statements, JSX elements and `{expressions}`.

An element written in MDX is resolved in one of two ways. If a binding with that name is in scope — imported at the top of the document, say — it is used directly. Otherwise it is looked up in `components` from `useMDX()`, which is how a provider supplies elements that documents never import.

The `noDynamicComponents` option decides how much of that indirection is emitted. Given this document:

```js
<Example>Hello World</Example>
```

- if set to `true`, the output JSX will not use SolidJS' `<Dynamic>` component and instead outputs the target JSX component directly to the markup.
  ```js
  import { useMDX as _useMDX$ } from 'solid-marked';

  export default function Component(props) {
    const _ctx$ = _useMDX$();
    return (
      <_ctx$.builtins.Root>
        <_ctx$.builtins.Paragraph>
          <Example>Hello World</Example>
        </_ctx$.builtins.Paragraph>
      </_ctx$.builtins.Root>
    );
  }
  ```
- if set to `false`, the output will use `<Dynamic>`. If an HTML or JSX expression is encountered, the element will be checked if it's not declared, in which it will use its counterpart component from `useMDX`, otherwise it will use the component/element directly.
  ```js
  import { useMDX as _useMDX$ } from 'solid-marked';

  export default function Component(props) {
    const _ctx$ = _useMDX$();
    return (
      <Dynamic component={_ctx$.builtins.Root}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Dynamic
            component={
              typeof Example === 'undefined'
                ? _ctx$.components.Example
                : Example
            }
          >
            Hello World
          </Dynamic>
        </Dynamic>
      </Dynamic>
    );
  }
  ```
- if set to `only-mdx`, `<Dynamic>` is only used for builtin components while HTML/JSX expressions will be used directly.
  ```js
  import { useMDX as _useMDX$ } from 'solid-marked';

  export default function Component(props) {
    const _ctx$ = _useMDX$();
    return (
      <Dynamic component={_ctx$.builtins.Root}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Example>Hello World</Example>
        </Dynamic>
      </Dynamic>
    );
  }
  ```

### `<TableOfContents>`

When a document contains headings, the compiler also emits a `TableOfContents` export: a nested list of links to every heading, built from the same slugged `id`s that `<Heading>` receives. It is rendered with your `List`, `ListItem`, `Paragraph` and `Link` builtins, so it needs no extra components.

Use it from the importing module:

```jsx
import Doc, { TableOfContents } from './doc.md';

<aside>
  <TableOfContents />
</aside>;
```

Or from inside the document itself. `TableOfContents` is declared in the same module the document compiles to, so an MDX document can reference it without importing or registering anything:

```mdx
<TableOfContents />

# foo
```

Duplicate headings get suffixed slugs (`#lorem`, `#lorem-1`, `#lorem-2`), matching [`github-slugger`](https://github.com/Flet/github-slugger).

```md
# foo

## bar

### baz

# alpha

## bravo

### charlie
```

```js
import { useMDX as _useMDX$ } from 'solid-marked';

export function TableOfContents(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.List} ordered={false} spread={true}>
      <Dynamic component={_ctx$.builtins.ListItem} spread={true}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Dynamic component={_ctx$.builtins.Link} url={'#foo'}>
            foo
          </Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.List} ordered={false} spread={true}>
          <Dynamic component={_ctx$.builtins.ListItem} spread={true}>
            <Dynamic component={_ctx$.builtins.Paragraph}>
              <Dynamic component={_ctx$.builtins.Link} url={'#bar'}>
                bar
              </Dynamic>
            </Dynamic>
            <Dynamic
              component={_ctx$.builtins.List}
              ordered={false}
              spread={false}
            >
              <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
                <Dynamic component={_ctx$.builtins.Paragraph}>
                  <Dynamic component={_ctx$.builtins.Link} url={'#baz'}>
                    baz
                  </Dynamic>
                </Dynamic>
              </Dynamic>
            </Dynamic>
          </Dynamic>
        </Dynamic>
      </Dynamic>
      <Dynamic component={_ctx$.builtins.ListItem} spread={true}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Dynamic component={_ctx$.builtins.Link} url={'#alpha'}>
            alpha
          </Dynamic>
        </Dynamic>
        <Dynamic component={_ctx$.builtins.List} ordered={false} spread={true}>
          <Dynamic component={_ctx$.builtins.ListItem} spread={true}>
            <Dynamic component={_ctx$.builtins.Paragraph}>
              <Dynamic component={_ctx$.builtins.Link} url={'#bravo'}>
                bravo
              </Dynamic>
            </Dynamic>
            <Dynamic
              component={_ctx$.builtins.List}
              ordered={false}
              spread={false}
            >
              <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
                <Dynamic component={_ctx$.builtins.Paragraph}>
                  <Dynamic component={_ctx$.builtins.Link} url={'#charlie'}>
                    charlie
                  </Dynamic>
                </Dynamic>
              </Dynamic>
            </Dynamic>
          </Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic component={_ctx$.builtins.Heading} depth={1} id={'foo'}>
        foo
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={2} id={'bar'}>
        bar
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={3} id={'baz'}>
        baz
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={1} id={'alpha'}>
        alpha
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={2} id={'bravo'}>
        bravo
      </Dynamic>
      <Dynamic component={_ctx$.builtins.Heading} depth={3} id={'charlie'}>
        charlie
      </Dynamic>
    </Dynamic>
  );
}
```

### Frontmatter

A document may open with YAML (`---`) or TOML (`+++`) frontmatter. It is parsed at build time, exported from the module as `frontmatter`, and is also in scope as a `frontmatter` variable inside the document itself, so headings and expressions can read from it.

Frontmatter is only recognised when it starts on the very first line of the file. Anywhere else, `---` is just a thematic break.

```js
import Doc, { frontmatter } from './doc.md';

console.log(frontmatter.title);
```

#### YAML

```mdx
---
title: Hi, World!
---

# {frontmatter.title}
```

```js
export const frontmatter = { title: 'Hi, World!' };
import { useMDX as _useMDX$ } from 'solid-marked';

export function TableOfContents(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.List} ordered={false} spread={false}>
      <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Dynamic component={_ctx$.builtins.Link} url={'#frontmattertitle'}>
            {frontmatter.title}
          </Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.Heading}
        depth={1}
        id={'frontmattertitle'}
      >
        {frontmatter.title}
      </Dynamic>
    </Dynamic>
  );
}
```

#### TOML

```md
+++
title = "Hi, World!"
+++

# {frontmatter.title}
```

```js
export const frontmatter = Object.assign(Object.create(null), {
  title: 'Hi, World!',
});
import { useMDX as _useMDX$ } from 'solid-marked';

export function TableOfContents(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.List} ordered={false} spread={false}>
      <Dynamic component={_ctx$.builtins.ListItem} spread={false}>
        <Dynamic component={_ctx$.builtins.Paragraph}>
          <Dynamic component={_ctx$.builtins.Link} url={'#frontmattertitle'}>
            {frontmatter.title}
          </Dynamic>
        </Dynamic>
      </Dynamic>
    </Dynamic>
  );
}
export default function Component(props) {
  const _ctx$ = _useMDX$();
  return (
    <Dynamic component={_ctx$.builtins.Root}>
      <Dynamic
        component={_ctx$.builtins.Heading}
        depth={1}
        id={'frontmattertitle'}
      >
        {frontmatter.title}
      </Dynamic>
    </Dynamic>
  );
}
```

## TypeScript

Importing a Markdown file needs an ambient declaration for the extension. Reference the shipped types once, in any file that is part of your program (`env.d.ts` or `vite-env.d.ts` is the usual home):

```ts
/// <reference types="solid-marked/env" />
```

Or add it to `tsconfig.json` instead:

```json
{
  "compilerOptions": {
    "types": ["solid-marked/env"]
  }
}
```

Either way, `.md`, `.mdx`, `.markdown`, `.mdown`, `.mkdn`, `.mkd`, `.mkdown` and `.ron` modules resolve with a default export, `TableOfContents` and `frontmatter`:

```ts
import Doc, { TableOfContents, frontmatter } from './doc.md';
```

`frontmatter` is typed as `unknown`, since its shape is up to the document. Narrow it where you use it, or re-declare it for a specific file.

The prop types are exported from the package entry point, which is handy when a builtin lives in its own file:

```ts
import type {
  CodeProps,
  HeadingProps,
  MDXBuiltinComponents,
  MDXProps,
} from 'solid-marked';

export const builtins: MDXBuiltinComponents = {
  Heading(props: HeadingProps) {
    /* ... */
  },
};
```

## Development

This repository is a pnpm workspace. It uses [tsdown](https://tsdown.dev) for builds, [oxlint](https://oxc.rs) and [oxfmt](https://oxc.rs) for linting and formatting, and [vitest](https://vitest.dev) for tests.

```bash
pnpm install
pnpm run build       # build every package
pnpm run test        # run every test suite
pnpm run type-check  # tsc --noEmit in every package
pnpm run lint        # oxlint, type-aware
pnpm run fmt         # oxfmt, writes in place
```

To try a change against a real app, build the packages and then run one of the demos:

```bash
pnpm run build
pnpm --filter vite-demo dev
pnpm --filter component-demo dev
```

Releases are managed with [changesets](https://github.com/changesets/changesets): run `pnpm run cs:add` and describe the change in the same pull request.

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
