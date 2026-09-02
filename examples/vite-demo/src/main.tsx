import type { JSX } from 'solid-js';
import { createResource } from 'solid-js';
import { render } from 'solid-js/web';
import { MDXProvider } from 'solid-marked';

import { createBuiltins } from './builtins';
import Example from './Example.md';
import { createDemoHighlighter } from './highlighter';

import './main.css';

function App(): JSX.Element {
  const [highlighter] = createResource(createDemoHighlighter);
  return (
    <MDXProvider builtins={createBuiltins(highlighter)}>
      <div class="flex min-h-screen w-full justify-center bg-gradient-to-r from-indigo-400 to-blue-600">
        <Example />
      </div>
    </MDXProvider>
  );
}

const root = document.getElementById('app');

if (root) {
  render(() => <App />, root);
}
