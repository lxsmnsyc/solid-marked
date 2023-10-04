/* eslint-disable @typescript-eslint/no-use-before-define */
import type * as mdast from 'mdast';
import * as mdastString from 'mdast-util-to-string';
import type { JSX } from 'solid-js';
import { createComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { StateContext } from './types';

function compileBlockquote(ctx: StateContext, node: mdast.Blockquote): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Blockquote;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileBreak(ctx: StateContext): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Break;
      },
    },
  );
}

function compileCode(ctx: StateContext, node: mdast.Code): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Code;
      },
      lang: node.lang,
      meta: node.meta,
      children: node.value,
    },
  );
}

function compileDefinition(ctx: StateContext, node: mdast.Definition): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Definition;
      },
      url: node.url,
      title: node.title,
      identifier: node.identifier,
      label: node.label,
    },
  );
}

function compileDelete(ctx: StateContext, node: mdast.Delete): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Delete;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileEmphasis(ctx: StateContext, node: mdast.Emphasis): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Emphasis;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileFootnoteDefinition(ctx: StateContext, node: mdast.FootnoteDefinition): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.FootnoteDefinition;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
      identifier: node.identifier,
      label: node.label,
    },
  );
}

function compileFootnoteReference(ctx: StateContext, node: mdast.FootnoteReference): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.FootnoteReference;
      },
      identifier: node.identifier,
      label: node.label,
    },
  );
}

function compileHeading(ctx: StateContext, node: mdast.Heading): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Heading;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
      id: ctx.slugger.slug(mdastString.toString(node, { includeImageAlt: false })),
      depth: node.depth,
    },
  );
}

function compileImage(ctx: StateContext, node: mdast.Image): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Image;
      },
      url: node.url,
      title: node.title,
      alt: node.alt,
    },
  );
}

function compileImageReference(ctx: StateContext, node: mdast.ImageReference): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.ImageReference;
      },
      identifier: node.identifier,
      label: node.label,
      alt: node.alt,
      referenceType: node.referenceType,
    },
  );
}

function compileInlineCode(ctx: StateContext, node: mdast.InlineCode): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.InlineCode;
      },
      children: node.value,
    },
  );
}

function compileLink(ctx: StateContext, node: mdast.Link): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Link;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
      url: node.url,
      title: node.title,
    },
  );
}

function compileLinkReference(ctx: StateContext, node: mdast.LinkReference): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.LinkReference;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
      referenceType: node.referenceType,
      identifier: node.identifier,
      label: node.label,
    },
  );
}

function compileList(ctx: StateContext, node: mdast.List): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.List;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
      ordered: node.ordered,
      spread: node.spread,
      start: node.start,
    },
  );
}

function compileListItem(ctx: StateContext, node: mdast.ListItem): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.ListItem;
      },
      checked: node.checked,
      spread: node.spread,
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileParagraph(ctx: StateContext, node: mdast.Paragraph): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Paragraph;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileRoot(ctx: StateContext, node: mdast.Root): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Root;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileStrong(ctx: StateContext, node: mdast.Strong): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Strong;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileTable(ctx: StateContext, node: mdast.Table): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.Table;
      },
      get children() {
        return node.children.map((value, i) => compileTableRow(ctx, value, i === 0));
      },
      align: node.align,
    },
  );
}

function compileTableCell(ctx: StateContext, node: mdast.TableCell): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.TableCell;
      },
      get children() {
        return renderContent(ctx, node.children);
      },
    },
  );
}

function compileTableRow(ctx: StateContext, node: mdast.TableRow, isHead: boolean): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.TableRow;
      },
      get children() {
        return node.children.map((value) => compileTableCell(ctx, value));
      },
      isHead,
    },
  );
}

function compileThematicBreak(ctx: StateContext): JSX.Element {
  return createComponent(
    Dynamic,
    {
      get component() {
        return ctx.props.builtins.ThematicBreak;
      },
    },
  );
}

export function compileNode(ctx: StateContext, node: mdast.Nodes): JSX.Element {
  switch (node.type) {
    case 'blockquote':
      return compileBlockquote(ctx, node);
    case 'break':
      return compileBreak(ctx);
    case 'code':
      return compileCode(ctx, node);
    case 'definition':
      return compileDefinition(ctx, node);
    case 'delete':
      return compileDelete(ctx, node);
    case 'emphasis':
      return compileEmphasis(ctx, node);
    case 'footnoteDefinition':
      return compileFootnoteDefinition(ctx, node);
    case 'footnoteReference':
      return compileFootnoteReference(ctx, node);
    case 'heading':
      return compileHeading(ctx, node);
    case 'image':
      return compileImage(ctx, node);
    case 'imageReference':
      return compileImageReference(ctx, node);
    case 'inlineCode':
      return compileInlineCode(ctx, node);
    case 'link':
      return compileLink(ctx, node);
    case 'linkReference':
      return compileLinkReference(ctx, node);
    case 'list':
      return compileList(ctx, node);
    case 'listItem':
      return compileListItem(ctx, node);
    case 'paragraph':
      return compileParagraph(ctx, node);
    case 'root':
      return compileRoot(ctx, node);
    case 'strong':
      return compileStrong(ctx, node);
    case 'table':
      return compileTable(ctx, node);
    case 'tableCell':
      return compileTableCell(ctx, node);
    case 'tableRow':
      return compileTableRow(ctx, node, false);
    case 'text':
      return node.value;
    case 'thematicBreak':
      return compileThematicBreak(ctx);
    case 'html':
    case 'mdxFlowExpression':
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
    case 'mdxTextExpression':
    case 'mdxjsEsm':
    case 'toml':
    case 'yaml':
    default:
      throw new Error('invalid node');
  }
}

function renderContent(ctx: StateContext, nodes: mdast.RootContent[]): JSX.Element {
  return nodes.map((node) => compileNode(ctx, node));
}
