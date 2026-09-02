import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { build } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { SolidMarkedPluginOptions } from '../src';
import solidMarkedUnplugin from '../src';

type BuildResult = Awaited<ReturnType<typeof build>>;

function collectCode(result: BuildResult): string {
  const outputs = Array.isArray(result) ? result : [result];
  return outputs
    .flatMap(value => ('output' in value ? value.output : []))
    .map(chunk => (chunk.type === 'chunk' ? chunk.code : ''))
    .join('\n');
}

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'solid-marked-'));
  await mkdir(path.join(root, 'src'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { force: true, recursive: true });
});

async function bundle(
  entry: string,
  options: SolidMarkedPluginOptions = {},
  external: string[] = ['solid-js', 'solid-js/web', 'solid-marked'],
): Promise<string> {
  const result = await build({
    root,
    logLevel: 'silent',
    plugins: [solidMarkedUnplugin.vite(options), solidPlugin()],
    build: {
      minify: false,
      write: false,
      rolldownOptions: {
        external,
        input: path.join(root, entry),
        // Without this the bundler drops the re-exported markdown component,
        // because nothing in the test bundle consumes it.
        preserveEntrySignatures: 'strict',
        treeshake: false,
      },
    },
  });
  return collectCode(result);
}

describe('markdown loading', () => {
  it('compiles an imported markdown file', async () => {
    await writeFile(
      path.join(root, 'src/doc.md'),
      '# Hello World\n\nLorem ipsum dolor.\n',
    );
    await writeFile(
      path.join(root, 'src/entry.js'),
      "export { default, TableOfContents } from './doc.md';\n",
    );

    const code = await bundle('src/entry.js');

    expect(code).toContain('useMDX');
    expect(code).toContain('Hello World');
    expect(code).toContain('Lorem ipsum dolor.');
  });

  it('re-exports the frontmatter of a markdown file', async () => {
    await writeFile(
      path.join(root, 'src/doc.md'),
      '---\ntitle: Hi, World!\n---\n\n# {frontmatter.title}\n',
    );
    await writeFile(
      path.join(root, 'src/entry.js'),
      "export { frontmatter } from './doc.md';\n",
    );

    const code = await bundle('src/entry.js');

    expect(code).toContain('Hi, World!');
  });

  it.each(['markdown', 'mdown', 'mdx', 'mkd', 'mkdn', 'mkdown', 'ron'])(
    'handles the .%s extension',
    async extension => {
      await writeFile(path.join(root, `src/doc.${extension}`), '# Hello\n');
      await writeFile(
        path.join(root, 'src/entry.js'),
        `export { default } from './doc.${extension}';\n`,
      );

      const code = await bundle('src/entry.js');

      expect(code).toContain('Hello');
    },
  );

  it('leaves other extensions alone', async () => {
    await writeFile(
      path.join(root, 'src/entry.js'),
      "export const value = 'untouched';\n",
    );

    const code = await bundle('src/entry.js');

    expect(code).toContain('untouched');
    expect(code).not.toContain('useMDX');
  });
});

describe('options', () => {
  it('honours mdxImportSource through the `source` option', async () => {
    await writeFile(path.join(root, 'src/doc.md'), '# Hello\n');
    await writeFile(
      path.join(root, 'src/entry.js'),
      "export { default } from './doc.md';\n",
    );

    const code = await bundle('src/entry.js', { source: 'mdx-provider' }, [
      'solid-js',
      'solid-js/web',
      'mdx-provider',
    ]);

    expect(code).toContain('mdx-provider');
  });

  it('emits plain component references with noDynamicComponents', async () => {
    await writeFile(path.join(root, 'src/doc.md'), '# Hello\n');
    await writeFile(
      path.join(root, 'src/entry.js'),
      "export { default } from './doc.md';\n",
    );

    const code = await bundle('src/entry.js', { noDynamicComponents: true });

    expect(code).not.toContain('Dynamic');
  });
});
