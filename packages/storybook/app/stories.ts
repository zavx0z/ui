import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import type {
  StorybookStoryIndexItem,
  StorybookStoryModule,
} from "@zavx0z/storybook/stories"
import type {StorybookNavigationItem} from "@zavx0z/storybook/workbench"
import {COMPONENT_STORIES} from "../../components/storybook/stories.ts"
import {ELEMENT_STORIES} from "../../elements/storybook/stories.ts"
import type {UiAggregateStoryModule} from "./aggregate.ts"

export type UiStoryOwnerId = "elements" | "components" | "hud"
export type UiStoryModule = StorybookStoryModule | UiAggregateStoryModule

type UiStoryNavigationLevel = Readonly<{
  id: string
  label: string
  route: string
}>

export type UiStoryDescriptor = Readonly<{
  kind: "overview" | "detail"
  route: string
  title: string
  apiName: string
  searchText: string
  owner: UiStoryNavigationLevel & Readonly<{id: UiStoryOwnerId}>
  category: UiStoryNavigationLevel
  component: UiStoryNavigationLevel
  section: UiStoryNavigationLevel
  variant: Readonly<{id: string; label: string}>
  load(): Promise<UiStoryModule>
}>

const OWNER_LABELS: Readonly<Record<UiStoryOwnerId, string>> = Object.freeze({
  elements: "Элементы",
  components: "Компоненты",
  hud: "HUD",
})

const ELEMENT_DETAILS = ELEMENT_STORIES.index.map((item) => detail("elements", item, () =>
  ELEMENT_STORIES.load(item.route)))
const COMPONENT_DETAILS = COMPONENT_STORIES.index.map((item) => detail("components", item, () =>
  COMPONENT_STORIES.load(item.route)))
const HUD_DETAILS = Object.freeze([
  hudDetail({
    componentId: "window",
    componentLabel: "HUD-окно",
    apiName: "HUD",
    summary: "HUD-окно и боковые вкладки",
  }),
  hudDetail({
    componentId: "frame",
    componentLabel: "Рамка",
    apiName: "HUDFrame",
    summary: "Перемещение, изменение размера и docking рамки",
  }),
  hudDetail({
    componentId: "timeline",
    componentLabel: "Временная шкала",
    apiName: "Timeline",
    summary: "Read-only Timeline без product commands и domain state",
  }),
])

export const UI_STORIES: readonly UiStoryDescriptor[] = Object.freeze([
  ...ELEMENT_DETAILS,
  ...COMPONENT_DETAILS,
  ...HUD_DETAILS,
])

export const UI_STORY_ROUTE_TREE = defineStorybookRouteTree({
  leaves: UI_STORIES.map(({route}) => route),
})

const PROMOTED_PRIMARY_ROUTES = Object.freeze(["components/foundation/button"] as const)
const UI_OVERVIEWS = Object.freeze([
  createRootOverviewDescriptor(),
  ...collectOverviewPaths(UI_STORIES).map(createOverviewDescriptor),
])
const UI_PRESENTATIONS: readonly UiStoryDescriptor[] = Object.freeze([...UI_OVERVIEWS, ...UI_STORIES])
const loadCache = new Map<string, Promise<UiStoryModule>>()

export function uiStoryPresentationRoute(path: string): string {
  const node = UI_STORY_ROUTE_TREE.find(path)
  if (node === undefined) throw new Error(`Unknown UI Storybook route: ${path}`)
  uiStoryDescriptor(node.path)
  return node.path
}

export function uiStoryDescriptor(route: string): UiStoryDescriptor {
  const descriptor = UI_PRESENTATIONS.find((item) => item.route === route)
  if (descriptor === undefined) throw new Error(`Unknown UI story: ${route}`)
  return descriptor
}

export function loadUiStory(route: string): Promise<UiStoryModule> {
  const descriptor = uiStoryDescriptor(route)
  const cached = loadCache.get(route)
  if (cached !== undefined) return cached
  const pending = descriptor.load().then(validateStoryModule).catch((error) => {
    if (loadCache.get(route) === pending) loadCache.delete(route)
    throw error
  })
  loadCache.set(route, pending)
  return pending
}

export function uiPrimaryItems(): readonly StorybookNavigationItem<string>[] {
  const categories = uniqueItems(UI_STORIES, ({owner, category}) => ({
    id: category.route,
    label: category.label,
    route: category.route,
    group: {id: owner.id, label: owner.label},
    searchText: categorySearchText(category.route),
  }))
  const button = UI_STORIES.find(({component}) => component.route === "components/foundation/button")
  if (button === undefined) throw new Error("Promoted Button story is missing")
  const promoted: StorybookNavigationItem<string> = {
    id: button.component.route,
    label: button.component.label,
    route: button.component.route,
    group: {id: button.owner.id, label: button.owner.label},
    searchText: `${button.apiName} ${button.searchText}`,
  }
  return categories.flatMap((item) => item.route === "components/foundation" ? [promoted, item] : [item])
}

