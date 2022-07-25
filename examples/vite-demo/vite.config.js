import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidMarkedPlugin from 'vite-plugin-solid-marked';

export default defineConfig({
  plugins: [
    solidMarkedPlugin({
      source: './markdown'
    }),
    solidPlugin(),
  ],
});