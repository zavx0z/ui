import {describe, expect, test} from "bun:test"
import * as dom from "./dom-story-navigation.ts"

describe("DOM-only Storybook navigation metadata", () => {
  test("owns route presentations without importing loaders", async () => {
    expect(dom.UI_STORY_ROUTE_TREE.leaves).toHaveLength(176)
    expect(dom.uiStoryDescriptor("")).toMatchObject({kind: "overview", route: ""})
    expect(dom.uiStoryDescriptor("dom/interfaces/html-element/title/default"))
      .toMatchObject({kind: "detail", apiName: "HTMLElement"})
    expect(dom.uiPrimaryRoute("components/inputs/color-input/state/open")).toBe("components/inputs")
    expect(dom.uiSecondaryRoute("components/inputs/color-input/state/open"))
      .toBe("components/inputs/color-input")
    expect(dom.uiDockRoute("hud/foundation/timeline/inventory/default"))
      .toBe("hud/foundation/timeline/inventory/default")
    expect(dom.uiDockItems("elements/primitives/img").map(({route}) => route)).toEqual([
      "elements/primitives/img/fit/cover",
      "elements/primitives/img/fit/contain",
    ])
    const interfaces = dom.uiSecondaryItems("dom/interfaces")
    expect(interfaces).toHaveLength(43)
    expect(interfaces.map(({route}) => route)).toContain("dom/interfaces/html-image-element")
    expect(interfaces.map(({route}) => route)).toContain("dom/interfaces/html-label-element")
    expect(interfaces.map(({route}) => route)).toContain("dom/interfaces/html-table-cell-element")
    expect(interfaces.map(({route}) => route)).toContain("dom/interfaces/pointer-event")
    const source = await Bun.file(new URL("./dom-story-navigation.ts", import.meta.url)).text()
    expect(source).not.toContain("loadUiStory")
    expect(source).not.toContain("COMPONENT_STORIES")
    expect(source).not.toContain("ELEMENT_STORIES")
    expect(source).not.toContain("import(")
    expect(source).toContain('from "@zavx0z/storybook/workbench"')
    expect(source).not.toContain("@zavx0z/storybook/dom/")
    expect(source).not.toContain("@layout/")
    expect(source).not.toContain("@ui/elements")
  })
})
