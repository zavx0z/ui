import {
  UI_DOM_STORY_ROUTES,
  isUiDomStoryRoute,
  type UiDomStoryRoute,
} from "./dom-routes.ts"
import {
  uiDockItems,
  uiPrimaryItems,
  uiSecondaryItems,
  uiStoryDescriptor,
} from "./dom-story-navigation.ts"

export type UiOverviewPlanItem = Readonly<{
  label: string
  route: UiDomStoryRoute
  representativeRoute: UiDomStoryRoute
}>

export function planUiOverview(route: UiDomStoryRoute): readonly UiOverviewPlanItem[] {
  if (uiStoryDescriptor(route).kind !== "overview") {
    throw new Error(`UI Storybook detail is not an overview: ${route}`)
  }
  const dock = uiDockItems(route)
  const secondary = uiSecondaryItems(route)
  const children = dock.length > 0 ? dock : secondary.length > 0 ? secondary : uiPrimaryItems()
  return Object.freeze(children.map(({label, route: childRoute}) => {
    const exactChild = exactRoute(childRoute)
    return Object.freeze({
      label,
      route: exactChild,
      representativeRoute: representativeDetailRoute(exactChild),
    })
  }))
}

function representativeDetailRoute(route: UiDomStoryRoute): UiDomStoryRoute {
  if (uiStoryDescriptor(route).kind === "detail") return route
  const prefix = route === "" ? "" : `${route}/`
  const representative = UI_DOM_STORY_ROUTES.find((candidate) =>
    candidate.startsWith(prefix) && uiStoryDescriptor(candidate).kind === "detail")
  if (representative === undefined) {
    throw new Error(`UI Storybook overview has no detail representative: ${route}`)
  }
  return exactRoute(representative)
}

function exactRoute(value: string): UiDomStoryRoute {
  if (!isUiDomStoryRoute(value)) throw new Error(`Unknown UI Storybook route: ${value}`)
  return value
}
