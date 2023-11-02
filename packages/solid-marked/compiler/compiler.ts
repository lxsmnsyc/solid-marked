/* eslint-disable @typescript-eslint/no-use-before-define */
import type * as mdast from 'mdast';
import * as mdastString from 'mdast-util-to-string';
import { SourceNode } from 'source-map';
import type * as mdastMDX from 'mdast-util-mdx';
import * as seroval from 'seroval';
import * as yaml from 'yaml';
import * as toml from 'toml';
import type { StateContext } from './types';
import { serializeString } from './string';

interface TOML extends mdast.Literal {
  type: 'toml';
}

declare module 'mdast' {
  // Allow using TOML nodes defined by `mdast-util-frontmatter`.
  interface FrontmatterContentMap {
    toml: TOML;
  }
  interface RootContentMap {
    toml: TOML;
  }
}

function createSourceNode(ctx: StateContext, base: mdast.Nodes): SourceNode {
  const col = base.position?.start.column;
  return new SourceNode(
    base.position?.start.line ?? null,
    col != null ? col - 1 : null,
    ctx.source,
  );
}

function addStringAttribute(result: SourceNode, name: string, value: string): void {
  result.add(` ${name}={${serializeString(value)}}`);
}
function addJSAttribute(result: SourceNode, name: string, expression: string): void {
  result.add(` ${name}={${expression}}`);
}

function applyAssociation(result: SourceNode, node: mdast.Association): void {
  addStringAttribute(result, 'identifier', node.identifier);
  if (node.label) {
    addStringAttribute(result, 'label', node.label);
  }
}

function applyResource(result: SourceNode, node: mdast.Resource): void {
  addStringAttribute(result, 'url', node.url);
  if (node.title) {
    addStringAttribute(result, 'title', node.title);
  }
}

function applyAlternative(result: SourceNode, node: mdast.Alternative): void {
  if (node.alt) {
    addStringAttribute(result, 'alt', node.alt);
  }
}

function applyReference(result: SourceNode, node: mdast.Reference): void {
  applyAssociation(result, node);
  addStringAttribute(result, 'referenceType', node.referenceType);
}

interface TagOptions {
  isClosing?: boolean;
  isMDX?: boolean;
}

function createTag(ctx: StateContext, target: string, tagOpts: TagOptions = {}): string {
  if (ctx.options.noDynamicComponents === 'only-mdx' && tagOpts.isMDX) {
    return target;
  }
  if (ctx.options.noDynamicComponents === true) {
    return target;
  }
  if (tagOpts.isClosing) {
    return 'Dynamic';
  }

  return `Dynamic component={${target}}`;
}

function createJSXTag(
  ctx: StateContext,
  nodeName: string,
): string {
  if (ctx.options.noDynamicComponents) {
    return nodeName;
  }
  // Test for dashed elements
  if (/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)+$/.test(nodeName)) {
    return `${CTX_VAR}.components['${nodeName}']`;
  }
  if (/^[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(nodeName)) {
    return `${CTX_VAR}.components['${nodeName}']`;
  }
  return `typeof ${nodeName} === 'undefined' ? ${CTX_VAR}.components.${nodeName} : ${nodeName}`;
}

type ExcludedTags =
  | 'mdxFlowExpression'
  | 'mdxjsEsm'
  | 'mdxJsxFlowElement'
  | 'mdxJsxTextElement'
  | 'mdxTextExpression'
  | 'text'
  | 'yaml'
  | 'toml';
type WithTags = Exclude<mdast.Nodes['type'], ExcludedTags>

export const CTX_VAR = '_ctx$';

const MARKUP: Record<WithTags, string> = {
  blockquote: `${CTX_VAR}.builtins.Blockquote`,
  break: `${CTX_VAR}.builtins.Break`,
  code: `${CTX_VAR}.builtins.Code`,
  definition: `${CTX_VAR}.builtins.Definition`,
  delete: `${CTX_VAR}.builtins.Delete`,
  emphasis: `${CTX_VAR}.builtins.Emphasis`,
  footnoteDefinition: `${CTX_VAR}.builtins.FootnoteDefinition`,
  footnoteReference: `${CTX_VAR}.builtins.FootnoteReference`,
  heading: `${CTX_VAR}.builtins.Heading`,
  html: `${CTX_VAR}.builtins.HTML`,
  image: `${CTX_VAR}.builtins.Image`,
  imageReference: `${CTX_VAR}.builtins.ImageReference`,
  inlineCode: `${CTX_VAR}.builtins.InlineCode`,
  link: `${CTX_VAR}.builtins.Link`,
  linkReference: `${CTX_VAR}.builtins.LinkReference`,
  list: `${CTX_VAR}.builtins.List`,
  listItem: `${CTX_VAR}.builtins.ListItem`,
  paragraph: `${CTX_VAR}.builtins.Paragraph`,
  root: `${CTX_VAR}.builtins.Root`,
  strong: `${CTX_VAR}.builtins.Strong`,
  table: `${CTX_VAR}.builtins.Table`,
  tableCell: `${CTX_VAR}.builtins.TableCell`,
  tableRow: `${CTX_VAR}.builtins.TableRow`,
  thematicBreak: `${CTX_VAR}.builtins.ThematicBreak`,
};