export function uiSecondaryItems(route: string): readonly StorybookNavigationItem<string>[] {
  const selected = uiStoryDescriptor(route)
  if (isPromotedComponent(selected.component.route)) {
    return uniqueItems(
      UI_STORIES.filter(({component}) => component.route === selected.component.route),
      ({section}) => ({id: section.id, label: section.label, route: section.route}),
    )
  }
  return uniqueItems(
    UI_STORIES.filter(({category, component}) => (
      category.route === selected.category.route && !isPromotedComponent(component.route)
    )),
    ({component, apiName, searchText}) => ({
      id: component.id,
      label: component.label,
      route: component.route,
      searchText: `${apiName} ${searchText}`,
    }),
  )
}

export function uiDockItems(route: string): readonly StorybookNavigationItem<string>[] {
  const selected = uiStoryDescriptor(route)
  if (selected.component.id === "overview") return Object.freeze([])
  const stories = UI_STORIES.filter(({component}) => component.route === selected.component.route)
  if (isPromotedComponent(selected.component.route)) {
    if (selected.section.id === "overview") return Object.freeze([])
    return stories.filter(({section}) => section.route === selected.section.route).map((item) => ({
      id: item.variant.id,
      label: item.variant.label,
      route: item.route,
    }))
  }
  return stories.map((item) => ({
    id: `${item.section.id}/${item.variant.id}`,
    label: scenarioLabel(item, stories),
    route: item.route,
  }))
}

export function uiPrimaryRoute(route: string): string {
  const descriptor = uiStoryDescriptor(route)
  return isPromotedComponent(descriptor.component.route)
    ? descriptor.component.route
    : descriptor.category.route
}

export function uiSecondaryRoute(route: string): string {
  const descriptor = uiStoryDescriptor(route)
  return isPromotedComponent(descriptor.component.route)
    ? descriptor.section.route
    : descriptor.component.route
}

export function uiDockRoute(route: string): string {
  const descriptor = uiStoryDescriptor(route)
  return descriptor.kind === "detail" ? descriptor.route : ""
}

export function uiDockTitle(route: string): string {
  return isPromotedComponent(uiStoryDescriptor(route).component.route) ? "Варианты" : "Сценарии"
}

function detail(
  ownerId: Exclude<UiStoryOwnerId, "hud">,
  item: StorybookStoryIndexItem,
  load: () => Promise<StorybookStoryModule>,
): UiStoryDescriptor {
  const owner = ownerLevel(ownerId)
  const categoryRoute = `${owner.route}/${item.groupId}`
  const componentRoute = `${categoryRoute}/${item.componentId}`
  const sectionRoute = `${componentRoute}/${item.sectionId}`
  return story({
    route: `${sectionRoute}/${item.variantId}`,
    title: item.title,
    apiName: item.apiName,
    searchText: item.searchText,
    owner,
    category: {id: item.groupId, label: item.groupLabel, route: categoryRoute},
    component: {id: item.componentId, label: item.componentLabel, route: componentRoute},
    section: {id: item.sectionId, label: item.sectionLabel, route: sectionRoute},
    variant: {id: item.variantId, label: item.variantLabel},
    load,
  })
}

function hudDetail(input: Readonly<{
  componentId: string
  componentLabel: string
  apiName: string
  summary: string
}>): UiStoryDescriptor {
  const owner = ownerLevel("hud")
  const category = {id: "foundation", label: "Основные", route: "hud/foundation"}
  const component = {
    id: input.componentId,
    label: input.componentLabel,
    route: `${category.route}/${input.componentId}`,
  }
  const section = {id: "inventory", label: "Состав пакета", route: `${component.route}/inventory`}
  return story({
    route: `${section.route}/default`,
    title: `${input.componentLabel} · Состав пакета`,
    apiName: input.apiName,
    searchText: `${input.componentLabel} ${input.apiName} ${input.summary}`,
    owner,
    category,
    component,
    section,
    variant: {id: "default", label: "Обзор API"},
    load: async () => import("./hud-story.ts").then(({createHudInventoryStory}) =>
      createHudInventoryStory({title: input.componentLabel, summary: input.summary})),
  })
}

function ownerLevel(id: UiStoryOwnerId): UiStoryDescriptor["owner"] {
  return Object.freeze({id, label: OWNER_LABELS[id], route: id})
}

function story(input: Omit<UiStoryDescriptor, "kind">): UiStoryDescriptor {
  return Object.freeze({kind: "detail", ...input})
}

function collectOverviewPaths(stories: readonly UiStoryDescriptor[]): readonly string[] {
  const seen = new Set<string>()
  for (const {route} of stories) {
    const segments = route.split("/")
    for (let length = 1; length < segments.length; length += 1) {
      seen.add(segments.slice(0, length).join("/"))
    }
  }
  return [...seen]
}

