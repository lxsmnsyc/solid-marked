# unplugin-thaler

> [Unplugin](https://github.com/unjs/unplugin) for [`thaler`](https://github.com/lxsmnsyc/thaler)

[![NPM](https://img.shields.io/npm/v/unplugin-thaler.svg)](https://www.npmjs.com/package/unplugin-thaler) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
npm install thaler
npm install --D unplugin-thaler
```

```bash
yarn add thaler
yarn add -D unplugin-thaler
```

```bash
pnpm add thaler
pnpm add -D unplugin-thaler
```

## Usage

Please check out [`unplugin`](https://github.com/unjs/unplugin) to know more about how to use the plugins with `unplugin-thaler` in your target bundler.

```js
import thaler from 'unplugin-thaler';

// Example: Rollup
thaler.rollup({
  origin: 'http://localhost:3000',
  mode: 'server', // or 'client'
  filter: {
    include: 'src/**/*.{ts,js,tsx,jsx}',
    exclude: 'node_modules/**/*.{ts,js,tsx,jsx}',
  },
})
```

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
