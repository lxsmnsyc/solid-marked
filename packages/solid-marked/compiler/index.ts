import GithubSlugger from 'github-slugger';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { toc } from 'mdast-util-toc';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { mdxjs } from 'micromark-extension-mdxjs';
import type { RawSourceMap } from 'source-map';
import { SourceNode } from 'source-map';

import { CTX_VAR, compileNode } from './compiler';
import type { Options, StateContext } from './types';

export type * from './interfaces';
export type { Options } from './types';

const USE_MDX_VAR = '_useMDX$';

export interface Result {
  /** The generated module, as JSX that still needs a Solid transform. */
  code: string;
  /** Source map pointing back at the original document. */
  map: RawSourceMap;
}

/**
 * Compiles a Markdown or MDX document into a SolidJS component module.
 *
 * The generated module exports the document as its default export, a
 * `TableOfContents` component when the document has headings, and a
 * `frontmatter` value when the document has YAML or TOML frontmatter. Its JSX
 * still has to be processed by a Solid JSX transform, such as
 * `vite-plugin-solid`.
 *
 * @param fileName Name recorded in the source map, and the key of its
 * `sourcesContent` entry.
 * @param markdownCode The document source.
 * @param options See {@link Options}.
 *
 * @example
 * ```js
 * const { code, map } = compile('doc.md', '# Hello World');
 * ```
 */
export function compile(
  fileName: string,
  markdownCode: string,
  options: Options = {},
): Result {
  const ast = fromMarkdown(markdownCode, {
    extensions: [mdxjs(), gfm(), frontmatter(['yaml', 'toml'])],
    mdastExtensions: [
      mdxFromMarkdown(),
      gfmFromMarkdown(),
      frontmatterFromMarkdown(['yaml', 'toml']),
    ],
  });

  const tocAST = toc(ast);

  const ctx: StateContext = {
    source: fileName,
    options,
    imports: [],
    frontmatter: undefined,
    slugger: new GithubSlugger(),
  };
  const render = compileNode(ctx, ast);

  const compiled = new SourceNode(null, null, fileName);

  compiled.add(ctx.imports);
  if (ctx.frontmatter) {
    compiled.add('export const frontmatter = ');
    compiled.add(ctx.frontmatter);
    compiled.add(';\n');
  }
  compiled.add(
    `import { useMDX as ${USE_MDX_VAR} } from '${
      options.mdxImportSource ?? 'solid-marked'
    }';\n\n`,
  );
  if (tocAST.map) {
    const renderedTOC = compileNode(ctx, tocAST.map);
    compiled.add('export function TableOfContents(props) {\n');
    compiled.add(`  const ${CTX_VAR} = ${USE_MDX_VAR}();\n`);
    compiled.add('  return (\n');
    compiled.add(renderedTOC);
    compiled.add('\n  );\n');
    compiled.add('}\n');
  }
  compiled.add('export default function Component(props) {\n');
  compiled.add(`  const ${CTX_VAR} = ${USE_MDX_VAR}();\n`);
  compiled.add('  return (\n');
  compiled.add(render);
  compiled.add('\n  );\n');
  compiled.add('}\n');

  compiled.setSourceContent(fileName, markdownCode);

  const compiledResult = compiled.toStringWithSourceMap();

  return {
    code: compiledResult.code,
    map: compiledResult.map.toJSON(),
  };
}
