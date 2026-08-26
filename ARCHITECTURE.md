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

@zavx0z/storybook ── shared dev-only infrastructure
          ↓
@ui/storybook ────── private UI application and catalog owner
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

`@zavx0z/storybook` owns typed route trees, lazy story contracts, comparison planning, the retained five-region Workbench and generic package-name lifecycle/browser/static delivery. The private `@ui/storybook` application owns one UI catalog, one canvas/Router/Runtime, category/component/scenario navigation, preview state, `/ui/` Pages output and acceptance; its local port is allocated by the operating system and is not a contract. The shared package documents itself in its own repository instead of appearing as a fake UI package. Elements, Components and HUD retain package-owned route namespaces, groups, metadata and lazy implementations: package names are disclosure headers, package categories are primary rows, semantic components occupy the adjacent panel, and exact scenarios occupy the dock.

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
- Production exports do not import `@ui/storybook` or `@zavx0z/storybook`;
  package-owned `storybook/**` sources use the shared package only in the
  repository development application.

## UI composition law

The mechanical owner is the
[`@layout/core` composition contract](https://github.com/zavx0z/layout/blob/main/packages/core/requirements.md).
UI packages add semantic consumer policy without copying Layout runtime,
retained ownership, clipping, or Flex implementations.

### `UI-COMPOSITION-001` — parent-owned semantic slots

The immediate parent is the sole owner of every semantic child slot. When a
parent has two or more sibling UI slots, it obtains all their rectangles from
one `flexRow`, `flexColumn`, `flexRowCss`, or `flexColumnCss` plan under
`LAYOUT-SLOT-001` and `LAYOUT-FLEX-001`. A child draws and registers input only
inside the rectangle it receives; it never reconstructs a sibling offset.

### `UI-COMPOSITION-002` — consumer-owned retained subtree

An independently dirty composite subtree is materialized under one stable
consumer-owned retained parent according to `LAYOUT-RETAINED-001`. Function-
based Elements and Components do not create component classes, parallel scene
graphs, or their own retained parents. Their visual children, hit, wheel, and
clip records are staged under the exact parent of the current transaction.

### `UI-COMPOSITION-003` — primitive geometry exception

Local coordinate arithmetic is allowed inside one assigned slot for primitive
text, icons, borders, radii, caret, selection, mesh vertices, positioned scene
objects, exact Socket centres, and Link routes. It must not be used to place
semantic sibling UI slots or duplicate their parent transform.

### `UI-COMPOSITION-004` — structural proof

Every new composite UI system has a focused structural test proving the exact
Flex planner at page/region, component, and nested-control boundaries. Rounded
parent clipping adopts `LAYOUT-CLIP-001`: descendant pixels, hit, wheel, and
scrollbars must share the same shaped clip. A consumer workaround that redraws
parent corners is not conformance.

## Static delivery

The shared static builder emits one UI-owned shell, independently split owner/story chunks, reference metadata, known-route-only deep-link recovery, and a revisioned manifest below `/ui/`. UI provides exact Engine font and reference assets; shared infrastructure owns neither.

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
