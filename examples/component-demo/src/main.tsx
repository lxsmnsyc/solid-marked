import type { JSX } from 'solid-js';
import { createResource } from 'solid-js';
import { render } from 'solid-js/web';
import Markdown from 'solid-marked/component';

import { createBuiltins } from './builtins';
import Example from './Example.md?raw';
import { createDemoHighlighter } from './highlighter';

import './main.css';

function App(): JSX.Element {
  const [highlighter] = createResource(createDemoHighlighter);
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
