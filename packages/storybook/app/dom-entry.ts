import {loadDocumentDefaultFont} from "@engine/core/default-font"
import {
  buttonProductionStoryDefaultProps,
  checkboxProductionStoryDefaultProps,
  collectionInputProductionStoryDefaultProps,
  colorInputProductionStoryDefaultProps,
  controlGroupProductionStoryDefaultProps,
  createControlGroupProductionStory,
  createCollectionInputProductionStory,
  createColorInputProductionStory,
  createEnumInputProductionStory,
  createIntegerInputProductionStory,
  createListProductionStory,
  createMatrixInputProductionStory,
  createNumberInputProductionStory,
  createPathInputProductionStory,
  createProgressCheckboxProductionStory,
  createReferenceInputProductionStory,
  createSliderControlProductionStory,
  createBadgeProductionStory,
  createButtonProductionStory,
  createCheckboxProductionStory,
  createDividerProductionStory,
  createFieldProductionStory,
  createHudFrameProductionStory,
  createHudWindowProductionStory,
  createPaneProductionStory,
  createSwitcherProductionStory,
  createTableProductionStory,
  createTextFieldProductionStory,
  createTypographyProductionStory,
  createTimelineProductionStory,
  createVectorInputProductionStory,
  enumInputProductionStoryDefaultProps,
  integerInputProductionStoryDefaultProps,
  pathInputProductionStoryDefaultProps,
  switcherProductionStoryDefaultProps,
} from "./production-component-stories.ts"
import {createCompiledInspectorProductionStory} from "./compiled-inspector-production-story.tsx"
import {createCompiledCodeEditorProductionStory} from "./compiled-code-editor-production-story.tsx"
import {
  createDomInterfaceStory,
  domInterfaceStoryCss,
} from "./dom-interface-story.ts"
import {
  createElementDomStory,
  elementDomStoryCss,
  isElementDomStoryRoute,
} from "./element-dom-story.ts"
import {
  createPopoverDomStory,
  isPopoverDomStoryRoute,
  popoverDomStoryCss,
} from "./popover-dom-story.ts"
import {
  createImageDomStory,
  imageDomStoryCss,
  isImageDomStoryRoute,
} from "./image-dom-story.ts"
import {
  createAggregateOverviewStory,
  type AggregateChildStory,
} from "./aggregate-overview-story.ts"
import {
  createDocument,
  type CustomEvent as DomCustomEvent,
  type Document as SemanticDocument,
  type HTMLElement,
} from "@zavx0z/dom"
import {createDocumentCanvasRuntime} from "@zavx0z/renderer-browser"
import {
  STORYBOOK_DOM_WORKBENCH_EVENTS,
  createStorybookDomWorkbench,
  storybookDomWorkbenchCss,
} from "@zavx0z/storybook/workbench"
import {
  storybookPublicPath,
  waitForStorybookFrameBoundary,
} from "@zavx0z/storybook/environment"
import {StorybookRouteTreeRouter} from "@zavx0z/storybook/route-tree"
import {
  BUTTON_ICON_DOM_STORY_ROUTES,
  ENUM_DOM_STORY_ROUTES,
  isUiDomStoryRoute,
  type UiDomStoryRoute,
} from "./dom-routes.ts"
import {
  UI_STORY_ROUTE_TREE,
  uiDockItems,
  uiDockRoute,
  uiDockTitle,
  uiPrimaryItems,
  uiPrimaryRoute,
  uiSecondaryItems,
  uiSecondaryRoute,
  uiStoryDescriptor,
} from "./dom-story-navigation.ts"
import {uiStorybookWorkbenchCss} from "./workbench-style.ts"
import {planUiOverview} from "./overview-plan.ts"
import {uiRouteStoryCss} from "./route-style.ts"
import {
  createStoryPropsInspector,
  type StoryProps,
} from "./props-inspector.tsx"

const canvas = document.getElementById("ui-storybook-canvas")
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("UI Storybook canvas not found")

