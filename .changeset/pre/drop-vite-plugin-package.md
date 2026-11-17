---
'solid-marked': major
'unplugin-solid-marked': major
---

Remove the `vite-plugin-solid-marked` package.

Use `unplugin-solid-marked` instead. It supports Vite through `.vite()` and
takes the same options.

```js
import solidMarked from 'unplugin-solid-marked';

export default {
  plugins: [solidMarked.vite({}), solid()],
};
```
