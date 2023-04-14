/* eslint-disable no-restricted-syntax */
import { readFile } from 'fs/promises';
import path from 'path';
import * as solidMarked from 'solid-marked/compiler';
import * as vite from 'vite';
import { createUnplugin } from 'unplugin';

export interface SolidMarkedPluginOptions {
  source?: string;
  noDynamicComponents?: boolean;
}

const solidMarkedUnplugin = createUnplugin((options: SolidMarkedPluginOptions) => [
  {
    name: 'solid-marked:pre',
    loadInclude(id) {
      return /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/.test(id);
    },
    load(id) {
      return `export { default } from './${path.basename(id)}.jsx';\nexport * from './${path.basename(id)}.jsx';`;
    },
  },
  {
    name: 'solid-marked:post',
    resolveId(id, importer) {
      if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)\.jsx$/.test(id) && importer) {
        return path.join(path.dirname(importer), id);
      }
      return null;
    },
    loadInclude(id) {
      return /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)\.jsx$/.test(id);
    },
    async load(id) {
      const { name, dir } = path.parse(id);
      return solidMarked.compile(
        path.join(dir, name),
        await readFile(path.join(dir, name), 'utf-8'),
        {
          mdxImportSource: options.source,
          noDynamicComponents: options.noDynamicComponents,
        },
      );
    },
    vite: {
      handleHotUpdate(ctx) {
        if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/.test(ctx.file)) {
          // The proxy module for markdown files
          // indirectly imports the actual compiled file
          // so we need to forward those dependencies
          // from the compiled file to the proxy module
          const modules: vite.ModuleNode[] = [];
          for (const mod of ctx.modules) {
            for (const imported of mod.importedModules) {
              modules.push(imported);
            }
          }
          return modules;
        }
        return undefined;
      },
    },
  },
]);

export default solidMarkedUnplugin;
