# Architecture

> **[Built for MetaFor](https://github.com/zavx0z/metafor)**, with package contracts that remain reusable outside the product.

Visual UI is a retained WebGPU interface stack. It does not translate components into DOM nodes: one application-owned Layout runtime attaches surfaces to its Engine Space, and those surfaces materialize stable engine objects only when layout or visual state changes.

[Project overview](README.md) · [Contribution guide](CONTRIBUTING.md) · [Static Storybook](https://zavx0z.github.io/ui/)

## Dependency direction

```text
@engine/core
    ↓
@layout/core
    ↓
@ui/elements
    ↓
@ui/components
    ↓
@ui/hud

@zavx0z/highlighter ─────────────> @ui/elements / @ui/components

@ui/storybook ── dev-only consumer of the same production packages
```

Lower layers never import higher layers. Exact lowercase package subpaths point directly to their source owner; aliases, compatibility barrels, and generated copies are not part of the contract.

## Package ownership

### Layout boundary

The sibling [`@layout/core`](https://github.com/zavx0z/layout) package owns `UiRuntime`, `UiSurface`, spatial targets, FlexBox, popover chains, text-input dispatch, virtual input, and polyline geometry. UI consumers import those exact subpaths directly. `@ui/elements` does not re-export them or retain compatibility copies.

### Elements

`@ui/elements` owns HTML-like visual primitives, widget appearance, theme material states, icons, and controlled edit behavior. Its input implementation registers one controller with `@layout/core/text-input`; the Layout runtime remains the sole keyboard, composition, blur, and native-input dispatcher.

### Components

`@ui/components` owns reusable controlled controls and fields. Components receive an attached `UiSurface` directly from `@layout/core/surface` and never create a renderer, scene, or runtime. The same control can be used standalone, in HUD, or by the Nodes repository without acquiring node-specific semantics.

The exact `@ui/components/code-editor` leaf composes Elements-owned token runs,
selection and scroll with theme-neutral tokens from `@zavx0z/highlighter`.
Interpreter file/debugger state and Storybook chrome remain consumer-owned.

### HUD

`@ui/hud` owns heads-up presentation only. Product commands and domain state stay with the integrating application.

### Storybook

`@ui/storybook` owns typed route trees, lazy story modules, comparison planning, the retained five-region workbench, one no-HMR development server, and a static build for the `/ui/` Pages base. Each package page is compiled independently so opening Elements does not eagerly materialize the Components or HUD browser graph.

Reference metadata records provenance, viewport, revision, compatibility, and acceptance. Large image assets are loaded only after the selected story requests comparison. The comparison planner chooses side-by-side or top-to-bottom placement by whichever produces the larger common scale, preserving meaningful pixel inspection for both wide and tall controls.

## Runtime invariants

- A product creates one `@layout/core/runtime` `UiRuntime` for a canvas and scene.
- The HTML composition root declares one Engine-owned default font URL. Runtime
  creation fetches it lazily only without an explicit `font` or `fontUrl`;
  Elements, Components, HUD, and story modules never own that route.
- Surfaces are attached by the runtime owner and are disposed recursively.
- Layout uses parent-owned slots; children draw only inside the rectangle they receive.
- Controlled values come from the consumer. Local editing buffers are temporary interaction state, not a second source of truth.
- Story metadata may be eager, but production implementations and reference images remain lazy.
- Production packages do not import `@ui/storybook`.

## Static delivery

The Pages build emits package shells, independently split browser bundles, reference metadata, a deep-link recovery page, and a manifest below the public `/ui/` base. The workflow checks out [`zavx0z/engine`](https://github.com/zavx0z/engine) and [`zavx0z/layout`](https://github.com/zavx0z/layout), registers both exact package links, and then builds UI against those same identities.

GitHub Pages uses the checked workflow artifact as its publishing source, but
the workflow runs only through an explicit owner dispatch. A green build or a
push to `main` does not deploy by itself.

## Cross-repository map

| Repository | Contract |
| --- | --- |
| [`engine`](https://github.com/zavx0z/engine) | WebGPU object model and renderer exposed as `@engine/core`. |
| [`layout`](https://github.com/zavx0z/layout) | Retained runtime, surfaces, targets, layout, and generic interaction plumbing exposed as `@layout/core`. |
| [`ui`](https://github.com/zavx0z/ui) | Universal visual primitives, components, HUD, Storybook, and UI evidence. |
| [`node`](https://github.com/zavx0z/node) | Graph model, editor commands, layout, and node-specific composition. |
| [`metafor`](https://github.com/zavx0z/metafor) | Product integration, exact revisions, lifecycle, and release ownership. |

This direction lets each library evolve independently without hiding the product it serves: **[Built for MetaFor](https://github.com/zavx0z/metafor)**.
