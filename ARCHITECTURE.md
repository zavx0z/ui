# Architecture

> **[Built for MetaFor](https://github.com/zavx0z/metafor)**, with reusable
> document UI contracts.

UI authoring is standard HTML, CSS and DOM event code. The semantic tree is
rendered by the document engine; a component never receives a Surface, Engine
object, manual rectangle or WebGPU resource.

## Final dependency direction

```text
@zavx0z/template ───────┐
                       ↓
@ui/components ──→ @zavx0z/dom
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
CSS, icons/assets and component-specific controllers. A primitive button,
input, span or container is the corresponding standard HTML element rather
than an `@ui/elements` wrapper.

Complex widgets may remain functions because a function is an authoring
factory, not a runtime type hierarchy. For example,
`createInspector(document, props)` creates one stable standard DOM subtree and
subsequent updates mutate addressed attributes, Text and children. The DOM
prototype chain itself remains class-based and standard-named.

Components does not import Engine, renderer, WebGPU, Layout or Elements.

### `@ui/storybook`

The private Storybook application owns UI routes, examples, controls and
acceptance. Natural shared `@zavx0z/storybook/{stories,catalog,workbench}`
subpaths own the semantic Workbench and story controller. The exact story
preview, Workbench and source panels belong
to the same `@zavx0z/dom` realm and render through the same CPU/WebGPU pipeline.

Source documents are derived from executable DOM/CSS/TypeScript rather than a
parallel illustrative string. Production packages never import Storybook.

### Retired boundaries

- `@ui/elements` has no final owner role. Standard elements and DOM state move
  to `@zavx0z/dom`; visual rules and assets remain in UI; paint realization
  belongs to the renderer backend.
- `@layout/core` has no final UI runtime role. Cascade, layout, scrolling,
  clipping and hit projection are internal stages of `@zavx0z/renderer`.
- `@ui/hud` is not a separate layer. Reusable Window/Timeline compositions
  belong to Components; product reticles and commands belong to consumers;
  camera/world presentation belongs to the WebGPU/Engine adapter.

These packages remain in the checkout only while legacy consumers still
import them. They receive no compatibility aliases in the new graph.

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
and ordinary bubbling events. A controller may hold temporary interaction
state but may not create another semantic owner tree.

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

The final public `@ui/components` surface contains only the natural exact
subpaths `field`, `inspector`, `code-editor`, `hud`, `icons` and
`syntax-theme`. They point directly to DOM/CSS implementations and publish no
`dom/*`, Storybook or compatibility exports. UI Storybook is entirely on the
document pipeline; its story factories are repository-private modules.

The separate retained `@ui/hud` and `@ui/elements` packages are removed.
The former staged legacy Component snapshot remains recoverable only in the Git
index; the working tree and every buildable package contain the final DOM
owners exclusively. Generic Layout has no UI production consumer.

## Removal gates

Old Layout, Elements, HUD and Renderer experiment code can be removed only
after all of these are true:

1. shipping source has zero imports of `UiSurface`, `@layout/core`,
   `@ui/elements` and the old renderer API;
2. Components and HUD replacements author only DOM/CSS;
3. Storybook exact routes run through DOM → CPU renderer → WebGPU and pass
   route readiness, console and non-black canvas checks;
4. semantic, event, layout, visual, resource cleanup, bundle identity and
   performance gates pass;
5. Node, MetaFor, Interpreter, demo and shared Storybook consumers have moved;
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
