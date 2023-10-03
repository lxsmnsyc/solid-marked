import type GithubSlugger from 'github-slugger';
import type { SourceNode } from 'source-map';

export interface Options {
  mdxImportSource?: string;
  noDynamicComponents?: boolean | 'only-mdx';
}

export interface StateContext {
  source: string;
  imports: SourceNode[];
  options: Options;
  frontmatter?: SourceNode;
  slugger: GithubSlugger;
}
