import { expect, it } from 'vitest';

import solidMarkedPlugin from '../src';

it('creates the pre and post vite plugins', () => {
  const plugins = solidMarkedPlugin({});
  const names = (Array.isArray(plugins) ? plugins : [plugins]).map(
    plugin => plugin.name,
  );
  expect(names).toEqual(['solid-marked:pre', 'solid-marked:post']);
});

it('accepts the plugin options', () => {
  expect(() =>
    solidMarkedPlugin({ noDynamicComponents: true, source: 'mdx-provider' }),
  ).not.toThrow();
});
