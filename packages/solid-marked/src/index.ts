// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="global-types.d.ts" />
import type { JSX } from '@solidjs/web';
import { createComponent } from '@solidjs/web';
import { createContext, omit, useContext } from 'solid-js';

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
  // In Solid 2 the context itself is the provider component, and `omit` is the
  // replacement for `splitProps`.
  return createComponent(MDXContext, {
    value: omit(props, 'children'),
    get children() {
      return props.children;
    },
  });
}

/**
 * Reads the components supplied by the nearest {@link MDXProvider}.
 *
 * Compiled documents call this for you. Call it directly only when writing a
 * component that has to render the same builtins as the surrounding document.
 *
 * @throws `ContextNotFoundError` when called outside of an {@link MDXProvider}.
 */
export function useMDX(): MDXProps {
  return useContext(MDXContext);
}
