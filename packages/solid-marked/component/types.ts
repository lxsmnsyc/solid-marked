import type GithubSlugger from 'github-slugger';
import type { MDXProps } from '../compiler';

export interface StateContext {
  slugger: GithubSlugger;
  props: MDXProps;
}
