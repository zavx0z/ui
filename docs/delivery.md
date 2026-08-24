# Production delivery

This document owns delivery rules for `@engine/core`, `@layout/core`, `@ui/elements`, and `@ui/components`. Visual semantics remain with each package contract; `@ui/storybook` is development infrastructure and is not part of a product bundle.

## Module identity

1. Dependencies flow from Engine to Layout to Elements to Components. Lower layers do not import higher layers, and production code does not import Storybook.
2. `@engine/core` and `@layout/core` each have one canonical module identity inside a product or release graph. Different URLs, aliases, or revisions of either owner are different modules and must not coexist in one realization.
3. The product bootstrap creates and owns one `@layout/core/runtime` `UiRuntime` for a canvas and scene. Dynamically loaded packages receive an attached surface and never create a global runtime singleton.
4. A function-based Element or Component draws into a caller-owned `UiSurface`. A surface object is attached and disposed by the runtime owner.

## Public ESM imports

1. Independent consumers begin at an exact lowercase subpath instead of a compatibility barrel.
2. Layout publishes runtime, surface, target, FlexBox, popover, text-input, virtual-input, and geometry owners. Elements publishes theme and HTML-like primitives. Components publishes one lowercase subpath for each production control.
3. A subpath points directly to one source owner. Aliases, generated copies, compatibility bundles, and Storybook exports from production packages are not allowed.

## Dynamic loading

1. Dynamic delivery uses standard `import()` with an exact public specifier. Repeated imports of the same specifier and revision use the environment module cache.
2. A product build receives every entrypoint as one ESM graph with code splitting. Engine, runtime, Elements, and genuinely shared Component dependencies are emitted as shared chunks rather than copied into each leaf.
3. A leaf chunk contains its implementation and imports shared chunks. Loading a leaf never creates a second scene graph, renderer, geometry cache, or input runtime.
4. Storybook may keep metadata eager and invoke a lazy story factory, but the factory must import the same production subpath used by an application.

## Acceptance

Delivery is demonstrated only when exact imports typecheck, a real dynamic import builds, the split graph contains one Engine/runtime identity, and Storybook remains absent from production entry graphs.

See the repository [architecture](../ARCHITECTURE.md) and [contribution guide](../CONTRIBUTING.md). This UI stack is **[Built for MetaFor](https://github.com/zavx0z/metafor)** and remains reusable in other WebGPU applications.