declare global {
  var __uiStorybookCapturePresentedFrame: (() => Promise<Blob | null>) | undefined
  var __uiStorybookLoadReferenceCatalog: (() => Promise<unknown>) | undefined
}

type UiRouteStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
  props?: StoryProps
  dispose?(): void
}>

type UiRouteStoryResult = Readonly<{
  story: UiRouteStory
  css: string
}>

document.documentElement.dataset.uiStorybook = "starting"
document.documentElement.dataset.uiStorybookPage = "workbench"
document.documentElement.dataset.uiStorybookPipeline = "dom-webgpu"
globalThis.__uiStorybookLoadReferenceCatalog = async () => import("../reference-catalog.ts")
  .then(({loadStorybookReferenceCatalog}) => loadStorybookReferenceCatalog())

try {
  const router = new StorybookRouteTreeRouter(UI_STORY_ROUTE_TREE, {
    basePath: storybookPublicPath("ui", "/"),
  })
  let route = exactRoute(router.current.path)
  let descriptor = uiStoryDescriptor(route)
  const semanticDocument = createDocument()
  let {story} = await createDomRouteStory(route, semanticDocument)
  const propsInspector = createStoryPropsInspector(
    semanticDocument,
    inspectorContext(descriptor),
    inspectedProps(route, descriptor, story),
  )
  const catalogItems = uiPrimaryItems()
  const initialSecondaryItems = secondaryNavigationItems(route)
  const initialScenarioItems = scenarioNavigationItems(route)
  const workbench = createStorybookDomWorkbench({
    document: semanticDocument,
    parent: semanticDocument,
    initial: {
      title: "UI Storybook",
      "catalog.label": "UI",
      "catalog.items": catalogItems,
      "catalog.active": presentActive(uiPrimaryRoute(route), catalogItems),
      "secondary.label": descriptor.category.label,
      "secondary.items": initialSecondaryItems,
      "secondary.active": descriptor.kind === "detail"
        ? presentActive(uiSecondaryRoute(route), initialSecondaryItems)
        : null,
      "preview.label": descriptor.title,
      "preview.node": story.element,
      "scenarios.label": uiDockTitle(route),
      "scenarios.items": initialScenarioItems,
      "scenarios.active": descriptor.kind === "detail"
        ? presentActive(uiDockRoute(route), initialScenarioItems)
        : null,
      "inspector.node": propsInspector.element,
      status: {
        lead: "Создано для ",
        owner: "MetaFor",
        detail: " · HTML DOM → WebGPU",
      },
    },
  })

  const font = await loadDocumentDefaultFont()
  const runtime = await createDocumentCanvasRuntime({
    canvas,
    document: semanticDocument,
    root: workbench.element,
    styleSheets: [storybookDomWorkbenchCss, uiStorybookWorkbenchCss, uiRouteStoryCss],
    font,
    tooltipDelayMs: 500,
    distance: 600,
  })
  globalThis.__uiStorybookCapturePresentedFrame = () =>
    runtime.captureLastPresentedFramePng()
  let disposed = false
  let routeRevision = 0

  const publish = (): void => {
    propsInspector.update(
      inspectorContext(descriptor),
      inspectedProps(route, descriptor, story),
    )
    publishReadyState(route, descriptor)
    runtime.requestRender()
  }

  const applyRoute = async (target: string): Promise<void> => {
    if (disposed) return
    const nextRoute = exactRoute(target)
    if (nextRoute === route) {
      runtime.requestRender()
      return
    }
    const revision = ++routeRevision
    document.documentElement.dataset.uiStorybook = "starting"
    const nextDescriptor = uiStoryDescriptor(nextRoute)
    const {story: nextStory} = await createDomRouteStory(nextRoute, semanticDocument)
    if (disposed || revision !== routeRevision) {
      disposeStory(nextStory)
      return
    }
    const previous = story
    const nextSecondaryItems = secondaryNavigationItems(nextRoute)
    const nextScenarioItems = scenarioNavigationItems(nextRoute)
    route = nextRoute
    descriptor = nextDescriptor
    story = nextStory
    semanticDocument.transaction(() => {
      workbench.update("catalog.active", presentActive(uiPrimaryRoute(route), catalogItems))
      workbench.update("secondary.label", descriptor.category.label)
      workbench.update("secondary.items", nextSecondaryItems)
      workbench.update("secondary.active", descriptor.kind === "detail"
        ? presentActive(uiSecondaryRoute(route), nextSecondaryItems)
        : null)
      workbench.update("preview.label", descriptor.title)
      workbench.update("preview.node", story.element)
      workbench.update("scenarios.label", uiDockTitle(route))
      workbench.update("scenarios.items", nextScenarioItems)
      workbench.update("scenarios.active", descriptor.kind === "detail"
        ? presentActive(uiDockRoute(route), nextScenarioItems)
        : null)
      propsInspector.update(
        inspectorContext(descriptor),
        inspectedProps(route, descriptor, story),
      )
      workbench.update("status", statusState())
    })
    disposeStory(previous)
    publish()
    await waitForStorybookFrameBoundary()
    if (!disposed && revision === routeRevision) {
      document.documentElement.dataset.uiStorybook = "ready"
    }
  }

  const navigate = (target: string): void => {
    if (!router.go(target)) throw new Error(`Unknown UI Storybook route: ${target}`)
    if (target === route) runtime.requestRender()
  }
  const onNavigate = (event: unknown): void =>
    navigate((event as DomCustomEvent<{route: string}>).detail.route)
  const onScenario = (event: unknown): void =>
    navigate((event as DomCustomEvent<{id: string}>).detail.id)
  const onStoryMutation = (): void => publish()
  const unsubscribe = router.subscribe((node) => {
    void applyRoute(node.path).catch(publishError)
  })

  workbench.element.addEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.navigate, onNavigate)
  workbench.element.addEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.scenario, onScenario)
  workbench.element.addEventListener("input", onStoryMutation)
  workbench.element.addEventListener("change", onStoryMutation)
  workbench.element.addEventListener("click", onStoryMutation)
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    routeRevision += 1
    unsubscribe()
    router.dispose()
    workbench.element.removeEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.navigate, onNavigate)
    workbench.element.removeEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.scenario, onScenario)
    workbench.element.removeEventListener("input", onStoryMutation)
    workbench.element.removeEventListener("change", onStoryMutation)
    workbench.element.removeEventListener("click", onStoryMutation)
    propsInspector.dispose()
    disposeStory(story)
    workbench.dispose()
    runtime.dispose()
    globalThis.__uiStorybookCapturePresentedFrame = undefined
  }
  window.addEventListener("pagehide", dispose, {once: true})

  publish()
  await waitForStorybookFrameBoundary()
  document.documentElement.dataset.uiStorybook = "ready"
} catch (error) {
  publishError(error)
  throw error
}

