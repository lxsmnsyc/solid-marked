import type { JSX } from '@solidjs/web';
import { render } from '@solidjs/web';
import { createMemo } from 'solid-js';
import Markdown from 'solid-marked/component';

import { createBuiltins } from './builtins';
import Example from './Example.md?raw';
import { createDemoHighlighter } from './highlighter';

import './main.css';

function App(): JSX.Element {
  // Solid 2 has no `createResource`. A computation that returns a promise is
  // the async primitive: reads participate in the nearest `<Loading>` until it
  // settles.
  const highlighter = createMemo(async () => createDemoHighlighter());
  return (
    <div class="flex min-h-screen w-full justify-center bg-gradient-to-r from-indigo-400 to-blue-600">
      <Markdown builtins={createBuiltins(highlighter)}>{Example}</Markdown>
    </div>
  );
}

const root = document.getElementById('app');

if (root) {
  render(() => <App />, root);
}
