# Visual UI

> **[Built for MetaFor](https://github.com/zavx0z/metafor)** — reusable for any high-performance WebGPU or immersive interface.

Visual UI is a retained, canvas-native interface stack for dense editors, spatial workspaces, heads-up displays, and other applications where DOM-oriented component libraries are not the rendering boundary. It combines HTML-like primitives, controlled visual components, a HUD layer, and a static Storybook that exercises the real production graph.

[Open the Storybook](https://zavx0z.github.io/ui/) · [Read the architecture](ARCHITECTURE.md) · [Contribute](CONTRIBUTING.md)

## Packages

| Package | Responsibility |
| --- | --- |
| [`@ui/elements`](packages/elements) | HTML-like visual primitives, controlled input behavior, widget appearance, theme, and icons. |
| [`@ui/components`](packages/components) | Controlled fields and visual controls composed from Elements. |
| [`@ui/hud`](packages/hud) | Heads-up display windows, frames, and timeline presentation. |
| [`@ui/storybook`](packages/storybook) | Private one-Workbench UI catalog, owner routes, lifecycle and Pages application using `@zavx0z/storybook`. |

Production dependencies flow upward from [`@engine/core`](https://github.com/zavx0z/engine) through [`@layout/core`](https://github.com/zavx0z/layout), Elements, and Components. `@zavx0z/storybook` and the private UI Storybook app remain development consumers and do not enter an application bundle unless imported explicitly.

The project-default TTF is owned by Engine. Each ready HTML application
declares the URL it serves once; `UiRuntime` loads and shares it only when the
application did not supply another font. UI packages and individual stories do
not import or fetch the default themselves.

## Local development

Keep Engine, Layout, and UI as sibling checkouts. Register the two lower package owners once; UI manifests resolve only their explicit global package links:

```text
repozitarium/
├── engine/
├── layout/
├── storybook/
└── ui/
```

Then run:

```bash
cd ../engine/packages/core && bun link
cd ../../../layout/packages/core && bun link
cd ../../../storybook && bun link
cd ../../../ui
bun install
```

Use `$storybook ensure @ui/storybook` for the local runtime and
`$storybook build @ui/storybook` for the `/ui/` static artifact.

References are metadata-first and image-lazy. Catalog metadata can remain in the initial bundle, while raster evidence is requested only for the selected comparison. Automated captures are candidates; acceptance remains an explicit owner decision.

## Repository map

- [`zavx0z/engine`](https://github.com/zavx0z/engine) owns the WebGPU scene and renderer primitives consumed as `@engine/core`.
- [`zavx0z/layout`](https://github.com/zavx0z/layout) owns `UiRuntime`, `UiSurface`, targets, FlexBox, popover chains, virtual input, text-input dispatch, and polyline geometry as exact `@layout/core/*` subpaths.
- [`zavx0z/ui`](https://github.com/zavx0z/ui) owns universal visual UI and its evidence workbench.
- [`zavx0z/node`](https://github.com/zavx0z/node) owns graph semantics, layout, and node-specific UI consumers.
- [`zavx0z/metafor`](https://github.com/zavx0z/metafor) composes exact revisions into the product runtime.

The separation keeps the libraries reusable while preserving their original purpose: **[Built for MetaFor](https://github.com/zavx0z/metafor)**.

## License

[MIT](./LICENSE)
