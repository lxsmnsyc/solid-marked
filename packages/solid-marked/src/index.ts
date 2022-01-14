// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="env.d.ts" />

import {
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
import type {
  RawSourceMap,
  SourceNode,
} from 'source-map';

async function createEmptySourceNode(): Promise<SourceNode> {
  const { SourceNode } = await import('source-map');
  return new SourceNode();
}

type Position = Literal['position'];

async function createSourceNode(source: string, position: Position): Promise<SourceNode> {
  const { SourceNode } = await import('source-map');
  const col = position?.start.column;
  return new SourceNode(
    position?.start.line ?? null,
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

function map<T, R>(arr: T[], cb: (item: T) => R): R[] {
  const result: R[] = [];
  for (let i = 0, len = arr.length; i < len; i += 1) {
    result[i] = cb(arr[i]);
  }
  return result;
}

async function traverse(source: string, node: Node, imports: SourceNode[]): Promise<SourceNode> {
  async function applyContent(result: SourceNode, content: Parent) {
    const results = map(content.children, (item) => (
      traverse(source, item, imports)
    ));
    result.add(await Promise.all(results));
  }
  switch (node.type) {
    case 'blockquote': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Blockquote}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'break': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Break} />');
      return result;
    }
    case 'code': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Code}');
      if (node.lang) {
        addStringAttribute(result, 'lang', node.lang);
      }
      if (node.meta) {
        addStringAttribute(result, 'meta', node.meta);
      }
      result.add('>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add('</Dynamic>');
      return result;
    }
    case 'definition': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Definition}');
      applyResource(result, node);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'delete': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Delete}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'emphasis': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Emphasis}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnote': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Footnote}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnoteDefinition': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.FootnoteDefinition}');
      applyAssociation(result, node);
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnoteReference': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.FootnoteReference}');
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'heading': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Heading}');
      addJSAttribute(result, 'depth', node.depth.toString());
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'html': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Html}>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add('</Dynamic>');
      return result;
    }
    case 'image': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Image}');
      applyResource(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'imageReference': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.ImageReference}');
      applyReference(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'inlineCode': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.InlineCode}>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add('</Dynamic>');
      return result;
    }
    case 'link': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Link}');
      applyResource(result, node);
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'linkReference': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.LinkReference}');
      applyReference(result, node);
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'list': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.List}');
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
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'listItem': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.ListItem}');
      if (node.spread != null) {
        addJSAttribute(result, 'spread', node.spread.toString());
      }
      if (node.checked != null) {
        addJSAttribute(result, 'checked', node.checked.toString());
      }
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'mdxFlowExpression': {
      const result = await createSourceNode(source, node.position);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxJsxFlowElement': {
      const result = await createSourceNode(source, node.position);
      if (node.name) {
        let name: string;
        // Test for dashed elements
        if (/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)+$/.test(node.name)) {
          name = `__ctx.components['${node.name}']`;
        } else if (/^[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(node.name)) {
          name = `__ctx.components['${node.name}']`;
        } else {
          name = `typeof ${node.name} === 'undefined' ? __ctx.components.${node.name} : ${node.name}`;
        }
        result.add(`<Dynamic component={${name}}`);
        await Promise.all(map(node.attributes, async (attribute) => {
          const attributeNode = await createSourceNode(
            source,
            attribute.position,
          );
          if (attribute.type === 'mdxJsxAttribute') {
            attributeNode.add(` ${attribute.name}`);
            if (attribute.value) {
              if (typeof attribute.value === 'string') {
                attributeNode.add(`={\`${escapeString(attribute.value)}\`}`);
              } else {
                const attributeValueNode = await createSourceNode(
                  source,
                  attribute.value.position,
                );
                attributeValueNode.add(attribute.value.value);
                attributeNode.add(['={', attributeValueNode, '}']);
              }
            }
          } else {
            attributeNode.add(` {...${attribute.value}}`);
          }
          result.add(attributeNode);
        }));
        result.add('>');
      } else {
        result.add('<>');
      }
      await applyContent(result, node);
      result.add(node.name ? '</Dynamic>' : '</>');
      return result;
    }
    case 'mdxJsxTextElement': {
      const result = await createSourceNode(source, node.position);
      if (node.name) {
        let name: string;
        // Test for dashed elements
        if (/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)+$/.test(node.name)) {
          name = `__ctx.components['${node.name}']`;
        } else if (/^[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(node.name)) {
          name = `__ctx.components['${node.name}']`;
        } else {
          name = `typeof ${node.name} === 'undefined' ? __ctx.components.${node.name} : ${node.name}`;
        }
        result.add(`<Dynamic component={${name}}`);
        await Promise.all(map(node.attributes, async (attribute) => {
          const attributeNode = await createSourceNode(
            source,
            attribute.position,
          );
          if (attribute.type === 'mdxJsxAttribute') {
            attributeNode.add(` ${attribute.name}`);
            if (attribute.value) {
              if (typeof attribute.value === 'string') {
                attributeNode.add(`={\`${escapeString(attribute.value)}\`}`);
              } else {
                const attributeValueNode = await createSourceNode(
                  source,
                  attribute.value.position,
                );
                attributeValueNode.add(attribute.value.value);
                attributeNode.add(['={', attributeValueNode, '}']);
              }
            }
          } else {
            attributeNode.add(` {...${attribute.value}}`);
          }
          result.add(attributeNode);
        }));
        result.add('>');
      } else {
        result.add('<>');
      }
      await applyContent(result, node);
      result.add(node.name ? '</Dynamic>' : '</>');
      return result;
    }
    case 'mdxTextExpression': {
      const result = await createSourceNode(source, node.position);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxjsEsm': {
      const result = await createSourceNode(source, node.position);
      result.add(`${node.value}\n`);
      imports.push(result);
      return createEmptySourceNode();
    }
    case 'paragraph': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Paragraph}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'root': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Root}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'strong': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Strong}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'table': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.Table}');
      if (node.align != null) {
        addJSAttribute(result, 'align', JSON.stringify(node.align));
      }
      result.add('>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'tableCell': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.TableCell}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'tableRow': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.TableRow}>');
      await applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'text': {
      const result = await createSourceNode(source, node.position);
      result.add(node.value);
      return result;
    }
    case 'thematicBreak': {
      const result = await createSourceNode(source, node.position);
      result.add('<Dynamic component={__ctx.builtins.ThematicBreak} />');
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

export async function compile(fileName: string, markdownCode: string): Promise<Result> {
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
      mdxFromMarkdown,
      gfmFromMarkdown(),
    ],
  });

  const imports: SourceNode[] = [];
  const render = await traverse(fileName, ast, imports);

  const { SourceNode } = await import('source-map');
  const compiled = new SourceNode(null, null, fileName);

  compiled.add(imports);
  compiled.add("import { useMDXContext } from 'solid-marked';\n\n");
  compiled.add('export default function Component(props) {\n');
  compiled.add(' const __ctx = useMDXContext();\n');
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

export * from './components';
