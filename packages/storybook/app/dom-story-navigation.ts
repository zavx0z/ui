import {defineStorybookRouteTree} from "@zavx0z/storybook/route-tree"
import type {StorybookDomNavigationItem} from "@zavx0z/storybook/workbench"
import generated from "./dom-story-details.json"

export type UiStoryOwnerId = "dom" | "elements" | "components" | "hud"

type NavigationLevel = Readonly<{
  id: string
  label: string
  route: string
}>

type UiStoryNavigationItem<Route extends string = string> = Readonly<
  Omit<StorybookDomNavigationItem, "route"> & {
    route: Route
    group?: Readonly<{id: string; label: string}>
    searchText?: string
  }
>

export type DomStoryDescriptor = Readonly<{
  kind: "overview" | "detail"
  route: string
  title: string
  apiName: string
  searchText: string
  owner: NavigationLevel & Readonly<{id: UiStoryOwnerId}>
  category: NavigationLevel
  component: NavigationLevel
  section: NavigationLevel
  variant: Readonly<{id: string; label: string}>
}>

const PROMOTED_PRIMARY_ROUTES = Object.freeze(["components/foundation/button"] as const)
const details: readonly DomStoryDescriptor[] = Object.freeze(generated.details.map((value) =>
  validateDetail(value)))
const overviews = Object.freeze([
  createRootOverviewDescriptor(),
  ...collectOverviewPaths(details).map(createOverviewDescriptor),
])
const presentations: readonly DomStoryDescriptor[] = Object.freeze([...overviews, ...details])

export const UI_STORY_ROUTE_TREE = defineStorybookRouteTree({
  leaves: details.map(({route}) => route),
})

export function uiStoryDescriptor(route: string): DomStoryDescriptor {
  const descriptor = presentations.find((item) => item.route === route)
  if (descriptor === undefined) throw new Error(`Unknown UI story: ${route}`)
  return descriptor
}

export function uiPrimaryItems(): readonly UiStoryNavigationItem[] {
  const categories = uniqueItems(details, ({owner, category}) => ({
    id: category.route,
    label: category.label,
    route: category.route,
    group: {id: owner.id, label: owner.label},
    searchText: categorySearchText(category.route),
  }))
  const button = details.find(({component}) => component.route === "components/foundation/button")
  if (button === undefined) throw new Error("Promoted Button story is missing")
  const promoted: UiStoryNavigationItem = {
    id: button.component.route,
    label: button.component.label,
    route: button.component.route,
    group: {id: button.owner.id, label: button.owner.label},
    searchText: `${button.apiName} ${button.searchText}`,
  }
  return categories.flatMap((item) => item.route === "components/foundation"
    ? [promoted, item]
    : [item])
}

export function uiSecondaryItems(route: string): readonly UiStoryNavigationItem[] {
  const selected = uiStoryDescriptor(route)
  if (isPromotedComponent(selected.component.route)) {
    return uniqueItems(
      details.filter(({component}) => component.route === selected.component.route),
      ({section}) => ({id: section.id, label: section.label, route: section.route}),
    )
  }
  return uniqueItems(
    details.filter(({category, component}) => (
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

export function uiDockItems(route: string): readonly UiStoryNavigationItem[] {
  const selected = uiStoryDescriptor(route)
  if (selected.component.id === "overview") return Object.freeze([])
  const stories = details.filter(({component}) => component.route === selected.component.route)
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

function validateDetail(value: typeof generated.details[number]): DomStoryDescriptor {
  if (!(["dom", "elements", "components", "hud"] as const).includes(value.owner.id as UiStoryOwnerId)) {
    throw new Error(`Unknown DOM Storybook owner: ${value.owner.id}`)
  }
  return Object.freeze({
    kind: "detail",
    route: value.route,
    title: value.title,
    apiName: value.apiName,
    searchText: value.searchText,
    owner: Object.freeze({...value.owner, id: value.owner.id as UiStoryOwnerId}),
    category: Object.freeze({...value.category}),
    component: Object.freeze({...value.component}),
    section: Object.freeze({...value.section}),
    variant: Object.freeze({...value.variant}),
  })
}

function collectOverviewPaths(stories: readonly DomStoryDescriptor[]): readonly string[] {
  const seen = new Set<string>()
  for (const {route} of stories) {
    const segments = route.split("/")
    for (let length = 1; length < segments.length; length++) {
      seen.add(segments.slice(0, length).join("/"))
    }
  }
  return [...seen]
}

function createOverviewDescriptor(path: string): DomStoryDescriptor {
  const representative = details.find(({route}) => route.startsWith(`${path}/`))
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
    apiName: componentOverview || depth > 3
      ? representative.apiName
      : overviewSubject(representative, depth),
    searchText: `${title} ${items.map(({label}) => label).join(" ")}`,
    owner: representative.owner,
    category,
    component,
    section,
    variant: {id: "overview", label: "Обзор"},
  })
}

function createRootOverviewDescriptor(): DomStoryDescriptor {
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
  return details.flatMap((item) => {
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

function overviewSubject(representative: DomStoryDescriptor, depth: number): string {
  if (depth === 1) return representative.owner.label
  if (depth === 2) return representative.category.label
  if (depth === 3) return representative.component.label
  return representative.section.label
}

function isPromotedComponent(route: string): boolean {
  return (PROMOTED_PRIMARY_ROUTES as readonly string[]).includes(route)
}

function scenarioLabel(
  item: DomStoryDescriptor,
  stories: readonly DomStoryDescriptor[],
): string {
  const sectionCount = new Set(stories.map(({section}) => section.id)).size
  return sectionCount > 1 ? `${item.section.label} · ${item.variant.label}` : item.variant.label
}

function categorySearchText(route: string): string {
  return details.filter(({category}) => category.route === route)
    .map(({component, apiName, searchText}) => `${component.label} ${apiName} ${searchText}`)
    .join(" ")
}

function uniqueItems(
  source: readonly DomStoryDescriptor[],
  select: (item: DomStoryDescriptor) => UiStoryNavigationItem,
): readonly UiStoryNavigationItem[] {
  const seen = new Set<string>()
  return source.flatMap((item) => {
    const selected = select(item)
    if (seen.has(selected.id)) return []
    seen.add(selected.id)
    return [selected]
  })
}
