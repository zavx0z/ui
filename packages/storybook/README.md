# `@ui/storybook`

Private UI Storybook application built on `@zavx0z/storybook`.

UI owns one Workbench whose package disclosure groups contain category primary
rows, with semantic components in the adjacent panel and exact scenarios in the
dock. Routes retain `/package/category/component/section/variant`, aggregate
previews use real lazy story modules, and the package owns reference metadata,
the automatic-port process, static
`/ui/` output and acceptance. Generic routing, Workbench, server and build
contracts are imported through exact shared subpaths:

```ts
import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import {defineStorybookStories} from "@zavx0z/storybook/stories"
import {planStorybookShell} from "@zavx0z/storybook/workbench"
```

This private application has no public exports. It contains only the UI-owned
root catalog, owner sections, reference catalog, lifecycle and static
build. Reusable contracts come directly from exact `@zavx0z/storybook/*`
subpaths, while production UI packages do not import Storybook.

Run `$storybook ensure @ui/storybook`. `/` opens the Workbench directly without
a landing page. Prefix overviews render their own aggregate modules, exact
leaves do not end in `/`, and unknown suffixes fail closed.
