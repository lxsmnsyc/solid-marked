import { JSX } from 'solid-js';

declare module '*.md' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mdx' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.markdown' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mdown' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkdn' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkd' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.mkdown' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}

declare module '*.ron' {
  export default function Component(props: Record<string, unknown>): JSX.Element;
}
