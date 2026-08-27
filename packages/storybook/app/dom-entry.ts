import {loadDocumentDefaultFont} from "@engine/core/default-font"
import {
  buttonStoryCss,
  buttonStoryDefaultArgs,
  createButtonStory,
} from "../../components/dom/button-story.ts"
import {
  createBadgeStory,
  createDividerStory,
  createPaneStory,
  createTypographyStory,
  foundationStoriesCss,
} from "../../components/dom/foundation-stories.ts"
import {
  INSPECTOR_STORY_ARGS_CHANGE_EVENT,
  createInspectorStory,
  type InspectorStoryArgsChange,
} from "../../components/dom/inspector-story.ts"
import {inspectorCss} from "@ui/components/inspector"
import {
  createTextFieldStory,
  textFieldStoryCss,
} from "../../components/dom/text-field-story.ts"
import {
  createCheckboxStory,
  createNumberInputStory,
  createSwitcherStory,
  nativeControlStoriesCss,
  numberInputStoryDefaultArgs,
} from "../../components/dom/native-control-stories.ts"
import {
  createControlGroupStory,
  createFieldStory,
  fieldStoriesCss,
} from "../../components/dom/field-stories.ts"
import {
  advancedNativeControlStoriesCss,
  createProgressCheckboxStory,
  createSliderControlStory,
} from "../../components/dom/advanced-native-control-stories.ts"
import {
  createListStory,
  createTableStory,
  dataStoriesCss,
} from "../../components/dom/data-stories.ts"
import {
  createSelectStory,
  selectStoryCss,
} from "../../components/dom/select-story.ts"
import {
  createMatrixStory,
  createVectorStory,
  numericCompositeStoriesCss,
  vectorStoryDefaultArgs,
} from "../../components/dom/numeric-composite-stories.ts"
import {
  createCodeEditorStory,
} from "../../components/dom/code-editor-story.ts"
import {codeEditorCss} from "@ui/components/code-editor"
import {
  collectionInputStoryDefaultArgs,
  createCollectionInputStory,
  createPathInputStory,
  createReferenceInputStory,
  pathInputStoryDefaultArgs,
  resourceInputStoriesCss,
} from "../../components/dom/resource-input-stories.ts"
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
  createEnumDomStory,
  enumDomStoryCss,
  isEnumDomStoryRoute,
} from "./enum-dom-story.ts"
import {
  createHudFrameStory,
  createHudTimelineStory,
  createHudWindowStory,
  hudStoriesCss,
} from "../../components/dom/hud-stories.ts"
import {
  buttonIconDomStoryCss,
  createButtonIconDomStory,
  isButtonIconDomStoryRoute,
} from "./button-icon-dom-story.ts"
import {
  colorFieldStoryDefaultArgs,
  colorInputClosedStoryDefaultArgs,
  colorInputExpandedStoryDefaultArgs,
  colorInputOpenStoryDefaultArgs,
  colorStoriesCss,
  createColorFieldStory,
  createColorInputStory,
} from "../../components/dom/color-stories.ts"
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
  createDomOverviewStory,
  domOverviewStoryCss,
} from "./dom-overview-story.ts"
import {
  createDocument,
  type CustomEvent as DomCustomEvent,
  type Document as SemanticDocument,
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
import {isUiDomStoryRoute, type UiDomStoryRoute} from "./dom-routes.ts"
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

const canvas = document.getElementById("ui-storybook-canvas")
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("UI Storybook canvas not found")

declare global {
  var __uiStorybookCapturePresentedFrame: (() => Promise<Blob | null>) | undefined
  var __uiStorybookLoadReferenceCatalog: (() => Promise<unknown>) | undefined
}

document.documentElement.dataset.uiStorybook = "starting"
document.documentElement.dataset.uiStorybookPage = "workbench"
document.documentElement.dataset.uiStorybookPipeline = "dom-webgpu"
globalThis.__uiStorybookLoadReferenceCatalog = async () => import("../reference-catalog.ts")
  .then(({loadStorybookReferenceCatalog}) => loadStorybookReferenceCatalog())

try {
  const router = new StorybookRouteTreeRouter(UI_STORY_ROUTE_TREE, {
    basePath: storybookPublicPath("ui", "/"),
  })
  if (!isUiDomStoryRoute(router.current.path)) {
    throw new Error(`DOM entry received an unmigrated route: ${router.current.path}`)
  }
  const route = router.current.path
  const descriptor = uiStoryDescriptor(route)
  const semanticDocument = createDocument()
  const {story, css: storyCss} = createDomRouteStory(route, semanticDocument)
  const catalogItems = uiPrimaryItems().map(({label, route: itemRoute}) => ({
    id: itemRoute,
    label,
    route: itemRoute,
  }))
  const secondaryItems = uiSecondaryItems(route).map(({label, route: itemRoute}) => ({
    id: itemRoute,
    label,
    route: itemRoute,
  }))
  const scenarioItems = uiDockItems(route).map(({route: itemRoute, label}) => ({
    id: itemRoute,
    label,
  }))
  const workbench = createStorybookDomWorkbench({
    document: semanticDocument,
    parent: semanticDocument,
    initial: {
      title: "UI Storybook",
      "catalog.label": "UI",
      "catalog.items": catalogItems,
      "catalog.active": presentActive(uiPrimaryRoute(route), catalogItems),
      "secondary.label": descriptor.category.label,
      "secondary.items": secondaryItems,
      "secondary.active": presentActive(uiSecondaryRoute(route), secondaryItems),
      "preview.label": descriptor.title,
      "preview.node": story.element,
      "scenarios.label": uiDockTitle(route),
      "scenarios.items": scenarioItems,
      "scenarios.active": presentActive(uiDockRoute(route), scenarioItems),
      "inspector.label": "Исходный код",
      "inspector.source": story.source,
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
    styleSheets: [storybookDomWorkbenchCss, storyCss],
    font,
    tooltipDelayMs: 500,
    distance: 600,
  })
  globalThis.__uiStorybookCapturePresentedFrame = () =>
    runtime.captureLastPresentedFramePng()
  let disposed = false
  const onStoryArgsChange = (event: unknown): void => {
    const detail = (event as DomCustomEvent<InspectorStoryArgsChange>).detail
    workbench.update("inspector.source", story.source)
    document.documentElement.dataset.uiStorybookArgs = JSON.stringify(detail.args)
    runtime.requestRender()
  }
  const onNavigate = (event: unknown): void => {
    const detail = (event as DomCustomEvent<{route: string}>).detail
    if (detail.route === route) return
    const target = storybookPublicPath("ui", `/${detail.route}`)
    window.location.assign(target)
  }
  const onScenario = (event: unknown): void => {
    const detail = (event as DomCustomEvent<{id: string}>).detail
    if (detail.id === route) {
      runtime.requestRender()
      return
    }
    window.location.assign(storybookPublicPath("ui", `/${detail.id}`))
  }

  workbench.element.addEventListener(INSPECTOR_STORY_ARGS_CHANGE_EVENT, onStoryArgsChange)
  workbench.element.addEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.navigate, onNavigate)
  workbench.element.addEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.scenario, onScenario)
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    workbench.element.removeEventListener(INSPECTOR_STORY_ARGS_CHANGE_EVENT, onStoryArgsChange)
    workbench.element.removeEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.navigate, onNavigate)
    workbench.element.removeEventListener(STORYBOOK_DOM_WORKBENCH_EVENTS.scenario, onScenario)
    if ("dispose" in story && typeof story.dispose === "function") story.dispose()
    workbench.dispose()
    runtime.dispose()
  }
  window.addEventListener("pagehide", dispose, {once: true})

  publishReadyState(route, descriptor)
  await waitForStorybookFrameBoundary()
  document.documentElement.dataset.uiStorybook = "ready"
} catch (error) {
  document.documentElement.dataset.uiStorybook = "error"
  document.documentElement.dataset.uiStorybookError = error instanceof Error
    ? error.message
    : String(error)
  throw error
}

