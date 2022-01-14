import {
  Component,
  createComponent,
  createContext,
  JSX,
  splitProps,
  useContext,
} from 'solid-js';

export interface ParentProps {
  children?: JSX.Element;
}

export interface LiteralProps {
  children: string;
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

export interface CodeProps extends LiteralProps {
  lang?: string;
  meta?: string;
}

export interface HeadingProps extends ParentProps {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
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
  Html: MDXComponent<LiteralProps>;
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
}

const MDXContext = createContext<MDXProps>();

export function MDXProvider(props: MDXProps & { children: JSX.Element }): JSX.Element {
  const [local, other] = splitProps(props, ['children']);
  return (
    createComponent(MDXContext.Provider, {
      value: other,
      get children() {
        return local.children;
      },
    })
  );
}

export function useMDXContext(): MDXProps {
  const ctx = useContext(MDXContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing MDXProvider');
}
