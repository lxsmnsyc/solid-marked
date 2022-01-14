import {
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

function traverse(source: string, node: Node, imports: SourceNode[]): SourceNode {
  function applyContent(result: SourceNode, content: Parent) {
    for (let i = 0, len = content.children.length; i < len; i += 1) {
      result.add(traverse(source, content.children[i], imports));
    }
  }
  switch (node.type) {
    case 'blockquote': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Blockquote}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'break': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Break} />');
      return result;
    }
    case 'code': {
      const result = createSourceNode(source, node);
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
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Definition}');
      applyResource(result, node);
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'delete': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Delete}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'emphasis': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Emphasis}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnote': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Footnote}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnoteDefinition': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.FootnoteDefinition}');
      applyAssociation(result, node);
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'footnoteReference': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.FootnoteReference}');
      applyAssociation(result, node);
      result.add(' />');
      return result;
    }
    case 'heading': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Heading}');
      addJSAttribute(result, 'depth', node.depth.toString());
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'html': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Html}>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add('</Dynamic>');
      return result;
    }
    case 'image': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Image}');
      applyResource(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'imageReference': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.ImageReference}');
      applyReference(result, node);
      applyAlternative(result, node);
      result.add(' />');
      return result;
    }
    case 'inlineCode': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.InlineCode}>');
      result.add(`{\`${escapeString(node.value)}\`}`);
      result.add('</Dynamic>');
      return result;
    }
    case 'link': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Link}');
      applyResource(result, node);
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'linkReference': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.LinkReference}');
      applyReference(result, node);
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'list': {
      const result = createSourceNode(source, node);
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
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'listItem': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.ListItem}');
      if (node.spread != null) {
        addJSAttribute(result, 'spread', node.spread.toString());
      }
      if (node.checked != null) {
        addJSAttribute(result, 'checked', node.checked.toString());
      }
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'mdxFlowExpression': {
      const result = createSourceNode(source, node);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxJsxFlowElement': {
      const result = createSourceNode(source, node);
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
      } else {
        result.add('<>');
      }
      applyContent(result, node);
      result.add(node.name ? '</Dynamic>' : '</>');
      return result;
    }
    case 'mdxJsxTextElement': {
      const result = createSourceNode(source, node);
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
      } else {
        result.add('<>');
      }
      applyContent(result, node);
      result.add(node.name ? '</Dynamic>' : '</>');
      return result;
    }
    case 'mdxTextExpression': {
      const result = createSourceNode(source, node);
      result.add(`{${node.value}}`);
      return result;
    }
    case 'mdxjsEsm': {
      const result = createSourceNode(source, node);
      result.add(`${node.value}\n`);
      imports.push(result);
      return new SourceNode();
    }
    case 'paragraph': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Paragraph}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'root': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Root}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'strong': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Strong}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'table': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.Table}');
      if (node.align != null) {
        addJSAttribute(result, 'align', JSON.stringify(node.align));
      }
      result.add('>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'tableCell': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.TableCell}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'tableRow': {
      const result = createSourceNode(source, node);
      result.add('<Dynamic component={__ctx.builtins.TableRow}>');
      applyContent(result, node);
      result.add('</Dynamic>');
      return result;
    }
    case 'text': {
      const result = createSourceNode(source, node);
      result.add(node.value);
      return result;
    }
    case 'thematicBreak': {
      const result = createSourceNode(source, node);
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
  const render = traverse(fileName, ast, imports);

  const compiled = new SourceNode(null, null, fileName);

  compiled.add(imports);
  compiled.add("import { useMDXContext } from 'solid-markdown';\n\n");
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
