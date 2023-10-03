import type { RawSourceMap } from 'source-map';
import {
  SourceNode,
} from 'source-map';
import {
  fromMarkdown,
} from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { toc } from 'mdast-util-toc';
import { mdxjs } from 'micromark-extension-mdxjs';
import { gfm } from 'micromark-extension-gfm';
import { frontmatter } from 'micromark-extension-frontmatter';
import GithubSlugger from 'github-slugger';
import { CTX_VAR, compileNode } from './compiler';
import type { Options, StateContext } from './types';

export type { Options } from './types';
export * from './interfaces';

const USE_MDX_VAR = '_useMDX$';

export interface Result {
  code: string;
  map: RawSourceMap;
}

export function compile(
  fileName: string,
  markdownCode: string,
  options: Options = {},
): Result {
  const ast = fromMarkdown(markdownCode, {
    extensions: [
      mdxjs(),
      gfm(),
      frontmatter(['yaml', 'toml']),
    ],
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
  compiled.add(`import { useMDX as ${USE_MDX_VAR} } from '${options.mdxImportSource || 'solid-marked'}';\n\n`);
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
