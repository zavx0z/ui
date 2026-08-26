import {UiRuntime} from "@layout/core/runtime"
import {
  StorybookBackdropSurface,
  StorybookDockSurface,
  StorybookNavigationSurface,
  StorybookStoryPanelSurface,
  planStorybookShell,
  type StorybookStoryPanelMode,
  type StorybookStoryPanelOptions,
} from "@zavx0z/storybook/workbench"
import {
  StorybookRouteTreeRouter,
  type StorybookRouteTreeNode,
} from "@zavx0z/storybook/route-tree"
import {
  storybookPublicPath,
  waitForStorybookFrameBoundary,
} from "@zavx0z/storybook/environment"
import type {StorybookStoryArgs} from "@zavx0z/storybook/stories"
import {UI_STORYBOOK_RESPONSIVE_POLICY} from "./workbench-policy.ts"
import {
  UiAggregateTileSurface,
  planUiAggregateTileFrame,
} from "./aggregate-preview.ts"
import {
  isUiAggregateStoryModule,
  type UiAggregateStoryEntry,
} from "./aggregate.ts"
import {UiStoryPreviewSurface} from "./preview.ts"
import {
  UI_STORY_ROUTE_TREE,
  loadUiStory,
  uiDockItems,
  uiDockRoute,
  uiDockTitle,
  uiPrimaryItems,
  uiPrimaryRoute,
  uiSecondaryItems,
  uiSecondaryRoute,
  uiStoryDescriptor,
  uiStoryPresentationRoute,
  type UiStoryDescriptor,
  type UiStoryModule,
} from "./stories.ts"

const canvas = document.getElementById("ui-storybook-canvas")
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("UI Storybook canvas not found")
const storyCanvas = canvas

declare global {
  var __uiStorybookCapturePresentedFrame: (() => Promise<Blob | null>) | undefined
  var __uiStorybookLoadReferenceCatalog: (() => Promise<unknown>) | undefined
  var __elementsStoryControlBridge: ((key: string, value: unknown) => void) | undefined
  var __componentsStoryControlBridge: ((key: string, value: unknown) => void) | undefined
}

document.documentElement.dataset.uiStorybook = "starting"
document.documentElement.dataset.uiStorybookPage = "workbench"
globalThis.__uiStorybookLoadReferenceCatalog = async () => import("../reference-catalog.ts")
  .then(({loadStorybookReferenceCatalog}) => loadStorybookReferenceCatalog())

