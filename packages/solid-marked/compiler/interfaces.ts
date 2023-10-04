import type {
  Component,
  JSX,
} from 'solid-js';

export interface ParentProps {
  children?: JSX.Element;
}

export interface LiteralProps {
  children?: string | null | undefined;
}

export interface AssociationProps {
  identifier: string;
  label?: string | null | undefined;
}

export interface ResourceProps {
  url: string;
  title?: string | null | undefined ;
}

export interface AlternativeProps {
  alt?: string | null | undefined;
}

export interface ReferenceProps extends AssociationProps {
  referenceType: 'shortcut' | 'collapsed' | 'full';
}

export interface CodeProps extends LiteralProps {
  lang?: string | null | undefined;
  meta?: string | null | undefined;
}

export interface HeadingProps extends ParentProps {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
}

export interface ListProps extends ParentProps {
  ordered?: boolean | null | undefined;
  spread?: boolean | null | undefined;
  start?: number | null | undefined;
}
export interface ListItemProps extends ParentProps {
  checked?: boolean | null | undefined;
  spread?: boolean | null | undefined;
}
export interface TableProps extends ParentProps {
  align?: Array<'left' | 'right' | 'center' | null> | null | undefined;
}

export interface TableRowProps extends ParentProps {
  isHead: boolean;
}

export type MDXComponent<P> = (props: P) => JSX.Element;

export interface MDXBuiltinComponents {
  Blockquote?: MDXComponent<ParentProps>;
  Break?: () => JSX.Element;
  Code?: MDXComponent<CodeProps>;
  Definition?: MDXComponent<ResourceProps & AssociationProps>;
  Delete?: MDXComponent<ParentProps>;
  Emphasis?: MDXComponent<ParentProps>;
  FootnoteDefinition?: MDXComponent<ParentProps & AssociationProps>;
  FootnoteReference?: MDXComponent<AssociationProps>;
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
  builtins: MDXBuiltinComponents;
  components?: Record<string, Component<unknown>>;
}