function compileRoot(ctx: StateContext, node: mdast.Root): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.root;
  result.add(`<${createTag(ctx, tag)}>`);
  addContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileParagraph(ctx: StateContext, node: mdast.Paragraph): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.paragraph;
  result.add(`<${createTag(ctx, tag)}>`);
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileHeading(ctx: StateContext, node: mdast.Heading): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.heading;
  const content = mdastString.toString(node, { includeImageAlt: false });
  result.add(`<${createTag(ctx, tag)}`);
  addJSAttribute(result, 'depth', node.depth.toString());
  addStringAttribute(result, 'id', ctx.slugger.slug(content));
  result.add('>');
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileThematicBreak(ctx: StateContext, node: mdast.ThematicBreak): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.thematicBreak)} />`);
  return result;
}

function compileBlockquote(ctx: StateContext, node: mdast.Blockquote): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.blockquote;
  result.add(`<${createTag(ctx, tag)}>`);
  addBlockOrDefinitionContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileList(ctx: StateContext, node: mdast.List): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.list;
  result.add(`<${createTag(ctx, tag)}`);
  if (node.ordered != null) {
    addJSAttribute(result, 'ordered', node.ordered.toString());
  }
  if (node.spread != null) {
    addJSAttribute(result, 'spread', node.spread.toString());
  }
  if (node.start != null) {
    addJSAttribute(result, 'start', node.start.toString());
  }
  result.add('>');
  for (let i = 0, len = node.children.length; i < len; i += 1) {
    result.add(compileListItem(ctx, node.children[i]));
  }
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileListItem(ctx: StateContext, node: mdast.ListItem): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.listItem;
  result.add(`<${createTag(ctx, tag)}`);
  if (node.spread != null) {
    addJSAttribute(result, 'spread', node.spread.toString());
  }
  if (node.checked != null) {
    addJSAttribute(result, 'checked', node.checked.toString());
  }
  result.add('>');
  addBlockOrDefinitionContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileHTML(ctx: StateContext, node: mdast.Html): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.html;
  result.add(`<${createTag(ctx, tag)}>`);
  result.add(`{${serializeString(node.value)}}`);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileCode(ctx: StateContext, node: mdast.Code): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.code;
  result.add(`<${createTag(ctx, tag)}`);
  if (node.lang) {
    addStringAttribute(result, 'lang', node.lang);
  }
  if (node.meta) {
    addStringAttribute(result, 'meta', node.meta);
  }
  result.add('>');
  result.add(`{${serializeString(node.value)}}`);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileDefinition(ctx: StateContext, node: mdast.Definition): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.definition)}`);
  applyResource(result, node);
  applyAssociation(result, node);
  result.add(' />');
  return result;
}

function compileText(ctx: StateContext, node: mdast.Text): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(node.value);
  return result;
}

function compileEmphasis(ctx: StateContext, node: mdast.Emphasis): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.emphasis;
  result.add(`<${createTag(ctx, tag)}>`);
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileStrong(ctx: StateContext, node: mdast.Strong): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.strong;
  result.add(`<${createTag(ctx, tag)}>`);
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileInlineCode(ctx: StateContext, node: mdast.InlineCode): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.inlineCode;
  result.add(`<${createTag(ctx, tag)}>`);
  result.add(`{${serializeString(node.value)}}`);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileBreak(ctx: StateContext, node: mdast.Break): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.break)} />`);
  return result;
}

function compileLink(ctx: StateContext, node: mdast.Link): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.link;
  result.add(`<${createTag(ctx, tag)}`);
  applyResource(result, node);
  result.add('>');
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileImage(ctx: StateContext, node: mdast.Image): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.image)}`);
  applyResource(result, node);
  applyAlternative(result, node);
  result.add(' />');
  return result;
}

