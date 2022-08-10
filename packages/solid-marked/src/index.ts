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

const MARKUP: Record<WithTags, string> = {
  blockquote: '__ctx.builtins.Blockquote',
  break: '__ctx.builtins.Break',
  code: '__ctx.builtins.Code',
  definition: '__ctx.builtins.Definition',
  delete: '__ctx.builtins.Delete',
  emphasis: '__ctx.builtins.Emphasis',
  footnote: '__ctx.builtins.Footnote',
  footnoteDefinition: '__ctx.builtins.FootnoteDefinition',
  footnoteReference: '__ctx.builtins.FootnoteReference',
  heading: '__ctx.builtins.Heading',
  html: '__ctx.builtins.Html',
  image: '__ctx.builtins.Image',
  imageReference: '__ctx.builtins.ImageReference',
  inlineCode: '__ctx.builtins.InlineCode',
  link: '__ctx.builtins.Link',
  linkReference: '__ctx.builtins.LinkReference',
  list: '__ctx.builtins.List',
  listItem: '__ctx.builtins.ListItem',
  paragraph: '__ctx.builtins.Paragraph',
  root: '__ctx.builtins.Root',
  strong: '__ctx.builtins.Strong',
  table: '__ctx.builtins.Table',
  tableCell: '__ctx.builtins.TableCell',
  tableRow: '__ctx.builtins.TableRow',
  thematicBreak: '__ctx.builtins.ThematicBreak',
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
  mdxImportSource: string,
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
  compiled.add(`import { useMDX } from '${mdxImportSource}';\n\n`);
  compiled.add('export default function Component(props) {\n');
  compiled.add(' const __ctx = useMDX();\n');
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
