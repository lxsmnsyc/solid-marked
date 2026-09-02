import type GithubSlugger from 'github-slugger';
import type { SourceNode } from 'source-map';

export interface Options {
  /**
   * Module the generated code imports `useMDX` from.
   *
   * Point this at your own module to bypass `<MDXProvider>` entirely: anything
   * exporting a `useMDX` function that returns `{ builtins, components }` will
   * do.
   *
   * @default 'solid-marked'
   */
  mdxImportSource?: string;
  /**
   * Controls where SolidJS' `<Dynamic>` is used in the output.
   *
   * - `false` — every builtin and every MDX element goes through `<Dynamic>`.
   *   MDX elements fall back to `components` from `useMDX()` when the name is
   *   not in scope.
   * - `true` — `<Dynamic>` is never used. Components are referenced directly,
   *   which produces smaller output but requires every name to be in scope.
   * - `'only-mdx'` — builtins go through `<Dynamic>`, MDX elements do not.
   *
   * @default false
   */
  noDynamicComponents?: boolean | 'only-mdx';
}

export interface StateContext {
  source: string;
  imports: SourceNode[];
  options: Options;
  frontmatter?: SourceNode;
  slugger: GithubSlugger;
}
