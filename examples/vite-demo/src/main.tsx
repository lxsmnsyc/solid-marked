import { Dynamic, render } from 'solid-js/web';
import {
  Show,
  createEffect,
  createResource,
  createSignal,
} from 'solid-js';
import * as shiki from 'shiki';
import { MDXProvider } from 'solid-marked';
import Example from './Example.md';
import './main.css';

shiki.setCDN('https://unpkg.com/shiki/');

function App() {
  const [highlighter] = createResource(() => (
    shiki.getHighlighter({
      langs: ['tsx', 'jsx', 'md', 'mdx', 'markdown', 'bash', 'js', 'ts'],
      themes: ['github-dark'],
    })
  ));
  return (
    <MDXProvider
      builtins={{
        Heading(props) {
          return (
            <a href={`#${props.id}`}>
              <Dynamic component={`h${props.depth}`} id={props.id}>
                {props.children}
              </Dynamic>
            </a>
          );
        },
        Paragraph(props) {
          return (
            <p>
              {props.children}
            </p>
          );
        },
        Root(props) {
          return (
            <div class="bg-white m-4 p-4 rounded-lg prose">
              {props.children}
            </div>
          );
        },
        Blockquote(props) {
          return (
            <blockquote>
              {props.children}
            </blockquote>
          );
        },
        Image(props) {
          return (
            <img src={props.url} alt={props.alt ?? props.title} />
          );
        },
        Code(props) {
          const [ref, setRef] = createSignal<HTMLPreElement | undefined>();
          createEffect(() => {
            const current = ref();
            const instance = highlighter();
            if (current && instance) {
              current.innerHTML = instance.codeToHtml(props.children, {
                lang: props.lang,
                theme: 'github-dark',
              });
            }
          });
          return (
            <div ref={setRef} lang={props.lang} />
          );
        },
        InlineCode(props) {
          return (
            <code>{props.children}</code>
          );
        },
        List(props) {
          return (
            <Dynamic component={props.ordered ? 'ol' : 'ul'} start={props.start}>
              {props.children}
            </Dynamic>
          );
        },
        ListItem(props) {
          return (
            <li>
              <Show when={'checked' in props} fallback={props.children}>
                <input type="checkbox" checked={props.checked} />
                {props.children}
              </Show>
            </li>
          );
        },
        Link(props) {
          return (
            <a href={props.url} title={props.title}>{props.children}</a>
          );
        },
      }}
    >
      <div class="bg-gradient-to-r from-indigo-400 to-blue-600 w-full flex">
        <div class="flex flex-col items-center w-full min-h-screen overflow-x-hidden">
          <Example />
        </div>
      </div>
    </MDXProvider>
  );
}

const root = document.getElementById('app');

if (root) {
  render(() => <App />, root);
}
