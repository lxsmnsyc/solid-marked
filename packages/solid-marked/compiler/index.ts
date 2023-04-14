// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../env.d.ts" />

import type {
  Association,
  Resource,
  Alternative,
  Reference,
} from 'mdast';
import {
  Node,
  Parent,
} from 'mdast-util-from-markdown/lib';
import {
  RawSourceMap,
  SourceNode,
} from 'source-map';

export interface Options {
  mdxImportSource?: string;
  noDynamicComponents?: boolean | 'only-mdx';
}

function createSourceNode(source: string, base: Node): SourceNode {
  const col = base.position?.start.column;
  return new SourceNode(
    base.position?.start.line ?? null,
    col != null ? col - 1 : null,
    source,
  );
}

function escapeString(value: string) {
  return value.replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function addStringAttribute(result: SourceNode, name: string, value: string) {
  result.add(` ${name}={\`${escapeString(value)}\`}`);
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

function createTag(target: string, options: Options, tagOpts: TagOptions = {}) {
  if (options.noDynamicComponents === 'only-mdx' && tagOpts.isMDX) {
    return target;
  }
  if (options.noDynamicComponents === true) {
    return target;
  }
  if (tagOpts.isClosing) {
    return 'Dynamic';
  }

  return `Dynamic component={${target}}`;
}

function createJSXTag(
  nodeName: string,
  options: Options,
) {
  if (options.noDynamicComponents) {
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
  | 'yaml';
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
  source: string,
  node: Node,
  imports: SourceNode[],
  options: Options,
): SourceNode {
  function applyContent(result: SourceNode, content: Parent) {
    for (let i = 0, len = content.children.length; i < len; i += 1) {
      result.add(traverse(source, content.children[i], imports, options));
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
      const result = createSourceNode(source, node);
      const tag = MARKUP[node.type];
      result.add(`<${createTag(tag, options)}>`);
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'break':
    case 'thematicBreak': {
      const result = createSourceNode(source, node);
      result.add(`<${createTag(MARKUP[node.type], options)} />`);
      return result;
    }
    case 'code': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.code;
      result.add(`<${createTag(tag, options)}`);
      if (node.lang) {
        addStringAttribute(result, 'lang', node.lang);
      }
      if (node.meta) {
        addStringAttribute(result, 'meta', node.meta);
      }
      result.add('>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'definition': {
      const result = createSourceNode(source, node);
      result.add(`<${createTag(MARKUP.definition, options)}`);
      applyResource(result, node);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'footnoteDefinition': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.footnoteDefinition;
      result.add(`<${createTag(tag, options)}`);
      applyAssociation(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'footnoteReference': {
      const result = createSourceNode(source, node);
      result.add(`<${createTag(MARKUP.footnoteReference, options)}`);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'heading': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.heading;
      result.add(`<${createTag(tag, options)}`);
      addJSAttribute(result, 'depth', node.depth.toString());
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'html':
    case 'inlineCode': {
      const result = createSourceNode(source, node);
      const tag = MARKUP[node.type];
      result.add(`<${createTag(tag, options)}>`);
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'image': {
      const result = createSourceNode(source, node);
      result.add(`<${createTag(MARKUP.image, options)}`);
      applyResource(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'imageReference': {
      const result = createSourceNode(source, node);
      result.add(`<${createTag(MARKUP.imageReference, options)}>`);
      applyReference(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'link': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.link;
      result.add(`<${createTag(tag, options)}`);
      applyResource(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'linkReference': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.linkReference;
      result.add(`<${createTag(tag, options)}`);
      applyReference(result, node);
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'list': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.list;
      result.add(`<${createTag(tag, options)}`);
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
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'listItem': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.listItem;
      result.add(`<${createTag(tag, options)}`);
      if (node.spread != null) {
        addJSAttribute(result, 'spread', node.spread.toString());
      }
      if (node.checked != null) {
        addJSAttribute(result, 'checked', node.checked.toString());
      }
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'mdxTextExpression':
    case 'mdxFlowExpression': {
      const result = createSourceNode(source, node);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement': {
      const result = createSourceNode(source, node);
      if (node.name) {
        const name = createJSXTag(node.name, options);
        result.add(`<${createTag(name, options, { isMDX: true })}`);
        for (let i = 0, len = node.attributes.length; i < len; i += 1) {
          const attribute = node.attributes[i];
          const attributeNode = new SourceNode(
            attribute.position?.start.line ?? null,
            attribute.position?.start.column ?? null,
            source,
          );
          if (attribute.type === 'mdxJsxAttribute') {
            attributeNode.add(` ${attribute.name}`);
            if (attribute.value) {
              if (typeof attribute.value === 'string') {
                attributeNode.add(`={\`${escapeString(attribute.value)}\`}`);
              } else {
                const attributeValueNode = new SourceNode(
                  attribute.value.position?.start.line ?? null,
                  attribute.value.position?.start.column ?? null,
                  source,
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
        result.add(`</${createTag(name, options, { isClosing: true, isMDX: true })}>`);
      } else {
        result.add('<>');
        applyContent(result, node);
        result.add('</>');
      }
      return result;
    }
    case 'mdxjsEsm': {
      const result = createSourceNode(source, node);
      result.add(`${node.value}\n`);
      imports.push(result);
      return new SourceNode();
    }
    case 'table': {
      const result = createSourceNode(source, node);
      const tag = MARKUP.table;
      result.add(`<${createTag(tag, options)}`);
      if (node.align != null) {
        addJSAttribute(result, 'align', JSON.stringify(node.align));
      }
      result.add('>');
      applyContent(result, node);
      result.add(`</${createTag(tag, options, { isClosing: true })}>`);
      return result;
    }
    case 'text': {
      const result = createSourceNode(source, node);
      result.add(node.value);
      return result;
    }
    default: {
      throw new Error(`Invalid node type '${node.type}'`);
    }
  }
}

export interface Result {
  code: string;
  map: RawSourceMap;
}

export async function compile(
  fileName: string,
  markdownCode: string,
  options: Options = {},
): Promise<Result> {
  // Main transformer
  const { fromMarkdown } = await import('mdast-util-from-markdown');

  // AST Extensions
  const { mdxFromMarkdown } = await import('mdast-util-mdx');
  const { gfmFromMarkdown } = await import('mdast-util-gfm');

  // Extensions
  const { mdxjs } = await import('micromark-extension-mdxjs');
  const { gfm } = await import('micromark-extension-gfm');

  const ast = fromMarkdown(markdownCode, {
    extensions: [
      mdxjs(),
      gfm(),
    ],
    mdastExtensions: [
      mdxFromMarkdown(),
      gfmFromMarkdown(),
    ],
  });

  const imports: SourceNode[] = [];
  const render = traverse(fileName, ast, imports, options);

  const compiled = new SourceNode(null, null, fileName);

  compiled.add(imports);
  compiled.add(`import { useMDX as ${USE_MDX_VAR} } from '${options.mdxImportSource || 'solid-marked'}';\n\n`);
  compiled.add('export default function Component(props) {\n');
  compiled.add(` const ${CTX_VAR} = ${USE_MDX_VAR}();\n`);
  compiled.add(' return (\n');
  compiled.add(render);
  compiled.add(' );\n');
  compiled.add('}\n');

  compiled.setSourceContent(fileName, markdownCode);

  const compiledResult = compiled.toStringWithSourceMap();

  return {
    code: compiledResult.code,
    map: compiledResult.map.toJSON(),
  };
}

export * from './interfaces';
