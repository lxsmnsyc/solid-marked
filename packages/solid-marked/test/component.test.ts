import { createComponent } from 'solid-js';
import { renderToString } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import type { MDXBuiltinComponents } from '../compiler';
import Markdown from '../component';

/**
 * The builtins below emit plain text markers instead of DOM elements so that
 * the tests can assert on the structure the renderer produces without pulling
 * in a JSX toolchain.
 */
const builtins: MDXBuiltinComponents = {
  Blockquote: props => ['(blockquote ', props.children, ')'],
  Break: () => '(break)',
  Code: props => `(code lang=${String(props.lang)} ${String(props.children)})`,
  Definition: props => `(definition ${props.identifier} ${props.url})`,
  Delete: props => ['(delete ', props.children, ')'],
  Emphasis: props => ['(emphasis ', props.children, ')'],
  FootnoteDefinition: props => [
    `(footnoteDefinition ${props.identifier} `,
    props.children,
    ')',
  ],
  FootnoteReference: props => `(footnoteReference ${props.identifier})`,
  HTML: props => `(html ${String(props.children)})`,
  Heading: props => [
    `(heading depth=${props.depth} id=${props.id} `,
    props.children,
    ')',
  ],
  Image: props => `(image ${props.url} alt=${String(props.alt)})`,
  ImageReference: props => `(imageReference ${props.identifier})`,
  InlineCode: props => `(inlineCode ${String(props.children)})`,
  Link: props => [`(link ${props.url} `, props.children, ')'],
  LinkReference: props => [
    `(linkReference ${props.identifier} `,
    props.children,
    ')',
  ],
  List: props => [
    `(list ordered=${String(props.ordered)} start=${String(props.start)} `,
    props.children,
    ')',
  ],
  ListItem: props => [
    `(listItem checked=${String(props.checked)} `,
    props.children,
    ')',
  ],
  Paragraph: props => ['(paragraph ', props.children, ')'],
  Root: props => ['(root ', props.children, ')'],
  Strong: props => ['(strong ', props.children, ')'],
  Table: props => [`(table align=${String(props.align)} `, props.children, ')'],
  TableCell: props => ['(cell ', props.children, ')'],
  TableRow: props => [
    `(row isHead=${String(props.isHead)} `,
    props.children,
    ')',
  ],
  ThematicBreak: () => '(thematicBreak)',
};

function renderMarkdown(source: string): string {
  return renderToString(() =>
    createComponent(Markdown, { builtins, children: source }),
  );
}

describe('CommonMark', () => {
  it('renders paragraphs', () => {
    expect(renderMarkdown('Lorem ipsum dolor.')).toMatchSnapshot();
  });
  it('renders every heading depth', () => {
    for (let depth = 1; depth <= 6; depth += 1) {
      expect(renderMarkdown(`${'#'.repeat(depth)} Lorem`)).toMatchSnapshot();
    }
  });
  it('slugs duplicate heading ids', () => {
    expect(renderMarkdown('# Lorem\n\n# Lorem\n\n# Lorem')).toMatchSnapshot();
  });
  it('renders thematic breaks', () => {
    expect(renderMarkdown('***')).toMatchSnapshot();
  });
  it('renders blockquotes', () => {
    expect(renderMarkdown('> Lorem ipsum dolor.')).toMatchSnapshot();
  });
  it('renders ordered and unordered lists', () => {
    expect(renderMarkdown('1. Lorem\n2. Ipsum')).toMatchSnapshot();
    expect(renderMarkdown('7. Lorem\n8. Ipsum')).toMatchSnapshot();
    expect(renderMarkdown('- Lorem\n- Ipsum')).toMatchSnapshot();
  });
  it('renders emphasis, strong and inline code', () => {
    expect(renderMarkdown('*Lorem* **Ipsum** `dolor()`')).toMatchSnapshot();
  });
  it('renders hard breaks', () => {
    expect(renderMarkdown('a  \nb')).toMatchSnapshot();
  });
  it('renders links and images', () => {
    expect(
      renderMarkdown('[alpha](https://example.com "bravo")'),
    ).toMatchSnapshot();
    expect(
      renderMarkdown('![alpha](https://example.com/a.png "bravo")'),
    ).toMatchSnapshot();
  });
  it('renders references and definitions', () => {
    expect(renderMarkdown('[alpha]\n\n[alpha]: bravo')).toMatchSnapshot();
    expect(renderMarkdown('![alpha]\n\n[alpha]: bravo')).toMatchSnapshot();
  });
  it('renders fenced code with a language', () => {
    expect(renderMarkdown('```js\nfoo()\n```')).toMatchSnapshot();
  });
  it('renders raw HTML blocks', () => {
    expect(renderMarkdown('<div>Hello World</div>')).toMatchSnapshot();
  });
});

describe('GFM', () => {
  it('renders strikethrough', () => {
    expect(renderMarkdown('~~alpha~~')).toMatchSnapshot();
  });
  it('renders task list items', () => {
    expect(renderMarkdown('- [x] alpha\n- [ ] bravo')).toMatchSnapshot();
  });
  it('renders tables with alignment', () => {
    expect(
      renderMarkdown('| foo | bar |\n| :-- | :-: |\n| baz | qux |'),
    ).toMatchSnapshot();
  });
  it('renders footnotes', () => {
    expect(
      renderMarkdown('alpha[^1]\n\n[^1]: bravo and charlie.'),
    ).toMatchSnapshot();
  });
});

describe('unsupported syntax', () => {
  it('rejects frontmatter', () => {
    // Frontmatter is not part of CommonMark, so it is parsed as a thematic
    // break followed by a heading rather than as a `yaml` node.
    expect(renderMarkdown('---\ntitle: alpha\n---')).toMatchSnapshot();
  });
});
