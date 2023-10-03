import { createMemo, type JSX } from 'solid-js';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import GithubSlugger from 'github-slugger';
import type { MDXProps } from '../compiler';
import { compileNode } from './renderer';

export interface MarkdownProps extends MDXProps {
  children: string;
}

export default function Markdown(props: MarkdownProps): JSX.Element {
  const ast = createMemo(() => (
    fromMarkdown(props.children, {
      extensions: [
        gfm(),
      ],
      mdastExtensions: [
        gfmFromMarkdown(),
      ],
    })
  ));

  const rendered = createMemo(() => compileNode({ props, slugger: new GithubSlugger() }, ast()));

  return rendered as unknown as JSX.Element;
}
