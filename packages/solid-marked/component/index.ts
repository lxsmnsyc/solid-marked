import GithubSlugger from 'github-slugger';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { type JSX, createMemo } from 'solid-js';

import type { MDXProps } from '../compiler';
import compileNode from './renderer';

export interface MarkdownProps extends MDXProps {
  /** The Markdown source. Re-parsed whenever it changes. */
  children: string;
}

/**
 * Renders a Markdown string at runtime, through the same `builtins` the
 * compiler targets.
 *
 * Use this when the source is only known at runtime. When the document is a
 * file in your project, prefer the compiler and its bundler plugins: they do
 * the parsing at build time and ship no parser to the browser.
 *
 * Only CommonMark and GFM are supported. MDX expressions and frontmatter are
 * not parsed, and rendering a document that contains them throws. Raw HTML is
 * passed to the `HTML` builtin as a string rather than being injected into the
 * page.
 *
 * @example
 * ```jsx
 * <Markdown builtins={{ Blockquote: props => <blockquote>{props.children}</blockquote> }}>
 *   {'> Hello'}
 * </Markdown>
 * ```
 */
export default function Markdown(props: MarkdownProps): JSX.Element {
  const ast = createMemo(() =>
    fromMarkdown(props.children, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    }),
  );

  const rendered = createMemo(() =>
    compileNode({ props, slugger: new GithubSlugger() }, ast()),
  );

  // Returning the memo itself keeps the rendering lazy and reactive: Solid
  // unwraps function children at runtime, but its `JSX.Element` type does not
  // model that, so the assertion is unavoidable here.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return rendered as unknown as JSX.Element;
}