function presentActive(
  candidate: string,
  items: readonly Readonly<{id: string}>[],
): string | null {
  return items.some(({id}) => id === candidate) ? candidate : null
}

function secondaryNavigationItems(route: UiDomStoryRoute): readonly Readonly<{
  id: string
  label: string
  route: string
}>[] {
  return uiSecondaryItems(route).map(({label, route: itemRoute}) => ({
    id: itemRoute,
    label,
    route: itemRoute,
  }))
}

function scenarioNavigationItems(route: UiDomStoryRoute): readonly Readonly<{
  id: string
  label: string
}>[] {
  return uiDockItems(route).map(({route: itemRoute, label}) => ({id: itemRoute, label}))
}

function statusState(): Readonly<{lead: string; owner: string; detail: string}> {
  return Object.freeze({lead: "Создано для ", owner: "MetaFor", detail: " · HTML DOM → WebGPU"})
}

function inspectorContext(
  descriptor: ReturnType<typeof uiStoryDescriptor>,
): Readonly<{label: string; title: string}> {
  return Object.freeze({label: descriptor.apiName, title: descriptor.title})
}

function inspectedProps(
  route: UiDomStoryRoute,
  descriptor: ReturnType<typeof uiStoryDescriptor>,
  story: UiRouteStory,
): StoryProps {
  if (descriptor.kind === "overview") {
    return Object.freeze({kind: "overview", route: `/${route}`})
  }
  const declared = story.props ?? Object.freeze({})
  const live = liveElementProps(story.element)
  const reflected = Object.keys(declared).length === 0
    ? live
    : Object.freeze(Object.fromEntries(
      Object.entries(live).filter(([key]) => Object.hasOwn(declared, key)),
    ))
  const props = Object.freeze({...declared, ...reflected})
  if (Object.keys(props).length > 0) return props
  return Object.freeze({element: story.element.localName})
}

