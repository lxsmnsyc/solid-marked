import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidMarkedPlugin from 'unplugin-solid-marked';

export default defineConfig({
  plugins: [
    solidMarkedPlugin.vite({}),
    solidPlugin(),
  ],
});