# @ui/storybook

`@ui/storybook` is the shared development workbench and static visual catalog for the UI package family. It is **[Built for MetaFor](https://github.com/zavx0z/metafor)** while remaining a reusable development consumer of the public UI packages.

It provides a typed hierarchical route tree, a retained five-region FlexBox shell, searchable story metadata, lazy story and reference loaders, independently split package pages, and a static GitHub Pages build below `/ui/`.

Consumers own their stories, production preview surfaces, search state, and demonstration data. The initial entry contains metadata only; a selected story imports its implementation through an exact production subpath. Reference images are requested only when comparison is opened.

```ts
import {
  StorybookRouteTreeRouter,
  StorybookNavigationSurface,
  StorybookStoryPanelSurface,
  defineStorybookStories,
  planStorybookComparison,
  planStorybookShell,
} from "@ui/storybook"
```

Run `bun run storybook` from the repository root and open `http://127.0.0.1:4017`. The root links to `/elements/`, `/components/`, `/storybook/`, and `/hud/`. Prefix overviews end in `/`; exact leaves do not. Unknown suffixes fail closed with `404`.

See the repository [architecture](../../ARCHITECTURE.md) and [contribution guide](../../CONTRIBUTING.md) for package boundaries and evidence requirements.