function liveElementProps(element: HTMLElement): StoryProps {
  const props: Record<string, unknown> = {}
  const control = isValueControl(element)
    ? element
    : element.querySelector("input") ??
      element.querySelector("select") ??
      element.querySelector("textarea")
  if (control && "value" in control && typeof control.value === "string") {
    props.value = control.value
  }
  if (control && "checked" in control && typeof control.checked === "boolean") {
    props.checked = control.checked
  }
  if (element.hasAttribute("disabled")) props.disabled = true
  return Object.freeze(props)
}

function isValueControl(element: HTMLElement): element is HTMLElement & Readonly<{
  value: string
  checked?: boolean
}> {
  return element.localName === "input" || element.localName === "select" || element.localName === "textarea"
}

function exactRoute(value: string): UiDomStoryRoute {
  if (!isUiDomStoryRoute(value)) throw new Error(`Unknown UI Storybook route: ${value}`)
  return value
}

function disposeStory(story: UiRouteStory): void {
  story.dispose?.()
}

function publishError(error: unknown): void {
  document.documentElement.dataset.uiStorybook = "error"
  document.documentElement.dataset.uiStorybookError = error instanceof Error
    ? error.stack ?? error.message
    : String(error)
  console.error(error)
}

async function createDomRouteStory(
  route: UiDomStoryRoute,
  document: SemanticDocument,
): Promise<UiRouteStoryResult> {
  if (route === "components/foundation/button/icon/svg") {
    return createButtonProductionStory(document, {
      ...buttonProductionStoryDefaultProps,
      label: "▣ Output",
      title: "SVG icon button",
    })
  }
  if (isImageDomStoryRoute(route)) {
    return Object.freeze({story: createImageDomStory(document, route), css: imageDomStoryCss})
  }
  if (isPopoverDomStoryRoute(route)) {
    return Object.freeze({story: createPopoverDomStory(document, route), css: popoverDomStoryCss})
  }
  if ((BUTTON_ICON_DOM_STORY_ROUTES as readonly string[]).includes(route)) {
    const iconLeft = route.endsWith("/left")
    return createButtonProductionStory(document, {
      ...buttonProductionStoryDefaultProps,
      label: iconLeft ? "◆ Output" : "Output ◆",
      title: iconLeft ? "Icon left" : "Icon right",
    })
  }
  if ((ENUM_DOM_STORY_ROUTES as readonly string[]).includes(route)) {
    return createEnumInputProductionStory(document, {
      ...enumInputProductionStoryDefaultProps,
      disabled: route.endsWith("/disabled") || route.endsWith("/readonly"),
      title: route,
    })
  }
  if (isElementDomStoryRoute(route)) {
    return Object.freeze({story: createElementDomStory(document, route), css: elementDomStoryCss})
  }
  const descriptor = uiStoryDescriptor(route)
  if (descriptor.kind === "overview") {
    const items = planUiOverview(route)
    return Object.freeze({
      story: await createAggregateOverviewStory(document, {
        title: descriptor.title,
        route,
        css: uiRouteStoryCss,
        items: items.map(({label, route: itemRoute, representativeRoute}) => ({
          label,
          route: itemRoute,
          representativeRoute,
        })),
        async load(representativeRoute) {
          const {story} = await createDomRouteStory(exactRoute(representativeRoute), document)
          return story as AggregateChildStory
        },
      }),
      css: uiRouteStoryCss,
    })
  }
  if (route === "dom" || route.startsWith("dom/")) {
    return Object.freeze({
      story: createDomInterfaceStory(document, {
        apiName: descriptor.apiName,
        title: descriptor.title,
        route,
      }),
      css: domInterfaceStoryCss,
    })
  }
  switch (route) {
    case "components/data/inspector/basic/default":
      return createCompiledInspectorProductionStory(document)
    case "components/data/list/basic/default":
      return createListProductionStory(document)
    case "components/data/table/basic/default":
      return createTableProductionStory(document)
    case "components/data/code-editor/state/read-only":
      return createCompiledCodeEditorProductionStory(document)
    case "components/foundation/button/basic/contained":
      return createButtonProductionStory(document)
    case "components/foundation/button/basic/text":
      return createButtonProductionStory(document, {
        ...buttonProductionStoryDefaultProps,
        variant: "text",
        title: "Text button",
      })
    case "components/foundation/button/basic/outlined":
      return createButtonProductionStory(document, {
        ...buttonProductionStoryDefaultProps,
        variant: "outlined",
        title: "Outlined button",
      })
    case "components/foundation/button/sizes/small":
      return createButtonProductionStory(document, {
        ...buttonProductionStoryDefaultProps,
        size: "small",
        title: "Small button",
      })
    case "components/foundation/button/sizes/medium":
      return createButtonProductionStory(document)
    case "components/foundation/button/sizes/large":
      return createButtonProductionStory(document, {
        ...buttonProductionStoryDefaultProps,
        size: "large",
        title: "Large button",
      })
    case "components/foundation/button/color/primary":
    case "components/foundation/button/color/success":
    case "components/foundation/button/color/warning":
    case "components/foundation/button/color/error":
    case "components/foundation/button/color/neutral": {
      const tone = route.split("/").at(-1) as "primary" | "success" | "warning" | "error" | "neutral"
      return createButtonProductionStory(document, {
        ...buttonProductionStoryDefaultProps,
        tone,
        title: `${tone} button`,
      })
    }
    case "components/inputs/text-field/basic/default":
      return createTextFieldProductionStory(document)
    case "components/inputs/control-group/basic/default":
      return createControlGroupProductionStory(document, controlGroupProductionStoryDefaultProps)
    case "components/inputs/field/text/default":
      return createFieldProductionStory(document, {
        id: "field-text",
        label: "Value",
        kind: "text",
        value: "Output",
        description: "Text value",
      })
    case "components/inputs/field/number/input":
      return createFieldProductionStory(document, {
        id: "field-number",
        label: "Value",
        kind: "number",
        value: 42,
        description: "Numeric value",
      })
    case "components/inputs/field/integer/input":
      return createFieldProductionStory(document, {
        id: "field-integer",
        label: "Iterations",
        kind: "integer",
        value: 8,
        description: "Iteration count",
      })
    case "components/inputs/field/readonly/default":
      return createFieldProductionStory(document, {
        id: "field-readonly",
        label: "Result",
        kind: "readonly",
        value: "Output",
        description: "Read-only result",
      })
    case "components/inputs/field/number/slider":
      return createFieldProductionStory(document, {
        id: "field-slider",
        label: "Коэффициент",
        kind: "number",
        presentation: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.5,
      })
    case "components/inputs/field/boolean/switch":
      return createFieldProductionStory(document, {
        id: "field-boolean",
        label: "Enabled",
        kind: "boolean",
        presentation: "switch",
        value: true,
      })
    case "components/inputs/field/enum/default":
      return createFieldProductionStory(document, {
        id: "field-enum",
        label: "Mode",
        kind: "enum",
        value: "output",
        options: [
          {value: "input", label: "Input"},
          {value: "output", label: "Output"},
          {value: "viewport", label: "Viewport"},
        ],
      })
    case "components/inputs/field/vector/default":
      return createFieldProductionStory(document, {
        id: "field-vector",
        label: "Location",
        kind: "vector",
        value: [1, 2, 3],
        axes: ["X", "Y", "Z"],
      })
    case "components/inputs/field/rotation/default":
      return createFieldProductionStory(document, {
        id: "field-rotation",
        label: "Вращение",
        kind: "rotation",
        value: [0, 0, 0],
        axes: ["X", "Y", "Z"],
      })
    case "components/inputs/field/matrix/default":
      return createFieldProductionStory(document, {
        id: "field-matrix",
        label: "Transform",
        kind: "matrix",
        value: [[1, 0], [0, 1]],
      })
    case "components/inputs/field/reference/default":
      return createFieldProductionStory(document, {
        id: "field-reference",
        label: "Target",
        kind: "reference",
        value: {id: "output", label: "Output", kind: "view"},
      })
    case "components/inputs/field/collection/default":
      return createFieldProductionStory(document, {
        id: "field-collection",
        label: "Items",
        kind: "collection",
        selectedId: "output",
        items: [
          {id: "input", label: "Input"},
          {id: "output", label: "Output"},
          {id: "viewport", label: "Viewport"},
        ],
      })
    case "components/inputs/field/path/default":
      return createFieldProductionStory(document, {
        id: "field-path",
        label: "File",
        kind: "path",
        value: "/project/output.exr",
      })
    case "components/inputs/field/color/input":
      return createFieldProductionStory(document, {
        id: "field-color",
        label: "Color",
        kind: "color",
        value: {r: 0.2, g: 0.55, b: 0.8, a: 1},
      })
    case "components/inputs/number-input/basic/default":
      return createNumberInputProductionStory(document)
    case "components/inputs/integer-input/basic/value":
      return createIntegerInputProductionStory(document, {
        ...integerInputProductionStoryDefaultProps,
        title: "Integer value",
      })
    case "components/inputs/integer-input/basic/labeled":
      return createFieldProductionStory(document, {
        id: "integer-input-labeled",
        label: "Iterations",
        kind: "integer",
        value: 8,
      })
    case "components/inputs/integer-input/state/disabled":
      return createIntegerInputProductionStory(document, {
        ...integerInputProductionStoryDefaultProps,
        disabled: true,
        title: "Disabled integer",
      })
    case "components/inputs/integer-input/state/readonly":
      return createIntegerInputProductionStory(document, {
        ...integerInputProductionStoryDefaultProps,
        readOnly: true,
        title: "Read-only integer",
      })
    case "components/inputs/checkbox/state/checked":
      return createCheckboxProductionStory(document)
    case "components/inputs/checkbox/state/unchecked":
      return createCheckboxProductionStory(document, {
        ...checkboxProductionStoryDefaultProps,
        checked: false,
        title: "Unchecked checkbox",
      })
    case "components/inputs/switcher/state/on":
      return createSwitcherProductionStory(document)
    case "components/inputs/switcher/state/off":
      return createSwitcherProductionStory(document, {
        ...switcherProductionStoryDefaultProps,
        checked: false,
        title: "Switcher off",
      })
    case "components/inputs/slider-control/basic/default":
      return createSliderControlProductionStory(document)
    case "components/inputs/progress-checkbox/progress/default":
      return createProgressCheckboxProductionStory(document)
    case "components/inputs/enum-input/presentation/cycle":
      return createEnumInputProductionStory(document)
    case "components/inputs/vector-input/basic/default":
      return createVectorInputProductionStory(document)
    case "components/inputs/matrix-input/basic/default":
      return createMatrixInputProductionStory(document)
    case "components/inputs/reference-input/basic/default":
      return createReferenceInputProductionStory(document)
    case "components/inputs/path-input/value/path":
      return createPathInputProductionStory(document)
    case "components/inputs/path-input/value/empty":
      return createPathInputProductionStory(document, {
        ...pathInputProductionStoryDefaultProps,
        value: "",
      })
    case "components/inputs/path-input/state/disabled":
      return createPathInputProductionStory(document, {
        ...pathInputProductionStoryDefaultProps,
        disabled: true,
      })
    case "components/inputs/path-input/state/readonly":
      return createPathInputProductionStory(document, {
        ...pathInputProductionStoryDefaultProps,
        readOnly: true,
      })
    case "components/inputs/path-input/density/compact":
      return createPathInputProductionStory(document, {
        ...pathInputProductionStoryDefaultProps,
        density: "compact",
      })
    case "components/inputs/collection-input/value/selected":
      return createCollectionInputProductionStory(document)
    case "components/inputs/collection-input/value/empty":
      return createCollectionInputProductionStory(document, {
        ...collectionInputProductionStoryDefaultProps,
        selectedId: null,
        items: [],
      })
    case "components/inputs/collection-input/state/disabled":
      return createCollectionInputProductionStory(document, {
        ...collectionInputProductionStoryDefaultProps,
        disabled: true,
      })
    case "components/inputs/collection-input/state/readonly":
      return createCollectionInputProductionStory(document, {
        ...collectionInputProductionStoryDefaultProps,
        readOnly: true,
      })
    case "components/inputs/collection-input/density/compact":
      return createCollectionInputProductionStory(document, {
        ...collectionInputProductionStoryDefaultProps,
        density: "compact",
      })
    case "components/inputs/color-input/basic/color-input":
      return createColorInputProductionStory(document, {
        ...colorInputProductionStoryDefaultProps,
        presentation: "closed",
      })
    case "components/inputs/color-input/state/open":
      return createColorInputProductionStory(document, {
        ...colorInputProductionStoryDefaultProps,
        presentation: "open",
      })
    case "components/inputs/color-input/presentation/expanded":
      return createColorInputProductionStory(document, {
        ...colorInputProductionStoryDefaultProps,
        presentation: "expanded",
      })
    case "components/foundation/pane/variants/filled":
      return createPaneProductionStory(document)
    case "components/foundation/pane/variants/glass":
      return createPaneProductionStory(document, {
        content: "Panel content",
        variant: "transparent",
        title: "Glass pane",
      })
    case "components/foundation/pane/variants/outlined":
      return createPaneProductionStory(document, {
        content: "Panel content",
        variant: "outlined",
        title: "Outlined pane",
      })
    case "components/foundation/badge/basic/default":
      return createBadgeProductionStory(document)
    case "components/foundation/typography/variants/default":
      return createTypographyProductionStory(document)
    case "components/foundation/divider/variants/full-width":
      return createDividerProductionStory(document)
    case "components/foundation/divider/variants/inset":
      return createDividerProductionStory(document, {variant: "inset", title: "Inset divider"})
    case "components/foundation/divider/variants/middle":
      return createDividerProductionStory(document, {variant: "middle", title: "Middle divider"})
    case "hud/foundation/window/inventory/default":
      return createHudWindowProductionStory(document)
    case "hud/foundation/frame/inventory/default":
      return createHudFrameProductionStory(document)
    case "hud/foundation/timeline/inventory/default":
      return createTimelineProductionStory(document)
  }
  throw new Error(`DOM story route has no implementation: ${route}`)
}

function publishReadyState(
  route: string,
  descriptor: ReturnType<typeof uiStoryDescriptor>,
): void {
  document.documentElement.dataset.uiStorybookRoute = `/${route}`
  document.documentElement.dataset.uiStorybookStory = route
  document.documentElement.dataset.uiStorybookOwner = descriptor.category.id
  document.documentElement.dataset.uiStorybookComponent = descriptor.component.id
  document.documentElement.dataset.uiStorybookPackage = descriptor.owner.id
  document.documentElement.dataset.uiStorybookPanelCategory = "props"
}
