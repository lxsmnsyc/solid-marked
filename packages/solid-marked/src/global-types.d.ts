// Ambient module declarations for Markdown imports.
// This file must NOT contain top-level `import`/`export` statements, otherwise
// TypeScript treats the `declare module '*.md'` blocks as module augmentations
// instead of ambient wildcard modules, and `import Doc from './Doc.md'` fails
// to resolve in consumer projects.

declare module '*.md' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.mdx' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.markdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.mdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.mkdn' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.mkd' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.mkdown' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}

declare module '*.ron' {
  export const frontmatter: unknown;
  export function TableOfContents(): import('solid-js').JSX.Element;
  export default function Component(
    props: Record<string, unknown>,
  ): import('solid-js').JSX.Element;
}
