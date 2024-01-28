import typegraphy from '@tailwindcss/typography';

export default {
  mode: 'jit',
  content: ['./src/**/*.tsx'],
  darkMode: 'class', // or 'media' or 'class'
  variants: {},
  plugins: [typegraphy],
};
