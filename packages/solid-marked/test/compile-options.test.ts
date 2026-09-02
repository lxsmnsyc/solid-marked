import { SourceMapConsumer } from 'source-map';
import { describe, expect, it } from 'vitest';

import { compile } from '../compiler';

describe('mdxImportSource', () => {
  it('defaults to solid-marked', () => {
    expect(compile('test.md', '# Lorem').code).toContain("from 'solid-marked'");
  });
  it('uses the provided module specifier', () => {
    expect(
      compile('test.md', '# Lorem', { mdxImportSource: 'mdx-provider' }).code,
    ).toContain("from 'mdx-provider'");
  });
});

describe('TableOfContents', () => {
  it('is emitted when the document has headings', () => {
    const { code } = compile('test.md', '# alpha\n\n## bravo\n\n### charlie');
    expect(code).toContain('export function TableOfContents(props)');
    expect(code).toMatchSnapshot();
  });
  it('is omitted when the document has no headings', () => {
    const { code } = compile('test.md', 'Lorem ipsum dolor.');
    expect(code).not.toContain('TableOfContents');
  });
  it('links to the slugged heading ids', () => {
    const { code } = compile('test.md', '# Lorem\n\n# Lorem');
    expect(code).toContain('#lorem');
    expect(code).toContain('#lorem-1');
  });
});

describe('frontmatter', () => {
  it('exports parsed YAML frontmatter', () => {
    const { code } = compile(
      'test.md',
      '---\ntitle: Hi, World!\ncount: 2\n---\n\n# {frontmatter.title}\n',
    );
    expect(code).toContain('export const frontmatter =');
    expect(code).toMatchSnapshot();
  });
  it('exports parsed TOML frontmatter', () => {
    const { code } = compile(
      'test.md',
      '+++\ntitle = "Hi, World!"\ncount = 2\n+++\n\n# {frontmatter.title}\n',
    );
    expect(code).toContain('export const frontmatter =');
    expect(code).toMatchSnapshot();
  });
  it('is only recognised at the top of the document', () => {
    const { code } = compile(
      'test.md',
      '# alpha\n\n---\ntitle: Hi, World!\n---\n',
    );
    expect(code).not.toContain('export const frontmatter =');
  });
});

describe('imports', () => {
  it('hoists MDX ESM statements above the runtime import', () => {
    const { code } = compile('test.md', "import Box from 'box';\n\n<Box />");
    expect(code.indexOf("from 'box'")).toBeLessThan(
      code.indexOf("from 'solid-marked'"),
    );
    expect(code).toMatchSnapshot();
  });
});

describe('source maps', () => {
  it('maps generated output back to the markdown source', async () => {
    const source = '# alpha\n\nbravo\n';
    const { code, map } = compile('test.md', source);

    expect(map.version).toBe(3);
    expect(map.sources).toEqual(['test.md']);
    expect(map.sourcesContent).toEqual([source]);
    expect(map.mappings.length).toBeGreaterThan(0);

    const lines = code.split('\n');

    // The generated table of contents is synthesised by the compiler and has
    // no original position, so only the document body is inspected here.
    const bodyIndex = lines.findIndex(line => line.includes('builtins.Root'));
    expect(bodyIndex).toBeGreaterThanOrEqual(0);
    const body = lines[bodyIndex];

    /**
     * Locates the `<Dynamic` tag that opens the given builtin and returns its
     * position in the generated code, as `SourceMapConsumer` expects it.
     */
    function generatedPositionOf(builtin: string): {
      line: number;
      column: number;
    } {
      const offset = body.indexOf(builtin);
      expect(offset).toBeGreaterThanOrEqual(0);
      return {
        column: body.lastIndexOf('<Dynamic', offset),
        line: bodyIndex + 1,
      };
    }

    const consumer = await new SourceMapConsumer(map);
    try {
      const heading = consumer.originalPositionFor(
        generatedPositionOf('builtins.Heading'),
      );
      expect(heading.source).toBe('test.md');
      expect(heading.line).toBe(1);

      const paragraph = consumer.originalPositionFor(
        generatedPositionOf('builtins.Paragraph'),
      );
      expect(paragraph.source).toBe('test.md');
      expect(paragraph.line).toBe(3);
    } finally {
      consumer.destroy();
    }
  });
});

describe('errors', () => {
  it('throws on malformed MDX expressions', () => {
    expect(() => compile('test.md', '{')).toThrow();
  });
  it('throws on malformed TOML frontmatter', () => {
    expect(() => compile('test.md', '+++\ntitle =\n+++\n')).toThrow();
  });
});
