declare module '*.md' {
  import { Component, JSX } from 'solid-js';

  export interface ParentProps {
    children?: JSX.Element;
  }

  export interface AssociationProps {
    identifier: string;
    label?: string;
  }

  export interface ResourceProps {
    url: string;
    title?: string;
  }

  export interface AlternativeProps {
    alt?: string;
  }

  export interface ReferenceProps {
    referenceType: 'shortcut' | 'collapsed' | 'full';
  }

  export interface CodeProps {
    lang?: string;
    meta?: string;
  }

  export interface HeadingProps extends ParentProps {
    depth: 1 | 2 | 3 | 4 | 5 | 6;
  }

  export interface LiteralProps {
    value: string;
  }

  export interface ListProps extends ParentProps {
    ordered?: boolean;
    spread?: boolean;
    start?: number;
  }
  export interface ListItemProps extends ParentProps {
    checked?: boolean;
    spread?: boolean;
  }
  export interface TableProps extends ParentProps {
    align?: Array<'left' | 'right' | 'center' | null>;
  }

  export type MDXComponent<P> = (props: P) => JSX.Element;

  export interface MDXBuiltinComponents {
    BlockQuote: MDXComponent<ParentProps>;
    Break: () => JSX.Element;
    Code: MDXComponent<CodeProps>;
    Definition: MDXComponent<ResourceProps & AssociationProps>
    Delete: MDXComponent<ParentProps>
    Emphasis: MDXComponent<ParentProps>
    Footnote: MDXComponent<ParentProps>
    FootnoteDefinition: MDXComponent<ParentProps & AssociationProps>
    FootnoteReference: MDXComponent<AssociationProps>
    Heading: MDXComponent<HeadingProps>
    Image: MDXComponent<ResourceProps & AlternativeProps>
    ImageReference: MDXComponent<ReferenceProps & AlternativeProps>
    InlineCode: MDXComponent<LiteralProps>
    Link: MDXComponent<ResourceProps & ParentProps>
    LinkReference: MDXComponent<ReferenceProps & ParentProps>
    List: MDXComponent<ListProps>
    ListItem: MDXComponent<ListItemProps>
    Paragraph: MDXComponent<ParentProps>
    Root: MDXComponent<ParentProps>
    Strong: MDXComponent<ParentProps>
    Table: MDXComponent<TableProps>;
    TableCell: MDXComponent<ParentProps>;
    TableRow: MDXComponent<ParentProps>;
    ThematicBreak: () => JSX.Element;
  }

  export interface MDXProps {
    builtins: MDXBuiltinComponents;
    components?: Record<string, Component<unknown>>;
    children?: JSX.Element;
    [key: string]: unknown;
  }

  export default function Component(props: MDXProps): JSX.Element;
}

declare module '*.mdx' {
  export * from '*.md';
}

declare module '*.markdown' {
  export * from '*.md';
}

declare module '*.mdown' {
  export * from '*.md';
}

declare module '*.mkdn' {
  export * from '*.md';
}

declare module '*.mkd' {
  export * from '*.md';
}

declare module '*.mkdown' {
  export * from '*.md';
}

declare module '*.ron' {
  export * from '*.md';
}
