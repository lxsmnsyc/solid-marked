---
'solid-marked': major
'unplugin-solid-marked': major
---

Require Solid 2.

`solid-marked` now targets Solid 2 and no longer supports Solid 1. Stay on the
0.8.x line if you are on Solid 1.

What you need to change:

- Install `@solidjs/web` next to `solid-js@^2`.
- Use `@solidjs/vite-plugin` in place of `vite-plugin-solid`.
- Set `jsxImportSource` to `@solidjs/web`.

Compiled markdown modules do not change. `@solidjs/vite-plugin` resolves the
`Dynamic` component the same way `babel-preset-solid` did.

`useMDX` no longer throws its own `Missing MDXProvider` error. Solid 2 throws
`ContextNotFoundError` when there is no provider.
