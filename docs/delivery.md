# Production delivery

This document owns delivery rules for `@ui/components`. Visual semantics remain
with its exact package contracts; `@ui/storybook` is development infrastructure
and is not part of a product bundle.

## Module identity

1. Production Components import `@zavx0z/dom` and optional semantic helpers,
   never Engine, WebGPU, renderer or Storybook.
2. One application resolves exactly one DOM realm and one document renderer
   identity. Different URLs, aliases or revisions are different modules and
   must not coexist in one realization.
3. Product bootstrap owns the Document and rendering host. Function-based
   Components create stable standard DOM subtrees inside that caller-owned
   Document and never create another runtime or scene graph.

## Public ESM imports

1. Independent consumers begin at an exact lowercase subpath instead of a compatibility barrel.
2. Components publishes the exact natural leaves listed in
   `packages/components/requirements.md`: foundation controls, scalar and
   composite inputs, collection/data views, Field, Inspector, CodeEditor, HUD,
   icons, syntax theme and source-backed UI theme. Standard elements, events
   and live control state still come directly from the DOM.
3. A subpath points directly to one source owner. Aliases, generated copies, compatibility bundles, and Storybook exports from production packages are not allowed.

## Dynamic loading

1. Dynamic delivery uses standard `import()` with an exact public specifier. Repeated imports of the same specifier and revision use the environment module cache.
2. A product build receives every entrypoint as one ESM graph with code
   splitting. DOM, highlighter and genuinely shared Component dependencies are
   emitted as shared chunks rather than copied into each leaf.
3. A leaf chunk contains its implementation and imports shared chunks. Loading
   a leaf never creates a second DOM realm, renderer, GPU cache or input host.
4. Storybook may keep metadata eager and invoke a lazy story factory, but the factory must import the same production subpath used by an application.

## Acceptance

Delivery is demonstrated only when exact imports typecheck, a real dynamic import builds, the split graph contains one Engine/runtime identity, and Storybook remains absent from production entry graphs.

See the repository [architecture](../ARCHITECTURE.md) and [contribution guide](../CONTRIBUTING.md). This UI stack is **[Built for MetaFor](https://github.com/zavx0z/metafor)** and remains reusable in other WebGPU applications.
