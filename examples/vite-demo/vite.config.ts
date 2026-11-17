import solidPlugin from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import solidMarkedPlugin from 'unplugin-solid-marked';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solidMarkedPlugin.vite({}), solidPlugin(), tailwindcss()],
});
