import config from '@lxsmnsyc/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [config],
  ignorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
    'examples/*/src/Example.md',
  ],
  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        'typescript/consistent-type-imports': 'off',
        'typescript/triple-slash-reference': 'off',
      },
    },
    {
      files: ['examples/**', 'packages/*/test/**'],
      rules: {
        'import/prefer-default-export': 'off',
        'no-console': 'off',
        'typescript/explicit-function-return-type': 'off',
        'typescript/explicit-module-boundary-types': 'off',
      },
    },
  ],
});
