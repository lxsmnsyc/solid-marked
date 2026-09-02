---
'solid-marked': minor
'unplugin-solid-marked': minor
'vite-plugin-solid-marked': minor
---

Add the `HTML` builtin and render raw HTML nodes

`MDXBuiltinComponents` now declares an `HTML` component, and the runtime
`<Markdown>` component renders `html` nodes through it instead of throwing
`invalid node`. The compiler also handles `html` nodes at the document root.

The interface types (`MDXBuiltinComponents`, `MDXProps`, and the per-node prop
types) are now re-exported from the `solid-marked` entry point, so they no
longer have to be imported from `solid-marked/compiler`.
