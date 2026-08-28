import {describe, expect, test} from "bun:test"
import {
  DOM_INTERFACE_STORY_ROUTES,
  UI_DOM_STORY_ROUTES,
} from "./dom-routes.ts"

describe("DOM Storybook route boundary", () => {
  test("dispatches only migrated exact leaves to the document pipeline", async () => {
    const bootstrap = await Bun.file(new URL("./bootstrap.ts", import.meta.url)).text()
    const entry = await Bun.file(new URL("./dom-entry.ts", import.meta.url)).text()
    const registry = await Bun.file(
      new URL("./server/page-registry.ts", import.meta.url),
    ).text()

    expect(UI_DOM_STORY_ROUTES).toContain("components/data/inspector/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/primitives")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/node/hierarchy/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/html-element/title/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/html-select-element/selection/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/document/tree/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/html-image-element/attributes/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/html-label-element/control/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/html-table-cell-element/cell/default")
    expect(UI_DOM_STORY_ROUTES).toContain("dom/interfaces/pointer-event/samples/default")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/primitives/div/scroll/both")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/style/css/flex/default")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/events/pointer/state/click")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/primitives/popover/state/open")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/primitives/select/state/flipped")
    expect(UI_DOM_STORY_ROUTES).toContain("elements/primitives/img/fit/cover")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/button/icon/svg")
    expect(UI_DOM_STORY_ROUTES).toContain("components/data/code-editor/state/read-only")
    expect(UI_DOM_STORY_ROUTES).toContain("components/data/list/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/data/table/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/button/basic/contained")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/button/sizes/large")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/button/color/error")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/button/icon-label/right")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/text-field/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/control-group/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/collection-input/value/selected")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/collection-input/density/compact")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/enum-input/presentation/cycle")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/text/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/number/input")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/integer/input")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/readonly/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/vector/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/field/color/input")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/integer-input/state/readonly")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/number-input/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/checkbox/state/checked")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/switcher/state/on")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/slider-control/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/progress-checkbox/progress/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/vector-input/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/matrix-input/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/path-input/value/path")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/path-input/density/compact")
    expect(UI_DOM_STORY_ROUTES).toContain("components/inputs/reference-input/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/pane/variants/filled")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/badge/basic/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/typography/variants/default")
    expect(UI_DOM_STORY_ROUTES).toContain("components/foundation/divider/variants/middle")
    expect(UI_DOM_STORY_ROUTES).toContain("hud/foundation/window/inventory/default")
    expect(UI_DOM_STORY_ROUTES).toContain("hud/foundation/timeline/inventory/default")
    expect(bootstrap).toContain('import("./dom-entry.ts")')
    expect(bootstrap).not.toContain('import("./entry.ts")')
    expect(registry).toContain('"../bootstrap.ts"')
    expect(entry).toContain('from "@zavx0z/dom"')
    expect(entry).toContain('from "@zavx0z/renderer-browser"')
    expect(entry).toContain('from "@zavx0z/storybook/workbench"')
    expect(entry).toContain('from "./production-component-stories.ts"')
    expect(entry).toContain('from "./compiled-inspector-production-story.tsx"')
    expect(entry).toContain('from "./compiled-code-editor-production-story.tsx"')
    expect(entry).toContain('from "./dom-interface-story.ts"')
    expect(entry).toContain('from "./element-dom-story.ts"')
    expect(entry).toContain('from "./popover-dom-story.ts"')
    expect(entry).toContain('from "./image-dom-story.ts"')
    expect(entry).toContain('from "./aggregate-overview-story.ts"')
    expect(entry).toContain('from "./route-style.ts"')
    expect(entry).toContain("createDocumentCanvasRuntime")
    expect(entry).toContain("createAggregateOverviewStory")
    for (const removedReplica of [
      "../../components/dom/button-story.ts",
      "../../components/dom/text-field-story.ts",
      "../../components/dom/foundation-stories.ts",
      "../../components/dom/hud-stories.ts",
      "../../components/dom/native-control-stories.ts",
      "../../components/dom/field-stories.ts",
      "../../components/dom/advanced-native-control-stories.ts",
      "../../components/dom/select-story.ts",
      "../../components/dom/numeric-composite-stories.ts",
      "../../components/dom/data-stories.ts",
      "../../components/dom/resource-input-stories.ts",
      "../../components/dom/color-stories.ts",
      "../../components/dom/inspector-story.ts",
      "../../components/dom/code-editor-story.ts",
      "./button-icon-dom-story.ts",
      "./enum-dom-story.ts",
    ]) expect(entry).not.toContain(removedReplica)
    expect(entry).toContain('dataset.uiStorybookPipeline = "dom-webgpu"')
    for (const forbidden of ["UiSurface", "UiRuntime", "@layout/core", "@ui/elements", "@ui/components/dom/"]) {
      expect(entry).not.toContain(forbidden)
    }
    expect(DOM_INTERFACE_STORY_ROUTES).toHaveLength(43)
    expect(UI_DOM_STORY_ROUTES).toHaveLength(391)
  })

  test("keeps one persistent Router, Document, Workbench, runtime and canvas", async () => {
    const entry = await Bun.file(new URL("./dom-entry.ts", import.meta.url)).text()

    expect(entry.match(/new StorybookRouteTreeRouter/gu)).toHaveLength(1)
    expect(entry.match(/createDocument\(\)/gu)).toHaveLength(1)
    expect(entry.match(/createStorybookDomWorkbench\(/gu)).toHaveLength(1)
    expect(entry.match(/createDocumentCanvasRuntime\(/gu)).toHaveLength(1)
    expect(entry).toContain("router.go(target)")
    expect(entry).toContain("router.subscribe((node)")
    expect(entry).toContain("applyRoute(node.path)")
    expect(entry).toContain('workbench.update("preview.node", story.element)')
    expect(entry).toContain("disposeStory(previous)")
    expect(entry).toContain("revision !== routeRevision")
    expect(entry).not.toMatch(/window\.location\.(?:assign|replace|reload)|location\.href|location\.reload|window\.location\s*=/u)
    expect(entry).not.toContain("document.location")
  })

  test("renders overview aggregates without selecting hidden secondary or scenario leaves", async () => {
    const entry = await Bun.file(new URL("./dom-entry.ts", import.meta.url)).text()
    const aggregate = await Bun.file(new URL("./aggregate-overview-story.ts", import.meta.url)).text()

    expect(entry).toContain("planUiOverview(route)")
    expect(entry).toContain("representativeRoute")
    expect(entry).toContain('descriptor.kind === "detail"')
    expect(entry).toContain(': null,')
    expect(aggregate).toContain("preview.appendChild(child.element)")
    expect(aggregate).toContain("child.source.typescript")
    expect(aggregate).not.toContain('document.createElement("a")')
    expect(aggregate).not.toContain('document.createElement("ul")')
  })

  test("declares each exact new runtime owner", async () => {
    const manifest = await Bun.file(new URL("../package.json", import.meta.url)).json() as {
      dependencies: Record<string, string>
    }
    expect(manifest.dependencies).toMatchObject({
      "@zavx0z/dom": "link:@zavx0z/dom",
      "@zavx0z/renderer": "link:@zavx0z/renderer",
      "@zavx0z/renderer-browser": "link:@zavx0z/renderer-browser",
      "@zavx0z/renderer-webgpu": "link:@zavx0z/renderer-webgpu",
      "@zavx0z/storybook": "link:@zavx0z/storybook",
      "@ui/components": "workspace:*",
    })
  })
})