try {
  const runtime = await UiRuntime.create(storyCanvas, {
    virtualDisplay: {initial: "near", surfaceDisplay: true, grid: false},
  })
  globalThis.__uiStorybookCapturePresentedFrame = () => runtime.renderer.captureLastPresentedFramePng()
  runtime.handleResize()
  const router = new StorybookRouteTreeRouter(UI_STORY_ROUTE_TREE, {
    basePath: storybookPublicPath("ui", "/"),
  })
  const initialNode = router.current
  let route = uiStoryPresentationRoute(initialNode.path)
  let descriptor: UiStoryDescriptor = uiStoryDescriptor(route)
  let story: UiStoryModule = await loadUiStory(route)
  let args: StorybookStoryArgs = Object.freeze({...story.defaultArgs})
  let panelMode: StorybookStoryPanelMode = "controls"
  let catalogQuery = ""
  let collapsedCatalogGroups = new Set<string>()
  let controlChanges = 0
  let loadRevision = 0
  let aggregateEntries: readonly UiAggregateStoryEntry[] = Object.freeze([])
  const aggregateTiles = new Map<string, UiAggregateTileSurface>()

  const navigate = (path: string): void => {
    if (!router.go(path)) throw new Error(`Unknown UI Storybook route: ${path}`)
  }
  const backdrop = new StorybookBackdropSurface()
  const catalog = new StorybookNavigationSurface<string>(primaryOptions())
  const sections = new StorybookNavigationSurface<string>(secondaryOptions())
  const preview = new UiStoryPreviewSurface()
  preview.setStory(descriptor, story, args)
  const dock = new StorybookDockSurface<string>(dockOptions())
  let storyPanel: StorybookStoryPanelSurface

  function updateControl(key: string, value: unknown): void {
    args = Object.freeze({...args, [key]: value})
    controlChanges += 1
    preview.setArgs(args)
    storyPanel.setOptions(panelOptions())
    publish()
  }

  const panelOptions = (): StorybookStoryPanelOptions => ({
    source: story.source(args),
    args,
    controls: story.controls,
    events: [
      {id: "route", label: "Сценарий", value: route},
      {id: "category", label: "Раздел", value: descriptor.category.label},
      {id: "component", label: "Компонент", value: descriptor.component.label},
      {id: "api", label: "API", value: descriptor.apiName},
      {id: "changes", label: "Изменения", value: String(controlChanges)},
      ...ownerEvents(),
    ],
    mode: panelMode,
    onModeChange(mode) {
      panelMode = mode
      storyPanel.setOptions(panelOptions())
      publish()
    },
    onControlChange(key, value) {
      updateControl(key, value)
    },
    async onCopy(source) {
      try {
        await navigator.clipboard.writeText(source)
        document.documentElement.dataset.uiStorybookCopy = "copied"
      } catch {
        document.documentElement.dataset.uiStorybookCopy = "error"
      }
    },
  })
  storyPanel = new StorybookStoryPanelSurface(panelOptions())

  const frames = (w: number, h: number) => planStorybookShell(w, h, {
    responsive: UI_STORYBOOK_RESPONSIVE_POLICY,
  })
  runtime.addSurface(backdrop, ({w, h}) => ({x: 0, y: 0, w, h}))
  runtime.addSurface(catalog, ({w, h}) => frames(w, h).catalog)
  runtime.addSurface(sections, ({w, h}) => frames(w, h).section)
  runtime.addSurface(preview, ({w, h}) => frames(w, h).preview)
  runtime.addSurface(dock, ({w, h}) => frames(w, h).dock)
  runtime.addSurface(storyPanel, ({w, h}) => frames(w, h).info)
  syncStoryPresentation()

  function primaryOptions() {
    return {
      title: "UI",
      items: uiPrimaryItems().map((item) => ({
        ...item,
        ...(item.group === undefined ? {} : {
          group: {...item.group, collapsed: collapsedCatalogGroups.has(item.group.id)},
        }),
      })),
      route: uiPrimaryRoute(route),
      onNavigate: navigate,
      query: catalogQuery,
      searchPlaceholder: "Категория, API…",
      onQueryChange(query: string) {
        catalogQuery = query
        catalog.setOptions(primaryOptions())
        publish()
      },
      onGroupToggle(groupId: string) {
        const next = new Set(collapsedCatalogGroups)
        if (next.has(groupId)) next.delete(groupId)
        else next.add(groupId)
        collapsedCatalogGroups = next
        catalog.setOptions(primaryOptions())
        publish()
      },
    }
  }

  function secondaryOptions() {
    return {
      title: descriptor.category.label,
      items: uiSecondaryItems(route),
      route: uiSecondaryRoute(route),
      onNavigate: navigate,
    }
  }

  function dockOptions() {
    return {
      title: uiDockTitle(route),
      items: uiDockItems(route),
      route: uiDockRoute(route),
      onNavigate: navigate,
    }
  }

  async function applyNode(node: StorybookRouteTreeNode<string>): Promise<void> {
    const revision = ++loadRevision
    document.documentElement.dataset.uiStorybook = "starting"
    const nextRoute = uiStoryPresentationRoute(node.path)
    const nextDescriptor = uiStoryDescriptor(nextRoute)
    const nextStory = await loadUiStory(nextRoute)
    if (revision !== loadRevision || router.current !== node) return
    route = nextRoute
    descriptor = nextDescriptor
    story = nextStory
    args = Object.freeze({...story.defaultArgs})
    controlChanges = 0
    syncStoryPresentation()
    catalog.setOptions(primaryOptions())
    sections.setOptions(secondaryOptions())
    dock.setOptions(dockOptions())
    preview.setStory(descriptor, story, args)
    storyPanel.setOptions(panelOptions())
    runtime.relayout()
    publish()
    await waitForStorybookFrameBoundary()
    if (revision !== loadRevision || router.current !== node) return
    document.documentElement.dataset.uiStorybook = "ready"
  }

  function publish(): void {
    for (const surface of [catalog, sections, preview, dock, storyPanel, ...activeAggregateTiles()]) {
      surface.flushPendingRender()
    }
    runtime.space.updateWorldMatrix()
    runtime.renderer.renderFrame(runtime.space, runtime.hud, runtime.viewPoint)
    document.documentElement.dataset.uiStorybookRoute = router.current.path
    document.documentElement.dataset.uiStorybookStory = route
    document.documentElement.dataset.uiStorybookOwner = descriptor.category.id
    document.documentElement.dataset.uiStorybookComponent = descriptor.component.id
    document.documentElement.dataset.uiStorybookPackage = descriptor.owner.id
    document.documentElement.dataset.uiStorybookArgs = JSON.stringify(args)
  }

  function syncStoryPresentation(): void {
    aggregateEntries = isUiAggregateStoryModule(story) ? story.entries : Object.freeze([])
    const activeRoutes = new Set(aggregateEntries.map(({route}) => route))
    for (const [index, entry] of aggregateEntries.entries()) {
      let tile = aggregateTiles.get(entry.route)
      if (tile === undefined) {
        tile = new UiAggregateTileSurface()
        tile.node.visible = false
        aggregateTiles.set(entry.route, tile)
        const tileRoute = entry.route
        runtime.addSurface(tile, ({w, h}) => {
          const activeIndex = aggregateEntries.findIndex(({route}) => route === tileRoute)
          if (activeIndex < 0) return hiddenFrame()
          return planUiAggregateTileFrame(
            frames(w, h).preview,
            activeIndex,
            aggregateEntries.length,
            previewChrome(),
          )
        })
      }
      tile.setEntry(entry)
      tile.node.visible = true
      if (index >= aggregateEntries.length) tile.node.visible = false
    }
    for (const [tileRoute, tile] of aggregateTiles) {
      if (!activeRoutes.has(tileRoute)) tile.node.visible = false
    }
    syncControlBridges()
  }

  function syncControlBridges(): void {
    globalThis.__elementsStoryControlBridge = undefined
    globalThis.__componentsStoryControlBridge = undefined
    if (descriptor.kind !== "detail") return
    if (descriptor.owner.id === "elements") globalThis.__elementsStoryControlBridge = updateControl
    if (descriptor.owner.id === "components") globalThis.__componentsStoryControlBridge = updateControl
  }

  function ownerEvents() {
    if (descriptor.owner.id === "elements") return [{
      id: "state",
      label: "Состояние",
      value: String(args["state"] ?? "готово"),
    }]
    if (descriptor.owner.id === "components") return [{
      id: "owner-callback",
      label: "Событие владельца",
      value: typeof args["event"] === "string" ? args["event"] : "—",
    }]
    return []
  }

  function activeAggregateTiles(): readonly UiAggregateTileSurface[] {
    return aggregateEntries.flatMap(({route}) => {
      const tile = aggregateTiles.get(route)
      return tile === undefined ? [] : [tile]
    })
  }

  function previewChrome() {
    return {
      title: descriptor.title,
      description: `${descriptor.component.label} · ${descriptor.apiName}`,
    }
  }

  router.subscribe((node) => {
    void applyNode(node).catch(publishError)
  })
  new ResizeObserver(() => {
    runtime.handleResize()
    publish()
  }).observe(storyCanvas)
  runtime.relayout()
  publish()
  await waitForStorybookFrameBoundary()
  if (router.current === initialNode) document.documentElement.dataset.uiStorybook = "ready"
} catch (error) {
  publishError(error)
  throw error
}

function hiddenFrame(): Readonly<{x: number; y: number; w: number; h: number}> {
  return {x: 0, y: 0, w: 1, h: 1}
}

function publishError(error: unknown): void {
  document.documentElement.dataset.uiStorybook = "error"
  document.documentElement.dataset.uiStorybookError = error instanceof Error
    ? error.stack ?? error.message
    : String(error)
  console.error(error)
}
