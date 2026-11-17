import type { JSX } from '@solidjs/web';
import { render } from '@solidjs/web';
import { createMemo } from 'solid-js';
import { MDXProvider } from 'solid-marked';

import { createBuiltins } from './builtins';
import Example from './Example.md';
import { createDemoHighlighter } from './highlighter';

import './main.css';

function App(): JSX.Element {
  // Solid 2 has no `createResource`. A computation that returns a promise is
  // the async primitive: reads participate in the nearest `<Loading>` until it
  // settles.
  const highlighter = createMemo(async () => createDemoHighlighter());
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
