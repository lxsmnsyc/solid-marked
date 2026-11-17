---
'solid-marked': major
'unplugin-solid-marked': major
---

Support Solid 2.0. Solid 1.x is no longer supported. Use the 0.8.x line with Solid 1.x; it lives on the `solid-1` branch.

What you need to change:

- Install `solid-js` and `@solidjs/web` `^2.0.0`. Both are peer dependencies.
- Use `@solidjs/vite-plugin` in place of `vite-plugin-solid`.
- Set `jsxImportSource` to `@solidjs/web`.

Compiled markdown modules do not change. `@solidjs/vite-plugin` resolves the
`Dynamic` component the same way `babel-preset-solid` did. The `<Markdown>`
component renders builtins through Solid 2's `dynamic()`.

`useMDX` no longer throws its own `Missing MDXProvider` error. Solid 2 throws
`ContextNotFoundError` when there is no provider.
