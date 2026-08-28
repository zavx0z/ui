# Visual UI

> **[Built for MetaFor](https://github.com/zavx0z/metafor)** — reusable for any high-performance WebGPU or immersive interface.

Visual UI is a standard DOM and CSS component library for dense editors,
spatial workspaces and heads-up presentations rendered through the document
engine and WebGPU. Components create ordinary semantic elements, use standard
events and preserve DOM identity across controlled updates.

[Open the Storybook](https://zavx0z.github.io/ui/) · [Read the architecture](ARCHITECTURE.md) · [Contribute](CONTRIBUTING.md)

## Packages

| Package | Responsibility |
| --- | --- |
| [`@ui/components`](packages/components) | Blender-compatible production DOM/CSS controls, Fields, collections, Inspector, CodeEditor, HUD, theme and assets. |
| [`@ui/storybook`](packages/storybook) | Private one-Workbench UI catalog, owner routes, lifecycle and static application using `@zavx0z/storybook`. |

Production authoring depends on `@zavx0z/dom`; read-only syntax presentation
also uses [`@zavx0z/highlighter`](https://github.com/zavx0z/highlighter).
Cascade, layout, hit projection and rendering belong to the document renderer,
while [`@engine/core`](https://github.com/zavx0z/engine) owns WebGPU resources.
`@zavx0z/storybook` and the private UI Storybook app remain development
consumers and never enter a production component graph.

The project-default TTF is owned by Engine and loaded by the document host.
UI packages and individual stories do not import or fetch it themselves.

## Local development

Keep Renderer, Engine, Highlighter, Storybook and UI as sibling checkouts. UI
manifests resolve only exact package owners:

```text
repozitarium/
├── engine/
├── renderer/
├── highlighter/
├── storybook/
└── ui/
```

Then run:

```bash
cd ../renderer && bun link
cd ../engine/packages/core && bun link
cd ../../../highlighter && bun link
cd ../storybook && bun link
cd ../webxr-space/projects/ui
bun install
```

Use `$storybook ensure @ui/storybook` for the local runtime and
`$storybook build @ui/storybook` for the `/ui/` static artifact.

References are metadata-first and image-lazy. Catalog metadata can remain in the initial bundle, while raster evidence is requested only for the selected comparison. Automated captures are candidates; acceptance remains an explicit owner decision.

The DOM transition is an implementation migration, not a visual redesign.
Production controls retain their compact editor density, material states and
interaction ownership; a direct-element Storybook proof never replaces a
public Component.

## Repository map

- [`zavx0z/engine`](https://github.com/zavx0z/engine) owns the WebGPU scene and renderer primitives consumed as `@engine/core`.
- [`zavx0z/renderer`](https://github.com/zavx0z/renderer) owns the DOM realm, cascade, CPU layout/display/hit pipeline and browser/WebGPU adapters.
- [`zavx0z/ui`](https://github.com/zavx0z/ui) owns universal DOM/CSS components, visual assets and its evidence workbench.
- [`zavx0z/node`](https://github.com/zavx0z/node) owns graph semantics, layout, and node-specific UI consumers.
- [`zavx0z/metafor`](https://github.com/zavx0z/metafor) composes exact revisions into the product runtime.

The separation keeps the libraries reusable while preserving their original purpose: **[Built for MetaFor](https://github.com/zavx0z/metafor)**.

## License

[MIT](./LICENSE)
