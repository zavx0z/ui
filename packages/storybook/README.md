# `@ui/storybook`

Private UI Storybook application built on `@zavx0z/storybook`.

UI owns the package catalog, `/elements/`, `/components/` and `/hud/` mounts,
package previews, reference metadata, package-named automatic-port process, static
`/ui/` output and acceptance. Generic routing, Workbench, server and build
contracts are imported through exact shared subpaths:

```ts
import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import {defineStorybookStories} from "@zavx0z/storybook/stories"
import {planStorybookShell} from "@zavx0z/storybook/workbench"
```

This private application has no public exports. It contains only the UI-owned
catalog, package mounts, reference catalog, lifecycle and static
build. Reusable contracts come directly from exact `@zavx0z/storybook/*`
subpaths, while production UI packages do not import Storybook.

Run `$storybook ensure @ui/storybook`. Prefix overviews end in `/`,
exact leaves do not, and unknown suffixes fail closed.
