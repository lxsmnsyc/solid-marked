---
'unplugin-solid-marked': patch
'vite-plugin-solid-marked': patch
---

Accept `'only-mdx'` for the plugin's `noDynamicComponents` option

`SolidMarkedPluginOptions.noDynamicComponents` was typed as `boolean`, even
though the value is handed straight to the compiler, which also accepts
`'only-mdx'`. The option is now typed `boolean | 'only-mdx'` to match.
