/* eslint-disable no-restricted-syntax */
import { readFile } from 'fs/promises';
import path from 'path';
import * as solidMarked from 'solid-marked';
import * as vite from 'vite';

export interface SolidMarkedPluginOptions {
  source: string;
}

export default function solidMarkedPlugin(
  options: SolidMarkedPluginOptions,
): vite.Plugin {
  return {
    name: 'solid-marked',
    enforce: 'pre',
    resolveId(id, importer) {
      if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/.test(id) && importer) {
        return path.join(path.dirname(importer), id);
      }
      if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)\.jsx$/.test(id) && importer) {
        return path.join(path.dirname(importer), id);
      }
      return null;
    },
    async load(id) {
      if (id.startsWith('\0')) {
        return null;
      }
      if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/.test(id)) {
        const { name, ext } = path.parse(id);
        return `export { default } from './${name}${ext}.jsx'`;
      }
      if (/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)\.jsx$/.test(id)) {
        const { dir, name } = path.parse(id);
        const target = path.join(dir, name);
        const content = await readFile(target, 'utf-8');
        return solidMarked.compile(options.source, target, content);
      }
      return null;
    },
    handleHotUpdate(ctx) {
      if (!/\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/.test(ctx.file)) {
        return;
      }
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
      // eslint-disable-next-line consistent-return
      return modules;
    },
  };
}
