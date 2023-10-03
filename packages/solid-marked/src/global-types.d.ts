import type { JSX } from 'solid-js';

declare module '*.md' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mdx' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.markdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkdn' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkd' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.ron' {
  export const frontmatter: unknown;
  export function TableOfContents(): JSX.Element;
  export default function Component(props: Record<string, unknown>): JSX.Element;
}
