# unplugin-solid-marked

## 0.8.0

### Minor Changes

- a0ba6c4: Ship ESM only
  
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
- a0ba6c4: Require Node `^20.19.0 || >=22.12.0`
  
  `engines.node` was `>=10`, which predates the ESM-only dependency graph these
  packages have built on for some time. It now states the range the toolchain
  actually needs, and the one where `require(esm)` is available.
- a0ba6c4: Add the `HTML` builtin and render raw HTML nodes
  
  `MDXBuiltinComponents` now declares an `HTML` component, and the runtime
  `<Markdown>` component renders `html` nodes through it instead of throwing
  `invalid node`. The compiler also handles `html` nodes at the document root.
  
  The interface types (`MDXBuiltinComponents`, `MDXProps`, and the per-node prop
  types) are now re-exported from the `solid-marked` entry point, so they no
  longer have to be imported from `solid-marked/compiler`.
- a0ba6c4: Build with `tsdown` and update the published entry points
  
  The packages are now bundled with `tsdown` instead of `pridepack`. The build
  emits `dist/<entry>.js` and its declaration file, and the
  `development`/`production` export conditions have been dropped because no code
  depended on them. A `solid-marked/env` export was added so
  `"types": ["solid-marked/env"]` resolves through the `exports` map.
  
  `unplugin-solid-marked` moves to `unplugin` v3: the deprecated `loadInclude`
  hooks are replaced by the `load.filter` API and `handleHotUpdate` is replaced by
  `hotUpdate`. Vite 8 is now supported alongside Vite 7.

### Patch Changes

- a0ba6c4: Accept `'only-mdx'` for the plugin's `noDynamicComponents` option
  
  `SolidMarkedPluginOptions.noDynamicComponents` was typed as `boolean`, even
  though the value is handed straight to the compiler, which also accepts
  `'only-mdx'`. The option is now typed `boolean | 'only-mdx'` to match.

## 0.7.0

### Minor Changes

- f28a519: bump dependencies, move to changesets
