// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from 'vitest';
import { compile } from '..';

async function testCompile(code: string): Promise<string> {
  return (await compile('test.md', code)).code;
}

test('should support Paragraph', async () => {
  expect(await testCompile('Lorem ipsum dolor.')).toMatchSnapshot();
});
test('should support Heading', async () => {
  expect(await testCompile('# Lorem')).toMatchSnapshot();
  expect(await testCompile('## Lorem')).toMatchSnapshot();
  expect(await testCompile('### Lorem')).toMatchSnapshot();
  expect(await testCompile('#### Lorem')).toMatchSnapshot();
  expect(await testCompile('##### Lorem')).toMatchSnapshot();
  expect(await testCompile('###### Lorem')).toMatchSnapshot();
});
test('should support ThematicBreak', async () => {
  expect(await testCompile('***')).toMatchSnapshot();
});
test('should support Blockquote', async () => {
  expect(await testCompile('> Lorem ipsum dolor.')).toMatchSnapshot();
});
test('should support List', async () => {
  expect(await testCompile('1. Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(await testCompile('- Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(await testCompile('- [X] Lorem Ipsum dolor.')).toMatchSnapshot();
  expect(await testCompile('- [ ] Lorem Ipsum dolor.')).toMatchSnapshot();
});
test('should support ListItem', async () => {
  expect(await testCompile('* Lorem Ipsum dolor.')).toMatchSnapshot();
});
test('should support Html', async () => {
  expect(await testCompile('<div>Hello World</div>')).toMatchSnapshot();
});
test('should support Code', async () => {
  expect(await testCompile(`
\`\`\`js highlight-line="2"
foo()
bar()
baz()
\`\`\`
`)).toMatchSnapshot();
});
test('should support Definition', async () => {
  expect(await testCompile('[Alpha]: https://example.com')).toMatchSnapshot();
});
test('should support Emphasis', async () => {
  expect(await testCompile('*Lorem* _Ipsum_ dolor.')).toMatchSnapshot();
});
test('should support Strong', async () => {
  expect(await testCompile('**Lorem** __Ipsum__ dolor.')).toMatchSnapshot();
});
test('should support InlineCode', async () => {
  expect(await testCompile('`foo()`')).toMatchSnapshot();
});
test('should support Break', async () => {
  expect(await testCompile(`
foo··
bar
`)).toMatchSnapshot();
});
test('should support Link', async () => {
  expect(await testCompile('[alpha](https://example.com "bravo")')).toMatchSnapshot();
});
test('should support Image', async () => {
  expect(await testCompile('![alpha](https://example.com/favicon.ico "bravo")')).toMatchSnapshot();
});
test('should support LinkReference', async () => {
  expect(await testCompile('[alpha][Bravo]')).toMatchSnapshot();
});
test('should support ImageReference', async () => {
  expect(await testCompile('![alpha][bravo]')).toMatchSnapshot();
});
test('should support FootnoteDefinition', async () => {
  expect(await testCompile('[^alpha]: bravo and charlie.')).toMatchSnapshot();
});
test('should support FootnoteReference', async () => {
  expect(await testCompile('[^alpha]')).toMatchSnapshot();
});
test('should support Table', async () => {
  expect(await testCompile(`
| foo | bar |
| :-- | :-: |
| baz | qux |
`)).toMatchSnapshot();
});
test('should support Table, TableRow and TableCell', async () => {
  expect(await testCompile(`
| foo | bar |
| :-- | :-: |
| baz | qux |
`)).toMatchSnapshot();
});
test('should support Delete', async () => {
  expect(await testCompile('~~alpha~~')).toMatchSnapshot();
});
test('should support Footnote', async () => {
  expect(await testCompile('^[alpha bravo]')).toMatchSnapshot();
});
test('should support MDX ESM', async () => {
  expect(await testCompile('import Box from \'box\';')).toMatchSnapshot();
});
test('should support MDX JSX', async () => {
  expect(await testCompile('<Box>Hello World</Box>')).toMatchSnapshot();
});
test('should support MDX JS', async () => {
  expect(await testCompile('{1 + 1}')).toMatchSnapshot();
});
