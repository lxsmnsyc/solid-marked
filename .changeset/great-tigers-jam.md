---
'solid-marked': minor
'unplugin-solid-marked': minor
'vite-plugin-solid-marked': minor
---

Ship ESM only

The CommonJS builds never worked. `require('solid-marked/compiler')` threw
`github_slugger.default is not a constructor`, and
`require('unplugin-solid-marked').default` was `undefined`. The whole
dependency graph — `github-slugger`, `mdast-util-*`, `micromark-*` — is
ESM-only, and the CommonJS bundle wrapped those ESM namespaces a second time
when interoperating with them.

Rather than leave an entry point that crashes on import, the packages are now
ESM-only: the `require` conditions and `*.cjs` files are gone. Node 20.19+ and
22.12+ can still `require()` these packages through `require(esm)`, and every
supported bundler resolves the `import` condition already.
