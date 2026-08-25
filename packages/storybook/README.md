# `@ui/storybook`

Private UI Storybook application built on `@zavx0z/storybook`.

UI owns the package catalog, `/elements/`, `/components/`, `/storybook/` and
`/hud/` mounts, package previews, reference metadata, process `4017`, static
`/ui/` output and acceptance. Generic routing, Workbench, server and build
contracts are imported through exact shared subpaths:

```ts
import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import {defineStorybookStories} from "@zavx0z/storybook/stories"
import {planStorybookShell} from "@zavx0z/storybook/workbench"
```

The `/storybook/` page is an UI-owned integration fixture for the shared
infrastructure; it does not transfer UI story ownership to the shared package.

During the staged cross-repository migration, the previous generic source
remains in this private package for the still-direct Node and MetaFor consumers.
UI itself does not import that legacy surface. It will be deleted, without an
alias or re-export layer, after those consumers move.

Run `bun run storybook` from the repository root. Prefix overviews end in `/`,
exact leaves do not, and unknown suffixes fail closed.