function createOverviewDescriptor(path: string): UiStoryDescriptor {
  const representative = UI_STORIES.find(({route}) => route.startsWith(`${path}/`))
  if (representative === undefined) throw new Error(`UI overview has no detail descendant: ${path}`)
  const depth = path.split("/").length
  const ownerOverview = depth === 1
  const categoryOverview = depth === 2
  const componentOverview = depth === 3
  const category = ownerOverview
    ? {id: `owner:${representative.owner.id}`, label: representative.owner.label, route: path}
    : representative.category
  const component = ownerOverview || categoryOverview
    ? {id: "overview", label: "Обзор", route: path}
    : representative.component
  const section = ownerOverview || categoryOverview || componentOverview
    ? {id: "overview", label: "Обзор", route: path}
    : representative.section
  const items = overviewItems(path)
  const title = `${overviewSubject(representative, depth)} · Обзор`
  return Object.freeze({
    kind: "overview",
    route: path,
    title,
    apiName: componentOverview || depth > 3 ? representative.apiName : overviewSubject(representative, depth),
    searchText: `${title} ${items.map(({label}) => label).join(" ")}`,
    owner: representative.owner,
    category,
    component,
    section,
    variant: {id: "overview", label: "Обзор"},
    load: ownerOverview
      ? async () => import("./overview.ts").then(({createUiOverviewStory}) => createUiOverviewStory({
        title,
        summary: `${items.length} разделов: общая информация до выбора точного сценария`,
        items,
      }))
      : async () => {
        const [{createUiAggregateStory}, entries] = await Promise.all([
          import("./aggregate.ts"),
          loadAggregateEntries(path, items),
        ])
        return createUiAggregateStory({title, entries})
      },
  })
}

function createRootOverviewDescriptor(): UiStoryDescriptor {
  const representative = createOverviewDescriptor("elements/primitives")
  return Object.freeze({
    ...representative,
    route: "",
    component: {id: "overview", label: "Обзор", route: ""},
    section: {id: "overview", label: "Обзор", route: ""},
    searchText: `${representative.searchText} root`,
  })
}

function overviewItems(path: string): readonly Readonly<{label: string; route: string}>[] {
  const prefix = `${path}/`
  const seen = new Set<string>()
  return UI_STORIES.flatMap((item) => {
    if (!item.route.startsWith(prefix)) return []
    const child = item.route.slice(prefix.length).split("/")[0]
    if (child === undefined || seen.has(child)) return []
    seen.add(child)
    const route = `${path}/${child}`
    if (isPromotedComponent(route) && path === item.category.route) return []
    const label = item.category.route === route
      ? item.category.label
      : item.component.route === route
        ? item.component.label
        : item.section.route === route
          ? item.section.label
          : item.variant.label
    return [{label, route}]
  })
}

function isPromotedComponent(route: string): boolean {
  return (PROMOTED_PRIMARY_ROUTES as readonly string[]).includes(route)
}

async function loadAggregateEntries(
  path: string,
  items: readonly Readonly<{label: string; route: string}>[],
) {
  return Promise.all(items.map(async ({label, route}) => {
    const detail = UI_STORIES.find((item) => item.route === route || item.route.startsWith(`${route}/`))
    if (detail === undefined) throw new Error(`UI aggregate child has no detail story: ${route}`)
    const module = await loadUiStory(detail.route)
    if ("kind" in module) throw new Error(`UI aggregate child must resolve to a detail story: ${detail.route}`)
    return Object.freeze({id: route, label, route, module})
  }))
}

function overviewSubject(representative: UiStoryDescriptor, depth: number): string {
  if (depth === 1) return representative.owner.label
  if (depth === 2) return representative.category.label
  if (depth === 3) return representative.component.label
  return representative.section.label
}

function scenarioLabel(item: UiStoryDescriptor, stories: readonly UiStoryDescriptor[]): string {
  const sectionCount = new Set(stories.map(({section}) => section.id)).size
  return sectionCount > 1 ? `${item.section.label} · ${item.variant.label}` : item.variant.label
}

function categorySearchText(route: string): string {
  return UI_STORIES.filter(({category}) => category.route === route)
    .map(({component, apiName, searchText}) => `${component.label} ${apiName} ${searchText}`)
    .join(" ")
}

function uniqueItems(
  source: readonly UiStoryDescriptor[],
  select: (item: UiStoryDescriptor) => StorybookNavigationItem<string>,
): readonly StorybookNavigationItem<string>[] {
  const seen = new Set<string>()
  return source.flatMap((item) => {
    const selected = select(item)
    if (seen.has(selected.id)) return []
    seen.add(selected.id)
    return [selected]
  })
}

function validateStoryModule(module: UiStoryModule): UiStoryModule {
  if (module === null || typeof module !== "object" || typeof module.source !== "function" ||
    module.defaultArgs === null || typeof module.defaultArgs !== "object" || !Array.isArray(module.controls)) {
    throw new Error("UI Storybook loader returned an invalid story module")
  }
  if ("kind" in module) {
    if (module.kind !== "ui-aggregate" || !Array.isArray(module.entries)) {
      throw new Error("UI Storybook loader returned an invalid aggregate module")
    }
    return module
  }
  if (typeof module.render !== "function") throw new Error("UI Storybook loader returned an invalid detail module")
  return module
}
