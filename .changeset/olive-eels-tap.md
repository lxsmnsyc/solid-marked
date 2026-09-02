---
'solid-marked': patch
---

Fix ambient module declarations for markdown imports

`src/global-types.d.ts` had a top-level `import`, which made TypeScript treat
its `declare module '*.md'` blocks as module augmentations rather than ambient
wildcard modules. Importing a markdown file in a consumer project failed with
`Cannot find module './Doc.md'`. The declarations no longer import anything at
the top level.
