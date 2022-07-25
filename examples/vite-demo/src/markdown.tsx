import { Dynamic, Show } from 'solid-js/web';
import type { MDXProps } from 'solid-marked';

// eslint-disable-next-line import/prefer-default-export
export function useMDX(): MDXProps {
  return {
    builtins: {
      Heading(props) {
        return (
          <Dynamic component={`h${props.depth}`}>
            {props.children}
          </Dynamic>
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
        return (
          <pre lang={props.lang}>
            {props.children}
          </pre>
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
    },
  };
}
