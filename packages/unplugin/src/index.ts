import { readFile } from 'node:fs/promises';
import path from 'node:path';

import * as solidMarked from 'solid-marked/compiler';
import { createUnplugin } from 'unplugin';

export interface SolidMarkedPluginOptions {
  /**
   * Module the generated code imports `useMDX` from.
   *
   * @default 'solid-marked'
   */
  source?: string;
  /**
   * Controls where SolidJS' `<Dynamic>` is used in the output. See the
   * `noDynamicComponents` option of `solid-marked/compiler`.
   *
   * @default false
   */
  noDynamicComponents?: boolean | 'only-mdx';
}

const MARKDOWN_RE = /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/;
const MARKDOWN_PROXY_RE = /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)\.jsx$/;

/**
 * Compiles imported Markdown and MDX files into SolidJS components.
 *
 * The plugin emits JSX, so it has to run **before** the Solid JSX transform
 * (`vite-plugin-solid` and friends). Each markdown module exports the document
 * as its default export, plus `TableOfContents` and `frontmatter` where the
 * document provides them.
 *
 * @example
 * ```js
 * // vite.config.js
 * export default {
 *   plugins: [solidMarked.vite({}), solid()],
 * };
 * ```
 */
const solidMarkedUnplugin = createUnplugin(
  (options: SolidMarkedPluginOptions) => [
    {
      name: 'solid-marked:pre',
      load: {
        filter: { id: MARKDOWN_RE },
        handler(id) {
          const base = path.basename(id);
          return `export { default } from './${base}.jsx';\nexport * from './${base}.jsx';`;
        },
      },
    },
    {
      name: 'solid-marked:post',
      resolveId: {
        filter: { id: MARKDOWN_PROXY_RE },
        handler(id, importer) {
          if (importer) {
            return path.join(path.dirname(importer), id);
          }
          return null;
        },
      },
      load: {
        filter: { id: MARKDOWN_PROXY_RE },
        async handler(id) {
          const { name, dir } = path.parse(id);
          const source = path.join(dir, name);
          return solidMarked.compile(source, await readFile(source, 'utf-8'), {
            mdxImportSource: options.source,
            noDynamicComponents: options.noDynamicComponents,
          });
        },
      },
      vite: {
        hotUpdate(ctx) {
          if (MARKDOWN_RE.test(ctx.file)) {
            // The proxy module for a markdown file indirectly imports the
            // actual compiled module, so the compiled module has to be
            // invalidated instead of the proxy module itself.
            return ctx.modules.flatMap(mod => [...mod.importedModules]);
          }
          return undefined;
        },
      },
    },
  ],
);

export default solidMarkedUnplugin;
