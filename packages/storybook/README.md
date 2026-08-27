# `@ui/storybook`

Private UI Storybook application built on `@zavx0z/storybook`.

UI owns one semantic DOM Workbench whose package disclosure groups contain
category primary rows, components in the adjacent panel and exact scenarios in
the dock. Routes retain `/package/category/component/section/variant`; all
overview and detail presentations use one `@zavx0z/dom` Document and the same
CPU renderer → WebGPU pipeline. The package owns route metadata, reference
metadata, automatic-port process, static `/ui/` output and acceptance. Generic
routing, DOM Workbench, server and build contracts are imported through exact
shared subpaths:

```ts
import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import {createStorybookDomWorkbench} from "@zavx0z/storybook/workbench"
import {createDocumentCanvasRuntime} from "@zavx0z/renderer-browser"
```

This private application has no public exports. It contains only the UI-owned
root catalog, owner sections, reference catalog, lifecycle and static
build. Reusable contracts come directly from exact `@zavx0z/storybook/*`
subpaths. Repository-private story modules are imported by relative path and
their executable source uses only natural `@ui/components/*` production
subpaths; `@ui/components/dom/*` is not public API. Production UI packages do
not import Storybook.

Run `$storybook ensure @ui/storybook`. `/` opens the Workbench directly without
a landing page. Prefix overviews render their own semantic list presentation,
exact leaves do not end in `/`, and unknown suffixes fail closed. There is no
retained `UiSurface` fallback or Layout/Elements dependency in this package.
