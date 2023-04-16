// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../env.d.ts" />
import type {
  Association,
  Resource,
  Alternative,
  Reference,
  Literal,
} from 'mdast';
import {
  Node,
  Parent,
} from 'mdast-util-from-markdown/lib';
import {
  RawSourceMap,
  SourceNode,
} from 'source-map';
import {
  fromMarkdown,
} from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { toString } from 'mdast-util-to-string';
import { toc } from 'mdast-util-toc';
import { mdxjs } from 'micromark-extension-mdxjs';
import { gfm } from 'micromark-extension-gfm';
import { frontmatter } from 'micromark-extension-frontmatter';
import * as seroval from 'seroval';
import * as yaml from 'yaml';
import * as toml from 'toml';
import GithubSlugger from 'github-slugger';
import { serializeString } from './string';

interface Toml extends Literal {
  type: 'toml'
}

declare module 'mdast' {
  interface FrontmatterContentMap {
    // Allow using TOML nodes defined by `mdast-util-frontmatter`.
    toml: Toml
  }
}

export interface Options {
  mdxImportSource?: string;
  noDynamicComponents?: boolean | 'only-mdx';
}

interface StateContext {
  source: string;
  imports: SourceNode[];
  options: Options;
  frontmatter?: SourceNode;
  slugger: GithubSlugger;
}

function createSourceNode(ctx: StateContext, base: Node): SourceNode {
  const col = base.position?.start.column;
  return new SourceNode(
    base.position?.start.line ?? null,
    col != null ? col - 1 : null,
    ctx.source,
  );
}

function addStringAttribute(result: SourceNode, name: string, value: string) {
  result.add(` ${name}={${serializeString(value)}}`);
}
function addJSAttribute(result: SourceNode, name: string, expression: string) {
  result.add(` ${name}={${expression}}`);
}

function applyAssociation(result: SourceNode, node: Association) {
  addStringAttribute(result, 'identifier', node.identifier);
  if (node.label) {
    addStringAttribute(result, 'label', node.label);
  }
}

function applyResource(result: SourceNode, node: Resource) {
  addStringAttribute(result, 'url', node.url);
  if (node.title) {
    addStringAttribute(result, 'title', node.title);
  }
}

function applyAlternative(result: SourceNode, node: Alternative) {
  if (node.alt) {
    addStringAttribute(result, 'alt', node.alt);
  }
}

function applyReference(result: SourceNode, node: Reference) {
  addStringAttribute(result, 'referenceType', node.referenceType);
}

interface TagOptions {
  isClosing?: boolean;
  isMDX?: boolean;
}

