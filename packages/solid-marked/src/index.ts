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

const MDXContext = /* @__PURE__ */ createContext<MDXProps>();

export function MDXProvider(props: MDXProps & { children: JSX.Element }): JSX.Element {
  const [local, other] = splitProps(props, ['children']);
  return (
    createComponent(MDXContext.Provider, {
      value: other,
      get children() {
        return local.children;
      },
    })
  );
}

export function useMDX(): MDXProps {
  const ctx = useContext(MDXContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing MDXProvider');
}
