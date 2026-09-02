import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    compiler: './compiler/index.ts',
    component: './component/index.ts',
    index: './src/index.ts',
  },
  format: ['esm'],
  publint: true,
  platform: 'neutral',
  sourcemap: true,
  target: 'es2022',
  treeshake: true,
  unbundle: false,
});
