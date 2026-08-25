import {join} from "node:path"
import {COMPONENT_STORIES} from "../../../components/storybook/stories.ts"
import {ELEMENT_STORIES} from "../../../elements/storybook/stories.ts"
import {
  defineStorybookApp,
  type StorybookAppManifest,
  type StorybookCapability,
  type StorybookPageBody,
} from "@zavx0z/storybook/app"
import {
  createStorybookPage,
  type StorybookPage,
} from "@zavx0z/storybook/server"
import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
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
  body: StorybookPageBody
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
  hud: pageFiles({
    entrypoint: join(storybookRoot, "app/packages/hud/hud-storybook.ts"),
    stylePath: join(storybookRoot, "app/packages/hud/hud-storybook.css"),
    body: {kind: "html", bodyHtmlPath: join(storybookRoot, "app/packages/hud/hud-storybook-body.html")},
  }),
})

const CATALOG_ROUTE_TREE = defineStorybookRouteTree({leaves: [] as const})
const HUD_ROUTE_TREE = defineStorybookRouteTree({leaves: [] as const})

/** Один UI-owned manifest для dev server, static build и lifecycle checks. */
export function createUiStorybookApp(options: UiStorybookPagesOptions = {}): StorybookAppManifest {
  const catalog = PAGE_FILES.catalog
  return defineStorybookApp({
    id: "ui",
    title: "UI storybook",
    basePath: options.publicBasePath ?? "",
    home: {path: "/", label: "Главная", ariaLabel: "На главную Storybook"},
    footer: {
      lead: "Создано для",
      owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"},
      detail: "переиспользуемая WebGPU-инфраструктура UI",
    },
    head: {meta: [{
      kind: "public-path",
      name: "engine-default-font",
      path: "/fonts/jetbrains-mono-bold.ttf",
    }]},
    pages: [{
    id: "catalog",
    title: "UI storybook",
    mountPath: "/",
    entrypoint: catalog.entrypoint,
    stylePath: catalog.stylePath,
    body: catalog.body,
    capability: "dom",
    readiness: {dataset: "uiStorybook", value: "ready"},
    routeTree: CATALOG_ROUTE_TREE,
    }, ...UI_PACKAGE_CATALOG.map((entry) => {
      const files = PAGE_FILES[entry.id]
      const capability = capabilityFor(entry.id)
      const canvasId = files.body.kind === "canvas" ? files.body.canvasId : null
      return {
        id: entry.id,
        title: `UI storybook · ${entry.packageName}`,
        mountPath: entry.routePrefix,
        entrypoint: files.entrypoint,
        stylePath: files.stylePath,
        body: files.body,
        capability,
        readiness: {dataset: "uiStorybook", value: "ready"},
        ...(canvasId === null ? {} : {canvas: {id: canvasId, evidence: "non-black" as const}}),
        routeTree: routeTreeFor(entry.id),
      }
    })],
  })
}

/** Creates the UI-owned pages used by focused application tests. */
export function createUiStorybookPages(options: UiStorybookPagesOptions = {}): readonly StorybookPage[] {
  const app = createUiStorybookApp(options)
  return Object.freeze(app.pages.map((page) => createStorybookPage(app, page)))
}

export function uiStorybookPageFiles(id: UiStorybookPageId): PageFiles {
  return PAGE_FILES[id]
}

function routeTreeFor(id: UiPackageStorybookId) {
  if (id === "elements") return ELEMENT_STORIES.routeTree
  if (id === "components") return COMPONENT_STORIES.routeTree
  return HUD_ROUTE_TREE
}

function capabilityFor(id: UiPackageStorybookId): StorybookCapability {
  if (id === "hud") return "dom"
  return "webgpu"
}

function pageFiles(files: PageFiles): PageFiles {
  return Object.freeze(files)
}