function compileLinkReference(ctx: StateContext, node: mdast.LinkReference): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.linkReference;
  result.add(`<${createTag(ctx, tag)}`);
  applyReference(result, node);
  result.add('>');
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileImageReference(ctx: StateContext, node: mdast.ImageReference): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.imageReference)}`);
  applyReference(result, node);
  applyAlternative(result, node);
  result.add(' />');
  return result;
}

function compileFootnoteDefinition(ctx: StateContext, node: mdast.FootnoteDefinition): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.footnoteDefinition;
  result.add(`<${createTag(ctx, tag)}`);
  applyAssociation(result, node);
  result.add('>');
  addBlockOrDefinitionContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileFootnoteReference(ctx: StateContext, node: mdast.FootnoteReference): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`<${createTag(ctx, MARKUP.footnoteReference)}`);
  applyAssociation(result, node);
  result.add(' />');
  return result;
}

function compileTable(ctx: StateContext, node: mdast.Table): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.table;
  result.add(`<${createTag(ctx, tag)}`);
  if (node.align != null) {
    addJSAttribute(result, 'align', JSON.stringify(node.align));
  }
  result.add('>');
  for (let i = 0, len = node.children.length; i < len; i += 1) {
    result.add(compileTableRow(ctx, node.children[i], i === 0));
  }
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileTableRow(ctx: StateContext, node: mdast.TableRow, isHead: boolean): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.tableRow;
  result.add(`<${createTag(ctx, tag)}`);
  if (isHead) {
    addJSAttribute(result, 'isHead', 'true');
  }
  result.add('>');
  for (let i = 0, len = node.children.length; i < len; i += 1) {
    result.add(compileTableCell(ctx, node.children[i]));
  }
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileTableCell(ctx: StateContext, node: mdast.TableCell): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.tableCell;
  result.add(`<${createTag(ctx, tag)}>`);
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileDelete(ctx: StateContext, node: mdast.Delete): SourceNode {
  const result = createSourceNode(ctx, node);
  const tag = MARKUP.delete;
  result.add(`<${createTag(ctx, tag)}>`);
  addPhrasingContent(ctx, result, node.children);
  result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
  return result;
}

function compileMDXExpression(
  ctx: StateContext,
  node: mdastMDX.MdxTextExpression | mdastMDX.MdxFlowExpression,
): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`{${node.value}}`);
  return result;
}

function compileMDXElement(
  ctx: StateContext,
  node: mdastMDX.MdxJsxTextElement | mdastMDX.MdxJsxFlowElement,
): SourceNode {
  const result = createSourceNode(ctx, node);
  if (node.name) {
    const name = createJSXTag(ctx, node.name);
    result.add(`<${createTag(ctx, name, { isMDX: true })}`);
    for (let i = 0, len = node.attributes.length; i < len; i += 1) {
      const attribute = node.attributes[i];
      const attributeNode = new SourceNode(
        attribute.position?.start.line ?? null,
        attribute.position?.start.column ?? null,
        ctx.source,
      );
      if (attribute.type === 'mdxJsxAttribute') {
        attributeNode.add(` ${attribute.name}`);
        if (attribute.value) {
          if (typeof attribute.value === 'string') {
            attributeNode.add(`={${serializeString(attribute.value)}}`);
          } else {
            const attributeValueNode = new SourceNode(
              attribute.value.position?.start.line ?? null,
              attribute.value.position?.start.column ?? null,
              ctx.source,
            );
            attributeValueNode.add(attribute.value.value);
            attributeNode.add(['={', attributeValueNode, '}']);
          }
        }
      } else {
        attributeNode.add(` {...${attribute.value}}`);
      }
      result.add(attributeNode);
    }
    result.add('>');
    addContent(ctx, result, node.children);
    result.add(`</${createTag(ctx, name, { isClosing: true, isMDX: true })}>`);
  } else {
    result.add('<>');
    addContent(ctx, result, node.children);
    result.add('</>');
  }
  return result;
}

function compileMDXESM(ctx: StateContext, node: mdastMDX.MdxjsEsm): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(`${node.value}\n`);
  ctx.imports.push(result);
  return new SourceNode();
}

function compileYAML(ctx: StateContext, node: mdast.Yaml): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(seroval.serialize(
    yaml.parse(node.value),
  ));
  ctx.frontmatter = result;
  return new SourceNode();
}

function compileTOML(ctx: StateContext, node: TOML): SourceNode {
  const result = createSourceNode(ctx, node);
  result.add(seroval.serialize(
    toml.parse(node.value),
  ));
  ctx.frontmatter = result;
  return new SourceNode();
}

function compileBlockOrDefinitionContent(
  ctx: StateContext,
  node: mdast.BlockContent | mdast.DefinitionContent,
): SourceNode {
  switch (node.type) {
    case 'blockquote':
      return compileBlockquote(ctx, node);
    case 'code':
      return compileCode(ctx, node);
    case 'heading':
      return compileHeading(ctx, node);
    case 'html':
      return compileHTML(ctx, node);
    case 'list':
      return compileList(ctx, node);
    case 'mdxFlowExpression':
      return compileMDXExpression(ctx, node);
    case 'mdxJsxFlowElement':
      return compileMDXElement(ctx, node);
    case 'paragraph':
      return compileParagraph(ctx, node);
    case 'table':
      return compileTable(ctx, node);
    case 'thematicBreak':
      return compileThematicBreak(ctx, node);
    case 'definition':
      return compileDefinition(ctx, node);
    case 'footnoteDefinition':
      return compileFootnoteDefinition(ctx, node);
    default:
      throw new Error('invariant');
  }
}

function compilePhrasingContent(
  ctx: StateContext,
  node: mdast.PhrasingContent,
): SourceNode {
  switch (node.type) {
    case 'break':
      return compileBreak(ctx, node);
    case 'delete':
      return compileDelete(ctx, node);
    case 'emphasis':
      return compileEmphasis(ctx, node);
    case 'footnoteReference':
      return compileFootnoteReference(ctx, node);
    case 'html':
      return compileHTML(ctx, node);
    case 'image':
      return compileImage(ctx, node);
    case 'imageReference':
      return compileImageReference(ctx, node);
    case 'inlineCode':
      return compileInlineCode(ctx, node);
    case 'mdxJsxTextElement':
      return compileMDXElement(ctx, node);
    case 'mdxTextExpression':
      return compileMDXExpression(ctx, node);
    case 'strong':
      return compileStrong(ctx, node);
    case 'text':
      return compileText(ctx, node);
    case 'link':
      return compileLink(ctx, node);
    case 'linkReference':
      return compileLinkReference(ctx, node);
    default:
      throw new Error('invariant');
  }
}

function addPhrasingContent(
  ctx: StateContext,
  source: SourceNode,
  nodes: mdast.PhrasingContent[],
): void {
  for (let i = 0, len = nodes.length; i < len; i += 1) {
    source.add(compilePhrasingContent(ctx, nodes[i]));
  }
}

function addBlockOrDefinitionContent(
  ctx: StateContext,
  source: SourceNode,
  nodes: (mdast.BlockContent | mdast.DefinitionContent)[],
): void {
  for (let i = 0, len = nodes.length; i < len; i += 1) {
    source.add(compileBlockOrDefinitionContent(ctx, nodes[i]));
  }
}

export function compileNode(
  ctx: StateContext,
  node: mdast.Nodes,
): SourceNode {
  switch (node.type) {
    case 'root':
      return compileRoot(ctx, node);
    case 'paragraph':
      return compileParagraph(ctx, node);
    case 'heading':
      return compileHeading(ctx, node);
    case 'thematicBreak':
      return compileThematicBreak(ctx, node);
    case 'blockquote':
      return compileBlockquote(ctx, node);
    case 'list':
      return compileList(ctx, node);
    case 'listItem':
      return compileListItem(ctx, node);
    case 'code':
      return compileCode(ctx, node);
    case 'definition':
      return compileDefinition(ctx, node);
    case 'text':
      return compileText(ctx, node);
    case 'emphasis':
      return compileEmphasis(ctx, node);
    case 'strong':
      return compileStrong(ctx, node);
    case 'inlineCode':
      return compileInlineCode(ctx, node);
    case 'break':
      return compileBreak(ctx, node);
    case 'link':
      return compileLink(ctx, node);
    case 'image':
      return compileImage(ctx, node);
    case 'linkReference':
      return compileLinkReference(ctx, node);
    case 'imageReference':
      return compileImageReference(ctx, node);
    case 'footnoteDefinition':
      return compileFootnoteDefinition(ctx, node);
    case 'footnoteReference':
      return compileFootnoteReference(ctx, node);
    case 'table':
      return compileTable(ctx, node);
    case 'tableCell':
      return compileTableCell(ctx, node);
    case 'tableRow':
      return compileTableRow(ctx, node, false);
    case 'delete':
      return compileDelete(ctx, node);
    case 'mdxTextExpression':
    case 'mdxFlowExpression':
      return compileMDXExpression(ctx, node);
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      return compileMDXElement(ctx, node);
    case 'mdxjsEsm':
      return compileMDXESM(ctx, node);
    case 'yaml':
      return compileYAML(ctx, node);
    case 'toml':
      return compileTOML(ctx, node);
    default:
      throw new Error('Invalid node type');
  }
}

function addContent(
  ctx: StateContext,
  source: SourceNode,
  nodes: mdast.RootContent[],
): void {
  for (let i = 0, len = nodes.length; i < len; i += 1) {
    source.add(compileNode(ctx, nodes[i]));
  }
}
