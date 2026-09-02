import solidMarkedUnplugin from 'unplugin-solid-marked';

export type { SolidMarkedPluginOptions } from 'unplugin-solid-marked';

/**
 * Vite plugin that compiles imported Markdown and MDX files into SolidJS
 * components.
 *
 * It emits JSX, so it has to be listed **before** `vite-plugin-solid`.
 *
 * @example
 * ```js
 * import solid from 'vite-plugin-solid';
 * import solidMarked from 'vite-plugin-solid-marked';
 *
 * export default {
 *   plugins: [solidMarked({}), solid()],
 * };
 * ```
 */
const solidMarkedPlugin = solidMarkedUnplugin.vite;

export default solidMarkedPlugin;
