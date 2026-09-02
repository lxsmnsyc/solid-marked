// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="global-types.d.ts" />
import type { JSX } from 'solid-js';
import {
  createComponent,
  createContext,
  splitProps,
  useContext,
} from 'solid-js';

import type { MDXProps } from '../compiler/interfaces';

export type * from '../compiler/interfaces';

const MDXContext = /* @__PURE__ */ createContext<MDXProps>();

/**
 * Supplies the components that compiled Markdown documents render through.
 *
 * A compiled document renders nothing on its own: each Markdown construct is
 * resolved from the nearest provider at render time. Wrap the part of the tree
 * that contains your documents.
 *
 * @example
 * ```jsx
 * <MDXProvider builtins={{ Paragraph: props => <p>{props.children}</p> }}>
 *   <Doc />
 * </MDXProvider>
 * ```
 */
export function MDXProvider(
  props: MDXProps & { children: JSX.Element },
): JSX.Element {
  const [local, other] = splitProps(props, ['children']);
  return createComponent(MDXContext.Provider, {
    value: other,
    get children() {
      return local.children;
    },
  });
}

/**
 * Reads the components supplied by the nearest {@link MDXProvider}.
 *
 * Compiled documents call this for you. Call it directly only when writing a
 * component that has to render the same builtins as the surrounding document.
 *
 * @throws When called outside of an {@link MDXProvider}.
 */
export function useMDX(): MDXProps {
  const ctx = useContext(MDXContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing MDXProvider');
}
