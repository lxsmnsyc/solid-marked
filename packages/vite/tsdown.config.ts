import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: { index: './src/index.ts' },
  fixedExtension: false,
  format: ['esm'],
  publint: true,
  platform: 'node',
  sourcemap: true,
  target: 'es2022',
  treeshake: true,
});