function createTag(ctx: StateContext, target: string, tagOpts: TagOptions = {}) {
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
) {
  if (ctx.options.noDynamicComponents) {
    return nodeName;
  }
  // Test for dashed elements
  if (/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)+$/.test(nodeName)) {
    return `__ctx.components['${nodeName}']`;
  }
  if (/^[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(nodeName)) {
    return `__ctx.components['${nodeName}']`;
  }
  return `typeof ${nodeName} === 'undefined' ? __ctx.components.${nodeName} : ${nodeName}`;
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
type WithTags = Exclude<Node['type'], ExcludedTags>

const CTX_VAR = '_ctx$';
const USE_MDX_VAR = '_useMDX$';

const MARKUP: Record<WithTags, string> = {
  blockquote: `${CTX_VAR}.builtins.Blockquote`,
  break: `${CTX_VAR}.builtins.Break`,
  code: `${CTX_VAR}.builtins.Code`,
  definition: `${CTX_VAR}.builtins.Definition`,
  delete: `${CTX_VAR}.builtins.Delete`,
  emphasis: `${CTX_VAR}.builtins.Emphasis`,
  footnote: `${CTX_VAR}.builtins.Footnote`,
  footnoteDefinition: `${CTX_VAR}.builtins.FootnoteDefinition`,
  footnoteReference: `${CTX_VAR}.builtins.FootnoteReference`,
  heading: `${CTX_VAR}.builtins.Heading`,
  html: `${CTX_VAR}.builtins.Html`,
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

function traverse(
  ctx: StateContext,
  node: Node,
): SourceNode {
  function applyContent(result: SourceNode, content: Parent) {
    for (let i = 0, len = content.children.length; i < len; i += 1) {
      result.add(traverse(ctx, content.children[i]));
    }
  }
  switch (node.type) {
    case 'blockquote':
    case 'delete':
    case 'emphasis':
    case 'footnote':
    case 'paragraph':
    case 'root':
    case 'strong':
    case 'tableCell':
    case 'tableRow': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP[node.type];
      result.add(`<${createTag(ctx, tag)}>`);
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'break':
    case 'thematicBreak': {
      const result = createSourceNode(ctx, node);
      result.add(`<${createTag(ctx, MARKUP[node.type])} />`);
      return result;
    }
    case 'code': {
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
    case 'definition': {
      const result = createSourceNode(ctx, node);
      result.add(`<${createTag(ctx, MARKUP.definition)}`);
      applyResource(result, node);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'footnoteDefinition': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP.footnoteDefinition;
      result.add(`<${createTag(ctx, tag)}`);
      applyAssociation(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'footnoteReference': {
      const result = createSourceNode(ctx, node);
      result.add(`<${createTag(ctx, MARKUP.footnoteReference)}`);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'heading': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP.heading;
      const content = toString(node, { includeImageAlt: false });
      result.add(`<${createTag(ctx, tag)}`);
      addJSAttribute(result, 'depth', node.depth.toString());
      addStringAttribute(result, 'id', ctx.slugger.slug(content));
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'html':
    case 'inlineCode': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP[node.type];
      result.add(`<${createTag(ctx, tag)}>`);
      result.add(`{${serializeString(node.value)}}`);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'image': {
      const result = createSourceNode(ctx, node);
      result.add(`<${createTag(ctx, MARKUP.image)}`);
      applyResource(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'imageReference': {
      const result = createSourceNode(ctx, node);
      result.add(`<${createTag(ctx, MARKUP.imageReference)}>`);
      applyReference(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'link': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP.link;
      result.add(`<${createTag(ctx, tag)}`);
      applyResource(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'linkReference': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP.linkReference;
      result.add(`<${createTag(ctx, tag)}`);
      applyReference(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'list': {
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
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'listItem': {
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
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'mdxTextExpression':
    case 'mdxFlowExpression': {
      const result = createSourceNode(ctx, node);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement': {
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
        applyContent(result, node);
        result.add(`</${createTag(ctx, name, { isClosing: true, isMDX: true })}>`);
      } else {
        result.add('<>');
        applyContent(result, node);
        result.add('</>');
      }
      return result;
    }
    case 'mdxjsEsm': {
      const result = createSourceNode(ctx, node);
      result.add(`${node.value}\n`);
      ctx.imports.push(result);
      return new SourceNode();
    }
    case 'table': {
      const result = createSourceNode(ctx, node);
      const tag = MARKUP.table;
      result.add(`<${createTag(ctx, tag)}`);
      if (node.align != null) {
        addJSAttribute(result, 'align', JSON.stringify(node.align));
      }
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(ctx, tag, { isClosing: true })}>`);
      return result;
    }
    case 'text': {
      const result = createSourceNode(ctx, node);
      result.add(node.value);
      return result;
    }
    case 'yaml': {
      const result = createSourceNode(ctx, node);
      result.add(seroval.serialize(
        yaml.parse(node.value),
      ));
      ctx.frontmatter = result;
      return new SourceNode();
    }
    case 'toml': {
      const result = createSourceNode(ctx, node);
      result.add(seroval.serialize(
        toml.parse(node.value),
      ));
      ctx.frontmatter = result;
      return new SourceNode();
    }
    default:
      throw new Error('Invalid node type');
  }
}

export interface Result {
  code: string;
  map: RawSourceMap;
}

export function compile(
  fileName: string,
  markdownCode: string,
  options: Options = {},
): Result {
  const ast = fromMarkdown(markdownCode, {
    extensions: [
      mdxjs(),
      gfm(),
      frontmatter(['yaml', 'toml']),
    ],
    mdastExtensions: [
      mdxFromMarkdown(),
      gfmFromMarkdown(),
      frontmatterFromMarkdown(['yaml', 'toml']),
    ],
  });

  const tocAST = toc(ast);

  const ctx: StateContext = {
    source: fileName,
    options,
    imports: [],
    frontmatter: undefined,
    slugger: new GithubSlugger(),
  };
  const render = traverse(ctx, ast);

  const compiled = new SourceNode(null, null, fileName);

  compiled.add(ctx.imports);
  if (ctx.frontmatter) {
    compiled.add('export const frontmatter = ');
    compiled.add(ctx.frontmatter);
    compiled.add(';\n');
  }
  compiled.add(`import { useMDX as ${USE_MDX_VAR} } from '${options.mdxImportSource || 'solid-marked'}';\n\n`);
  if (tocAST.map) {
    const renderedTOC = traverse(ctx, tocAST.map);
    compiled.add('export function TableOfContents(props) {\n');
    compiled.add(` const ${CTX_VAR} = ${USE_MDX_VAR}();\n`);
    compiled.add(' return (\n');
    compiled.add(renderedTOC);
    compiled.add('\n );\n');
    compiled.add('}\n');
  }
  compiled.add('export default function Component(props) {\n');
  compiled.add(` const ${CTX_VAR} = ${USE_MDX_VAR}();\n`);
  compiled.add(' return (\n');
  compiled.add(render);
  compiled.add('\n );\n');
  compiled.add('}\n');

  compiled.setSourceContent(fileName, markdownCode);

  const compiledResult = compiled.toStringWithSourceMap();

  return {
    code: compiledResult.code,
    map: compiledResult.map.toJSON(),
  };
}

export * from './interfaces';
