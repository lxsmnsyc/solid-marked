import type { Component, JSX } from 'solid-js';

/** Props of a builtin that wraps other content. */
export interface ParentProps {
  children?: JSX.Element;
}

/** Props of a builtin whose content is raw text rather than nested nodes. */
export interface LiteralProps {
  children?: string | null | undefined;
}

/** Identifies a definition or a reference to one. */
export interface AssociationProps {
  /** Normalised identifier, matched between a reference and its definition. */
  identifier: string;
  /** Identifier as it was written in the document. */
  label?: string | null | undefined;
}

/** Points at a resource, such as a link target or an image. */
export interface ResourceProps {
  url: string;
  title?: string | null | undefined;
}

/** Alternative text for a resource that is not rendered as text. */
export interface AlternativeProps {
  alt?: string | null | undefined;
}

/** A reference to a definition elsewhere in the document. */
export interface ReferenceProps extends AssociationProps {
  /** How the reference was written: `[alpha]`, `[alpha][]` or `[alpha][bravo]`. */
  referenceType: 'shortcut' | 'collapsed' | 'full';
}

/** A fenced or indented code block. */
export interface CodeProps extends LiteralProps {
  /** Language of the fence, e.g. `js` in ```` ```js ````. */
  lang?: string | null | undefined;
  /** Anything written after the language on the opening fence. */
  meta?: string | null | undefined;
}

export interface HeadingProps extends ParentProps {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /** Slug of the heading text, unique within the document. */
  id: string;
}

export interface ListProps extends ParentProps {
  ordered?: boolean | null | undefined;
  /** Whether the items are separated by blank lines. */
  spread?: boolean | null | undefined;
  /** Number the first item starts at, for ordered lists. */
  start?: number | null | undefined;
}
export interface ListItemProps extends ParentProps {
  /** State of the GFM task list checkbox, or `null` when the item has none. */
  checked?: boolean | null | undefined;
  spread?: boolean | null | undefined;
}
export interface TableProps extends ParentProps {
  /** Column alignments, in order. `null` for a column with no alignment. */
  align?: ('left' | 'right' | 'center' | null)[] | null | undefined;
}

export interface TableRowProps extends ParentProps {
  /** `true` for the header row of the table. */
  isHead: boolean;
}

export type MDXComponent<P> = (props: P) => JSX.Element;

/**
 * Components a Markdown document renders through.
 *
 * Every entry is optional: a construct whose builtin is missing renders
 * nothing, so a set can start small and grow with the documents that use it.
 */
export interface MDXBuiltinComponents {
  Blockquote?: MDXComponent<ParentProps>;
  Break?: () => JSX.Element;
  Code?: MDXComponent<CodeProps>;
  Definition?: MDXComponent<ResourceProps & AssociationProps>;
  Delete?: MDXComponent<ParentProps>;
  Emphasis?: MDXComponent<ParentProps>;
  FootnoteDefinition?: MDXComponent<ParentProps & AssociationProps>;
  FootnoteReference?: MDXComponent<AssociationProps>;
  HTML?: MDXComponent<LiteralProps>;
  Heading?: MDXComponent<HeadingProps>;
  Image?: MDXComponent<ResourceProps & AlternativeProps>;
  ImageReference?: MDXComponent<ReferenceProps & AlternativeProps>;
  InlineCode?: MDXComponent<LiteralProps>;
  Link?: MDXComponent<ResourceProps & ParentProps>;
  LinkReference?: MDXComponent<ReferenceProps & ParentProps>;
  List?: MDXComponent<ListProps>;
  ListItem?: MDXComponent<ListItemProps>;
  Paragraph?: MDXComponent<ParentProps>;
  Root?: MDXComponent<ParentProps>;
  Strong?: MDXComponent<ParentProps>;
  Table?: MDXComponent<TableProps>;
  TableCell?: MDXComponent<ParentProps>;
  TableRow?: MDXComponent<TableRowProps>;
  ThematicBreak?: () => JSX.Element;
}

export interface MDXProps {
  /** Components for Markdown constructs. */
  builtins: MDXBuiltinComponents;
  /**
   * Components for JSX elements written inside MDX documents, keyed by tag
   * name. Only consulted for names that are not otherwise in scope, and unused
   * by the runtime `<Markdown>` component, which does not parse MDX.
   */
  // The component map is user-supplied and intentionally unconstrained: each
  // entry is keyed by the JSX tag name found in the MDX source.
  // oxlint-disable-next-line typescript/no-explicit-any
  components?: Record<string, Component<any>>;
}