function presentActive(
  candidate: string,
  items: readonly Readonly<{id: string}>[],
): string | null {
  return items.some(({id}) => id === candidate) ? candidate : null
}

function createDomRouteStory(route: UiDomStoryRoute, document: SemanticDocument) {
  if (isImageDomStoryRoute(route)) {
    return Object.freeze({story: createImageDomStory(document, route), css: imageDomStoryCss})
  }
  if (isPopoverDomStoryRoute(route)) {
    return Object.freeze({story: createPopoverDomStory(document, route), css: popoverDomStoryCss})
  }
  if (isButtonIconDomStoryRoute(route)) {
    return Object.freeze({story: createButtonIconDomStory(document, route), css: buttonIconDomStoryCss})
  }
  if (isEnumDomStoryRoute(route)) {
    return Object.freeze({story: createEnumDomStory(document, route), css: enumDomStoryCss})
  }
  if (isElementDomStoryRoute(route)) {
    return Object.freeze({story: createElementDomStory(document, route), css: elementDomStoryCss})
  }
  const descriptor = uiStoryDescriptor(route)
  if (descriptor.kind === "overview") {
    const dockItems = uiDockItems(route)
    const secondaryItems = uiSecondaryItems(route)
    const items = dockItems.length > 0
      ? dockItems
      : secondaryItems.length > 0
        ? secondaryItems
        : uiPrimaryItems()
    return Object.freeze({
      story: createDomOverviewStory(document, {
        title: descriptor.title,
        route,
        items: items.map(({label, route: itemRoute}) => ({label, route: itemRoute})),
      }),
      css: domOverviewStoryCss,
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
      return Object.freeze({story: createInspectorStory(document), css: inspectorCss})
    case "components/data/list/basic/default":
      return Object.freeze({story: createListStory(document), css: dataStoriesCss})
    case "components/data/table/basic/default":
      return Object.freeze({story: createTableStory(document), css: dataStoriesCss})
    case "components/data/code-editor/state/read-only":
      return Object.freeze({story: createCodeEditorStory(document), css: codeEditorCss})
    case "components/foundation/button/basic/contained":
      return Object.freeze({story: createButtonStory(document), css: buttonStoryCss})
    case "components/foundation/button/basic/text":
      return Object.freeze({
        story: createButtonStory(document, {...buttonStoryDefaultArgs, variant: "text", title: "Text button"}),
        css: buttonStoryCss,
      })
    case "components/foundation/button/basic/outlined":
      return Object.freeze({
        story: createButtonStory(document, {...buttonStoryDefaultArgs, variant: "outlined", title: "Outlined button"}),
        css: buttonStoryCss,
      })
    case "components/foundation/button/sizes/small":
      return Object.freeze({
        story: createButtonStory(document, {...buttonStoryDefaultArgs, size: "small", title: "Small button"}),
        css: buttonStoryCss,
      })
    case "components/foundation/button/sizes/medium":
      return Object.freeze({story: createButtonStory(document), css: buttonStoryCss})
    case "components/foundation/button/sizes/large":
      return Object.freeze({
        story: createButtonStory(document, {...buttonStoryDefaultArgs, size: "large", title: "Large button"}),
        css: buttonStoryCss,
      })
    case "components/foundation/button/color/primary":
    case "components/foundation/button/color/success":
    case "components/foundation/button/color/warning":
    case "components/foundation/button/color/error":
    case "components/foundation/button/color/neutral": {
      const tone = route.split("/").at(-1) as "primary" | "success" | "warning" | "error" | "neutral"
      return Object.freeze({
        story: createButtonStory(document, {...buttonStoryDefaultArgs, tone, title: `${tone} button`}),
        css: buttonStoryCss,
      })
    }
    case "components/inputs/text-field/basic/default":
      return Object.freeze({story: createTextFieldStory(document), css: textFieldStoryCss})
    case "components/inputs/control-group/basic/default":
      return Object.freeze({story: createControlGroupStory(document), css: fieldStoriesCss})
    case "components/inputs/field/text/default":
      return Object.freeze({story: createFieldStory(document), css: fieldStoriesCss})
    case "components/inputs/field/number/input":
      return Object.freeze({
        story: createFieldStory(document, {
          label: "Value",
          value: "42",
          type: "number",
          disabled: false,
          readOnly: false,
          title: "Numeric value",
        }),
        css: fieldStoriesCss,
      })
    case "components/inputs/field/integer/input":
      return Object.freeze({
        story: createFieldStory(document, {
          label: "Iterations",
          value: "8",
          type: "number",
          disabled: false,
          readOnly: false,
          title: "Iteration count",
        }),
        css: fieldStoriesCss,
      })
    case "components/inputs/field/readonly/default":
      return Object.freeze({
        story: createFieldStory(document, {
          label: "Result",
          value: "Output",
          type: "text",
          disabled: false,
          readOnly: true,
          title: "Read-only result",
        }),
        css: fieldStoriesCss,
      })
    case "components/inputs/field/number/slider":
      return Object.freeze({story: createSliderControlStory(document), css: advancedNativeControlStoriesCss})
    case "components/inputs/field/boolean/switch":
      return Object.freeze({story: createSwitcherStory(document), css: nativeControlStoriesCss})
    case "components/inputs/field/enum/default":
      return Object.freeze({story: createSelectStory(document), css: selectStoryCss})
    case "components/inputs/field/vector/default":
      return Object.freeze({story: createVectorStory(document), css: numericCompositeStoriesCss})
    case "components/inputs/field/rotation/default":
      return Object.freeze({
        story: createVectorStory(document, {
          ...vectorStoryDefaultArgs,
          title: "Rotation",
          fields: [
            {key: "x", label: "X", value: "0"},
            {key: "y", label: "Y", value: "0"},
            {key: "z", label: "Z", value: "0"},
          ],
        }),
        css: numericCompositeStoriesCss,
      })
    case "components/inputs/field/matrix/default":
      return Object.freeze({story: createMatrixStory(document), css: numericCompositeStoriesCss})
    case "components/inputs/field/reference/default":
      return Object.freeze({story: createReferenceInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/field/collection/default":
      return Object.freeze({story: createCollectionInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/field/path/default":
      return Object.freeze({story: createPathInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/field/color/input":
      return Object.freeze({
        story: createColorFieldStory(document, colorFieldStoryDefaultArgs),
        css: colorStoriesCss,
      })
    case "components/inputs/number-input/basic/default":
      return Object.freeze({story: createNumberInputStory(document), css: nativeControlStoriesCss})
    case "components/inputs/integer-input/basic/value":
      return Object.freeze({
        story: createNumberInputStory(document, {...numberInputStoryDefaultArgs, value: "8", title: "Integer value"}),
        css: nativeControlStoriesCss,
      })
    case "components/inputs/integer-input/basic/labeled":
      return Object.freeze({
        story: createFieldStory(document, {
          label: "Iterations",
          value: "8",
          type: "number",
          disabled: false,
          readOnly: false,
          title: "Iterations",
        }),
        css: fieldStoriesCss,
      })
    case "components/inputs/integer-input/state/disabled":
      return Object.freeze({
        story: createNumberInputStory(document, {...numberInputStoryDefaultArgs, value: "8", disabled: true, title: "Disabled integer"}),
        css: nativeControlStoriesCss,
      })
    case "components/inputs/integer-input/state/readonly":
      return Object.freeze({
        story: createNumberInputStory(document, {...numberInputStoryDefaultArgs, value: "8", readOnly: true, title: "Read-only integer"}),
        css: nativeControlStoriesCss,
      })
    case "components/inputs/checkbox/state/checked":
      return Object.freeze({story: createCheckboxStory(document), css: nativeControlStoriesCss})
    case "components/inputs/checkbox/state/unchecked":
      return Object.freeze({
        story: createCheckboxStory(document, {
          checked: false,
          disabled: false,
          title: "Unchecked checkbox",
        }),
        css: nativeControlStoriesCss,
      })
    case "components/inputs/switcher/state/on":
      return Object.freeze({story: createSwitcherStory(document), css: nativeControlStoriesCss})
    case "components/inputs/switcher/state/off":
      return Object.freeze({
        story: createSwitcherStory(document, {
          checked: false,
          disabled: false,
          title: "Switcher off",
        }),
        css: nativeControlStoriesCss,
      })
    case "components/inputs/slider-control/basic/default":
      return Object.freeze({
        story: createSliderControlStory(document),
        css: advancedNativeControlStoriesCss,
      })
    case "components/inputs/progress-checkbox/progress/default":
      return Object.freeze({
        story: createProgressCheckboxStory(document),
        css: advancedNativeControlStoriesCss,
      })
    case "components/inputs/enum-input/presentation/cycle":
      return Object.freeze({story: createSelectStory(document), css: selectStoryCss})
    case "components/inputs/vector-input/basic/default":
      return Object.freeze({story: createVectorStory(document), css: numericCompositeStoriesCss})
    case "components/inputs/matrix-input/basic/default":
      return Object.freeze({story: createMatrixStory(document), css: numericCompositeStoriesCss})
    case "components/inputs/reference-input/basic/default":
      return Object.freeze({story: createReferenceInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/path-input/value/path":
      return Object.freeze({story: createPathInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/path-input/value/empty":
      return Object.freeze({
        story: createPathInputStory(document, {...pathInputStoryDefaultArgs, value: ""}),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/path-input/state/disabled":
      return Object.freeze({
        story: createPathInputStory(document, {...pathInputStoryDefaultArgs, disabled: true}),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/path-input/state/readonly":
      return Object.freeze({
        story: createPathInputStory(document, {...pathInputStoryDefaultArgs, readOnly: true}),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/path-input/density/compact":
      return Object.freeze({
        story: createPathInputStory(document, {...pathInputStoryDefaultArgs, density: "compact"}),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/collection-input/value/selected":
      return Object.freeze({story: createCollectionInputStory(document), css: resourceInputStoriesCss})
    case "components/inputs/collection-input/value/empty":
      return Object.freeze({
        story: createCollectionInputStory(document, {
          ...collectionInputStoryDefaultArgs,
          selectedKey: null,
          items: [],
        }),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/collection-input/state/disabled":
      return Object.freeze({
        story: createCollectionInputStory(document, {
          ...collectionInputStoryDefaultArgs,
          disabled: true,
        }),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/collection-input/state/readonly":
      return Object.freeze({
        story: createCollectionInputStory(document, {
          ...collectionInputStoryDefaultArgs,
          readOnly: true,
        }),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/collection-input/density/compact":
      return Object.freeze({
        story: createCollectionInputStory(document, {
          ...collectionInputStoryDefaultArgs,
          density: "compact",
        }),
        css: resourceInputStoriesCss,
      })
    case "components/inputs/color-input/basic/color-input":
      return Object.freeze({
        story: createColorInputStory(document, colorInputClosedStoryDefaultArgs),
        css: colorStoriesCss,
      })
    case "components/inputs/color-input/state/open":
      return Object.freeze({
        story: createColorInputStory(document, colorInputOpenStoryDefaultArgs),
        css: colorStoriesCss,
      })
    case "components/inputs/color-input/presentation/expanded":
      return Object.freeze({
        story: createColorInputStory(document, colorInputExpandedStoryDefaultArgs),
        css: colorStoriesCss,
      })
    case "components/foundation/pane/variants/filled":
      return Object.freeze({story: createPaneStory(document), css: foundationStoriesCss})
    case "components/foundation/pane/variants/glass":
      return Object.freeze({
        story: createPaneStory(document, {label: "Panel content", variant: "glass", title: "Glass pane"}),
        css: foundationStoriesCss,
      })
    case "components/foundation/pane/variants/outlined":
      return Object.freeze({
        story: createPaneStory(document, {label: "Panel content", variant: "outlined", title: "Outlined pane"}),
        css: foundationStoriesCss,
      })
    case "components/foundation/badge/basic/default":
      return Object.freeze({story: createBadgeStory(document), css: foundationStoriesCss})
    case "components/foundation/typography/variants/default":
      return Object.freeze({story: createTypographyStory(document), css: foundationStoriesCss})
    case "components/foundation/divider/variants/full-width":
      return Object.freeze({story: createDividerStory(document), css: foundationStoriesCss})
    case "components/foundation/divider/variants/inset":
      return Object.freeze({
        story: createDividerStory(document, {variant: "inset", title: "Inset divider"}),
        css: foundationStoriesCss,
      })
    case "components/foundation/divider/variants/middle":
      return Object.freeze({
        story: createDividerStory(document, {variant: "middle", title: "Middle divider"}),
        css: foundationStoriesCss,
      })
    case "hud/foundation/window/inventory/default":
      return Object.freeze({story: createHudWindowStory(document), css: hudStoriesCss})
    case "hud/foundation/frame/inventory/default":
      return Object.freeze({story: createHudFrameStory(document), css: hudStoriesCss})
    case "hud/foundation/timeline/inventory/default":
      return Object.freeze({story: createHudTimelineStory(document), css: hudStoriesCss})
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
  document.documentElement.dataset.uiStorybookPanelCategory = "source"
}
