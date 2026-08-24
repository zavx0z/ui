import {join} from "node:path"
import {COMPONENT_STORIES} from "../../../components/storybook/stories.ts"
import {ELEMENT_STORIES} from "../../../elements/storybook/stories.ts"
import {
  createStorybookPage,
  type StorybookPage,
} from "@ui/storybook/server"
import {defineStorybookRouteTree} from "@ui/storybook"
import {
  UI_PACKAGE_CATALOG,
  type UiPackageStorybookId,
} from "../catalog/package-catalog.ts"

export type UiStorybookPageId = "catalog" | UiPackageStorybookId

export type UiStorybookPagesOptions = Readonly<{
  publicBasePath?: string
}>

type PageFiles = Readonly<{
  entrypoint: string
  stylePath: string
  body: Readonly<{kind: "canvas"; canvasId: string}> | Readonly<{kind: "html"; bodyHtmlPath: string}>
}>

const storybookRoot = join(import.meta.dir, "../..")
const uiRoot = join(storybookRoot, "..")

const PAGE_FILES: Readonly<Record<UiStorybookPageId, PageFiles>> = Object.freeze({
  catalog: pageFiles({
    entrypoint: join(storybookRoot, "app/catalog/catalog-storybook.ts"),
    stylePath: join(storybookRoot, "app/catalog/catalog-storybook.css"),
    body: {kind: "html", bodyHtmlPath: join(storybookRoot, "app/catalog/catalog-storybook-body.html")},
  }),
  elements: pageFiles({
    entrypoint: join(uiRoot, "elements/storybook/entry.ts"),
    stylePath: join(uiRoot, "elements/storybook/style.css"),
    body: {kind: "canvas", canvasId: "stage-canvas"},
  }),
  components: pageFiles({
    entrypoint: join(uiRoot, "components/storybook/entry.ts"),
    stylePath: join(uiRoot, "components/storybook/style.css"),
    body: {kind: "canvas", canvasId: "stage-canvas"},
  }),
  storybook: pageFiles({
    entrypoint: join(storybookRoot, "fixtures/entry.ts"),
    stylePath: join(storybookRoot, "fixtures/style.css"),
    body: {kind: "canvas", canvasId: "storybook-canvas"},
  }),
  hud: pageFiles({
    entrypoint: join(storybookRoot, "app/packages/hud/hud-storybook.ts"),
    stylePath: join(storybookRoot, "app/packages/hud/hud-storybook.css"),
    body: {kind: "html", bodyHtmlPath: join(storybookRoot, "app/packages/hud/hud-storybook-body.html")},
  }),
})

const CATALOG_ROUTE_TREE = defineStorybookRouteTree({leaves: [] as const})
const FIXTURE_ROUTE_TREE = defineStorybookRouteTree({leaves: ["overview", "details"] as const})
const HUD_ROUTE_TREE = defineStorybookRouteTree({leaves: [] as const})

export function createUiStorybookPages(options: UiStorybookPagesOptions = {}): readonly StorybookPage[] {
  const catalog = PAGE_FILES.catalog
  const pages: StorybookPage[] = [createStorybookPage({
    id: "catalog",
    mountPath: "/",
    packageName: "UI storybook",
    entrypoint: catalog.entrypoint,
    stylePath: catalog.stylePath,
    body: catalog.body,
    ...(options.publicBasePath === undefined ? {} : {publicBasePath: options.publicBasePath}),
    routeTree: CATALOG_ROUTE_TREE,
  })]
  for (const entry of UI_PACKAGE_CATALOG) {
    const files = PAGE_FILES[entry.id]
    pages.push(createStorybookPage({
      id: entry.id,
      mountPath: entry.routePrefix,
      packageName: `UI storybook · ${entry.packageName}`,
      entrypoint: files.entrypoint,
      stylePath: files.stylePath,
      body: files.body,
      homePath: "/",
      ...(options.publicBasePath === undefined ? {} : {publicBasePath: options.publicBasePath}),
      routeTree: routeTreeFor(entry.id),
    }))
  }
  return Object.freeze(pages)
}

export function uiStorybookPageFiles(id: UiStorybookPageId): PageFiles {
  return PAGE_FILES[id]
}

function routeTreeFor(id: UiPackageStorybookId) {
  if (id === "elements") return ELEMENT_STORIES.routeTree
  if (id === "components") return COMPONENT_STORIES.routeTree
  if (id === "storybook") return FIXTURE_ROUTE_TREE
  return HUD_ROUTE_TREE
}

function pageFiles(files: PageFiles): PageFiles {
  return Object.freeze(files)
}
