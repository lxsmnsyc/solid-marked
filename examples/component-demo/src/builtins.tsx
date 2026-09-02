import type { JSX } from 'solid-js';
import { Show, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { MDXBuiltinComponents } from 'solid-marked';

import type { Highlighter } from './highlighter';
import { THEME, resolveLanguage } from './highlighter';

export function createBuiltins(
  highlighter: () => Highlighter | undefined,
): MDXBuiltinComponents {
  return {
    Blockquote(props): JSX.Element {
      return <blockquote>{props.children}</blockquote>;
    },
    Break(): JSX.Element {
      return <br />;
    },
    Code(props): JSX.Element {
      const html = createMemo(() => {
        const instance = highlighter();
        if (!instance || !props.children) {
          return undefined;
        }
        return instance.codeToHtml(props.children, {
          lang: resolveLanguage(props.lang),
          theme: THEME,
        });
      });
      return (
        // `not-prose` keeps the typography plugin away from shiki's own
        // colours, so the vertical rhythm and the rounding have to be set
        // here. `overflow-hidden` is what clips shiki's `<pre>` background to
        // the rounded corners.
        <div class="not-prose my-6 overflow-hidden rounded-lg bg-[#24292e]">
          <Show
            when={html()}
            fallback={
              <pre class="overflow-x-auto p-4 text-sm text-[#e1e4e8]">
                <code>{props.children}</code>
              </pre>
            }
          >
            {highlighted => (
              // `innerHTML` sits on the element carrying the `[&>pre]`
              // variant, so shiki's `<pre>` is a direct child of it.
              <div
                class="overflow-x-auto text-sm [&>pre]:p-4"
                innerHTML={highlighted()}
              />
            )}
          </Show>
        </div>
      );
    },
    Delete(props): JSX.Element {
      return <del>{props.children}</del>;
    },
    Emphasis(props): JSX.Element {
      return <em>{props.children}</em>;
    },
    FootnoteDefinition(props): JSX.Element {
      return <li id={`fn-${props.identifier}`}>{props.children}</li>;
    },
    FootnoteReference(props): JSX.Element {
      return (
        <sup>
          <a href={`#fn-${props.identifier}`}>{props.label}</a>
        </sup>
      );
    },
    HTML(props): JSX.Element {
      return <div innerHTML={props.children ?? ''} />;
    },
    Heading(props): JSX.Element {
      return (
        <Dynamic component={`h${props.depth}`} id={props.id}>
          <a href={`#${props.id}`}>{props.children}</a>
        </Dynamic>
      );
    },
    Image(props): JSX.Element {
      return <img src={props.url} alt={props.alt ?? props.title ?? ''} />;
    },
    InlineCode(props): JSX.Element {
      return <code>{props.children}</code>;
    },
    Link(props): JSX.Element {
      return (
        <a href={props.url} title={props.title ?? undefined}>
          {props.children}
        </a>
      );
    },
    List(props): JSX.Element {
      return (
        <Dynamic
          component={props.ordered ? 'ol' : 'ul'}
          start={props.start ?? undefined}
        >
          {props.children}
        </Dynamic>
      );
    },
    ListItem(props): JSX.Element {
      return (
        <li>
          <Show when={'checked' in props} fallback={props.children}>
            <input type="checkbox" checked={props.checked ?? false} disabled />{' '}
            {props.children}
          </Show>
        </li>
      );
    },
    Paragraph(props): JSX.Element {
      return <p>{props.children}</p>;
    },
    Root(props): JSX.Element {
      return (
        <div class="prose m-4 max-w-3xl rounded-lg bg-white p-6">
          {props.children}
        </div>
      );
    },
    Strong(props): JSX.Element {
      return <strong>{props.children}</strong>;
    },
    Table(props): JSX.Element {
      return <table class="w-full text-left">{props.children}</table>;
    },
    TableCell(props): JSX.Element {
      return <td class="px-3 py-2 align-top">{props.children}</td>;
    },
    TableRow(props): JSX.Element {
      // The compiler emits rows as direct children of the table, with no
      // `<thead>`, so the header row is styled rather than promoted to `<th>`.
      return (
        <tr
          class={
            props.isHead
              ? 'border-b border-gray-300 font-semibold'
              : 'border-b border-gray-100'
          }
        >
          {props.children}
        </tr>
      );
    },
    ThematicBreak(): JSX.Element {
      return <hr />;
    },
  };
}
