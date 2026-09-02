---
'solid-marked': minor
'unplugin-solid-marked': minor
'vite-plugin-solid-marked': minor
---

Require Node `^20.19.0 || >=22.12.0`

`engines.node` was `>=10`, which predates the ESM-only dependency graph these
packages have built on for some time. It now states the range the toolchain
actually needs, and the one where `require(esm)` is available.
