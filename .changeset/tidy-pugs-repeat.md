---
'solid-marked': minor
'unplugin-solid-marked': minor
'vite-plugin-solid-marked': minor
---

Build with `tsdown` and update the published entry points

The packages are now bundled with `tsdown` instead of `pridepack`. The build
emits `dist/<entry>.js` and its declaration file, and the
`development`/`production` export conditions have been dropped because no code
depended on them. A `solid-marked/env` export was added so
`"types": ["solid-marked/env"]` resolves through the `exports` map.

`unplugin-solid-marked` moves to `unplugin` v3: the deprecated `loadInclude`
hooks are replaced by the `load.filter` API and `handleHotUpdate` is replaced by
`hotUpdate`. Vite 8 is now supported alongside Vite 7.
