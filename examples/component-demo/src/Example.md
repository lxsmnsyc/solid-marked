# solid-marked

> Runtime Markdown rendering for SolidJS.

The `<Markdown>` component from `solid-marked/component` renders **CommonMark**
and **GFM** at runtime, so the source can come from anywhere: a file, an API
response, or a textarea.

## Inline formatting

Text can be _emphasised_, **strong**, ~~struck through~~, or contain
`inline code`. Links such as [solid-marked on npm](https://www.npmjs.com/package/solid-marked)
work too, and so do footnotes.[^1]

[^1]: Footnotes are part of GFM.

## Lists

1. Ordered items
2. ... keep their numbering
3. ... including a `start` offset

- Unordered items
- Nested items work as well
  - Like this one
- Task lists are supported:

- [x] Parse the Markdown
- [ ] Render it with your own components

## Code

```tsx
import Markdown from 'solid-marked/component';

const content = (
  <Markdown builtins={{ Root: props => <div>{props.children}</div> }}>
    {'> This is a blockquote.'}
  </Markdown>
);
```

## Tables

| Builtin   | Node type |                      Notes |
| :-------- | :-------- | -------------------------: |
| `Root`    | `root`    |   Wraps the whole document |
| `Heading` | `heading` |  Receives `depth` and `id` |
| `Code`    | `code`    | Receives `lang` and `meta` |
| `HTML`    | `html`    |  Raw HTML blocks and spans |

## Raw HTML

<div class="rounded bg-indigo-100 p-2">This block is a raw HTML node.</div>

## Images

![The SolidJS logo](https://www.solidjs.com/img/logo/without-wordmark/logo.svg 'SolidJS')

## Blockquotes

> Blockquotes can contain any other block content.
>
> - Including lists
> - And `code`

---

That is the end of the document.
