import solidMarkedPlugin from 'unplugin-solid-marked';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidMarkedPlugin.vite({}), solidPlugin()],
});
