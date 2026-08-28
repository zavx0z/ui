# Architecture

> **[Built for MetaFor](https://github.com/zavx0z/metafor)**, with reusable
> document UI contracts.

UI authoring is standard HTML, CSS and DOM event code. The semantic tree is
rendered by the document engine; a component never receives a Surface, Engine
object, manual rectangle or WebGPU resource.

## Final dependency direction

```text
@zavx0z/template/compiler → @zavx0z/template/compiled
                                      ↓
                              @zavx0z/react
                                      ↓
@ui/components ──────────────→ @zavx0z/dom
                       ↓
                 @zavx0z/renderer
                       ↓
            @zavx0z/renderer-webgpu
                       ↓
                  @engine/core

@zavx0z/highlighter ──→ @ui/components/code-editor

@zavx0z/storybook/* ─────┐
private UI story modules ┼─→ @ui/storybook (development only)
document pipeline ───────┘
```

The DOM is the only public UI tree. Computed style, layout boxes, display
items, hit records and Engine resources are derived projections with separate
compact identities.

## Final package ownership

### `@ui/components`

Components owns only semantic compositions, controlled widget state, theme
CSS and icons/assets. A primitive button,
input, span or container is represented by the corresponding standard HTML
element rather than an `@ui/elements` runtime wrapper. Production factories
remain valid owners when they provide a reusable visual, interaction or
controlled-state contract around those standard elements.

Components are ordinary TSX functions compiled by `@zavx0z/template` into
static semantic DOM mounts and addressed bindings. `@zavx0z/react` owns compact
hook slots and component scheduling without React, Fiber or a virtual DOM.
There is one natural `*.tsx` owner per Component and no parallel imperative
`createX(document, props)` implementation. The DOM prototype chain itself
remains class-based and standard-named.

Components does not import Engine, renderer, WebGPU, Layout or Elements.

### Visual compatibility law

The DOM migration changes the authoring and rendering substrate, not the
visible product. Blender 5.2 LTS remains the normative reference for control
composition, density, grouping, palette, material states and interaction.
Existing Button, Field, numeric, collection, color, Pane, HUD and Node consumer
contracts must be ported to DOM/CSS before their former implementation can be
removed. A direct `document.createElement()` proof is not a replacement for a
production component that owned such behavior.

Every visible migration slice requires an equal-scale reference comparison and
an explicit owner verdict. Unit tests, route completeness, readiness and a
non-black canvas prove mechanics only; they do not authorize a visual redesign.

### `@ui/storybook`

The private Storybook application owns UI routes, examples, controls and
acceptance. Natural shared `@zavx0z/storybook/{stories,catalog,workbench}`
subpaths own the semantic Workbench and story controller. The exact story
preview, Workbench and the owner-supplied Props Inspector belong
to the same `@zavx0z/dom` realm and render through the same CPU/WebGPU pipeline.

Source provenance is derived from executable DOM/CSS/TypeScript rather than a
parallel illustrative string. Production packages never import Storybook.

### Retired boundaries

- `@ui/elements` has no final runtime-wrapper role. Standard elements and DOM
  state move to `@zavx0z/dom`; every reusable visual and interaction contract
  must first move to a natural production Component or renderer-owned UA
  behavior. Package removal is not permission to discard that contract.
- `@layout/core` has no final UI runtime role. Cascade, layout, scrolling,
  clipping and hit projection are internal stages of `@zavx0z/renderer`.
- `@ui/hud` is not a separate layer. Reusable Window/Timeline compositions
  belong to Components; product reticles and commands belong to consumers;
  camera/world presentation belongs to the WebGPU/Engine adapter.

They receive no compatibility aliases in the final graph.

## Authoring laws

### One standard tree

Every imperative API, Template binding and optional framework renderer mutates
the same DOM. No component or template creates a parallel resolved tree.

```ts
const button = document.createElement("button")
button.title = "Output"
button.addEventListener("click", showOutput)
toolbar.appendChild(button)
```

### CSS owns geometry

Parents define semantic structure and CSS. Components do not calculate sibling
coordinates. Flex, block/inline flow, intrinsic size, scrolling and clipping
are renderer mechanics derived from computed style.

### Controlled state uses DOM state

Attributes and live control properties are the observable state boundary:
`aria-pressed`, `aria-expanded`, `disabled`, `hidden`, `HTMLInputElement.value`
and ordinary bubbling events. A component hook or ref may hold temporary
interaction state but may not create another semantic owner tree.

### `title` is generic user-agent behavior

Advisory text is `HTMLElement.title`, including nearest-ancestor inheritance
and the explicit empty-string override. Hit testing and delayed viewport-bound
tooltip presentation belong to the renderer. Components and the WebGPU backend
contain no tooltip-specific API.

## Retained and performance laws

- DOM nodes keep identity across updates.
- A visual fragment is retained by `(semantic node, fragment key)`; array
  position is never identity.
- Rare attributes, listeners and control state allocate lazily.
- A clean render returns the exact previous immutable frame.
- GPU objects, geometry and materials remain stable when their resolved visual
  fragment is unchanged.
- Removal detaches listeners and invalidates renderer-owned GPU resources.
- One application must resolve exactly one DOM realm and one Engine identity.

## Current migration checkpoint

The document pipeline is the accepted runtime foundation. All 29 public
component subpaths now resolve directly to one natural TSX owner; the parallel
imperative controllers and private legacy story graph have been removed.
Storybook exercises those same owners through DOM → CPU renderer → WebGPU.
Automated tests prove mechanics only: Blender 5.2 visual evidence remains
candidate until explicit owner acceptance.

## Removal gates

The local retired implementation stays absent only while all of these remain
true:

1. shipping source has zero imports of `UiSurface`, `@layout/core`,
   `@ui/elements` and the old renderer API;
2. Components and HUD author only DOM/CSS and preserve the production visual,
   interaction and controlled-state contracts;
3. Storybook exact routes run through DOM → CPU renderer → WebGPU and pass
   route readiness, console and non-black canvas checks;
4. semantic, event, layout, visual, resource cleanup, bundle identity and
   performance gates pass, including equal-scale Blender reference comparison
   and an explicit owner verdict for every changed visible slice;
5. external consumers import only public natural subpaths;
6. no dirty linked checkout is described as accepted integration.

## Cross-repository map

| Repository | Final contract |
|---|---|
| `renderer` | `@zavx0z/dom`, CPU document renderer and Engine/WebGPU backend |
| `engine` | WebGPU device, scene/object model, materials and GPU resources |
| `template` | Addressed compilation into the shared DOM |
| `ui` | DOM/CSS components, assets and private visual catalog |
| `storybook` | Shared DOM Workbench, routes, lifecycle and delivery |
| `layout` | Historical runtime removed after zero-import cutover |
| `node` | Graph/editor semantics composed from UI DOM components |
| `metafor` | Product integration, lifecycle and release ownership |
