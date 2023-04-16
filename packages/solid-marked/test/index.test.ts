// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from 'vitest';
import { compile } from '../compiler';

function testCompile(code: string): string {
  return compile('test.md', code).code;
}

test('should support Paragraph', () => {
  expect(testCompile('Lorem ipsum dolor.')).toMatchSnapshot();
});
test('should support Heading', () => {
  expect(testCompile('# Lorem')).toMatchSnapshot();
  expect(testCompile('## Lorem')).toMatchSnapshot();
  expect(testCompile('### Lorem')).toMatchSnapshot();
  expect(testCompile('#### Lorem')).toMatchSnapshot();
  expect(testCompile('##### Lorem')).toMatchSnapshot();
  expect(testCompile('###### Lorem')).toMatchSnapshot();
});
test('should support ThematicBreak', () => {
  expect(testCompile('***')).toMatchSnapshot();
});
test('should support Blockquote', () => {
  expect(testCompile('> Lorem ipsum dolor.')).toMatchSnapshot();
});
test('should support List', () => {
  expect(testCompile('1. Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(testCompile('- Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(testCompile('- [X] Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(testCompile('- [ ] Lorem Ipsum dolor.')).toMatchSnapshot();
});
test('should support ListItem', () => {
  expect(testCompile('* Lorem Ipsum dolor.')).toMatchSnapshot();
});
test('should support Html', () => {
  expect(testCompile('<div>Hello World</div>')).toMatchSnapshot();
});
test('should support Code', () => {
  expect(testCompile(`
\`\`\`js highlight-line="2"
foo()
bar()
baz()
\`\`\`
`)).toMatchSnapshot();
});
test('should support Definition', () => {
  expect(testCompile('[Alpha]: https://example.com')).toMatchSnapshot();
});
test('should support Emphasis', () => {
  expect(testCompile('*Lorem* _Ipsum_ dolor.')).toMatchSnapshot();
});
test('should support Strong', () => {
  expect(testCompile('**Lorem** __Ipsum__ dolor.')).toMatchSnapshot();
});
test('should support InlineCode', () => {
  expect(testCompile('`foo()`')).toMatchSnapshot();
});
test('should support Break', () => {
  expect(testCompile(`
a  \nb
`)).toMatchSnapshot();
});
test('should support Link', () => {
  expect(testCompile('[alpha](https://example.com "bravo")')).toMatchSnapshot();
});
test('should support Image', () => {
  expect(testCompile('![alpha](https://example.com/favicon.ico "bravo")')).toMatchSnapshot();
});
test('should support LinkReference', () => {
  expect(testCompile('[alpha]\n\n[alpha]: bravo')).toMatchSnapshot();
});
test('should support ImageReference', () => {
  expect(testCompile('![alpha]\n\n[alpha]: bravo')).toMatchSnapshot();
});
test('should support FootnoteDefinition', () => {
  expect(testCompile('[^alpha]: bravo and charlie.')).toMatchSnapshot();
});
test('should support FootnoteReference', () => {
  expect(testCompile('[^alpha]')).toMatchSnapshot();
});
test('should support Table', () => {
  expect(testCompile(`
| foo | bar |
| :-- | :-: |
| baz | qux |
`)).toMatchSnapshot();
});
test('should support Table, TableRow and TableCell', () => {
  expect(testCompile(`
| foo | bar |
| :-- | :-: |
| baz | qux |
`)).toMatchSnapshot();
});
test('should support Delete', () => {
  expect(testCompile('~~alpha~~')).toMatchSnapshot();
});
test('should support MDX ESM', () => {
  expect(testCompile('import Box from \'box\';')).toMatchSnapshot();
});
test('should support MDX JSX', () => {
  expect(testCompile('<Box>Hello World</Box>')).toMatchSnapshot();
  expect(testCompile('<some-box>Hello World</some-box>')).toMatchSnapshot();
  expect(testCompile('<some:box>Hello World</some:box>')).toMatchSnapshot();
  expect(testCompile(`
<Box>
  Hello World
</Box>
`)).toMatchSnapshot();
  expect(testCompile(`
<some-box>
Hello World
</some-box>
`)).toMatchSnapshot();
  expect(testCompile(`
<some:box>
Hello World
</some:box>
`)).toMatchSnapshot();
});
test('should support MDX JS', () => {
  expect(testCompile('{1 + 1}')).toMatchSnapshot();
});
test('should support YAML', () => {
  expect(testCompile(`---
title: Hi, World!
---

# {frontmatter.title}
`)).toMatchSnapshot();
});
test('should support TOML', () => {
  expect(testCompile(`+++
title = "Hi, World!"
+++

# {frontmatter.title}
`)).toMatchSnapshot();
});
