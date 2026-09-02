import type { BundledLanguage, HighlighterGeneric } from 'shiki';
import { createHighlighter } from 'shiki';

export const LANGUAGES = [
  'bash',
  'js',
  'json',
  'jsx',
  'markdown',
  'md',
  'mdx',
  'ts',
  'tsx',
] as const satisfies BundledLanguage[];

export const THEME = 'github-dark';

export type Language = (typeof LANGUAGES)[number];

export type Highlighter = HighlighterGeneric<Language, typeof THEME>;

export async function createDemoHighlighter(): Promise<Highlighter> {
  return createHighlighter({
    langs: [...LANGUAGES],
    themes: [THEME],
  });
}

/**
 * Maps a fence's language onto one this highlighter loaded, falling back to
 * shiki's built-in `text` language so that an unknown fence still renders with
 * the theme's background instead of dropping to unstyled markup.
 */
export function resolveLanguage(
  value: string | null | undefined,
): Language | 'text' {
  return LANGUAGES.find(language => language === value) ?? 'text';
}
