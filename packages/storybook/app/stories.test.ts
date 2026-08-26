import {describe, expect, test} from "bun:test"
import {isUiAggregateStoryModule} from "./aggregate.ts"
import {
  UI_STORY_ROUTE_TREE,
  loadUiStory,
  uiDockItems,
  uiDockRoute,
  uiPrimaryItems,
  uiPrimaryRoute,
  uiSecondaryItems,
  uiSecondaryRoute,
  uiStoryDescriptor,
} from "./stories.ts"

describe("UI Storybook route presentations", () => {
  test("loads real child stories for category, component and section overviews", async () => {
    for (const [route, count] of [
      ["", 9],
      ["elements/primitives", 9],
      ["elements/primitives/div", 3],
      ["elements/primitives/div/scroll", 3],
      ["components/foundation", 4],
      ["components/foundation/button", 5],
      ["components/foundation/button/basic", 3],
    ] as const) {
      const descriptor = uiStoryDescriptor(route)
      expect(descriptor.kind, route).toBe("overview")
      const module = await loadUiStory(route)
      expect(isUiAggregateStoryModule(module), route).toBeTrue()
      if (!isUiAggregateStoryModule(module)) throw new Error(`Expected aggregate module: ${route}`)
      expect(module.entries, route).toHaveLength(count)
      expect(module.entries.every(({module: child}) => typeof child.render === "function"), route).toBeTrue()
    }
    expect((await loadUiStory("components/foundation/button/basic")).source({}))
      .toContain("@ui/components/button")
    const foundation = await loadUiStory("components/foundation")
    if (!isUiAggregateStoryModule(foundation)) throw new Error("Expected Components foundation aggregate")
    expect(foundation.entries.map(({label}) => label)).not.toContain("Кнопка")
    const namespace = await loadUiStory("components")
    expect(isUiAggregateStoryModule(namespace)).toBeFalse()
    expect(namespace.source({})).toContain("sections")
  })

  test("maps groups, categories, components and flattened scenarios", () => {
    expect(uiPrimaryItems().map(({route}) => route)).toEqual([
      "elements/primitives",
      "elements/style",
      "elements/events",
      "components/foundation/button",
      "components/foundation",
      "components/inputs",
      "components/data",
      "hud/foundation",
    ])
    expect(uiSecondaryItems("components/foundation").map(({route}) => route)).toEqual([
      "components/foundation/pane",
      "components/foundation/badge",
      "components/foundation/typography",
      "components/foundation/divider",
    ])
    expect(uiSecondaryItems("components/foundation/button").map(({route}) => route)).toEqual([
      "components/foundation/button/basic",
      "components/foundation/button/icon",
      "components/foundation/button/icon-label",
      "components/foundation/button/sizes",
      "components/foundation/button/color",
    ])
    expect(uiDockItems("components/foundation")).toEqual([])
    expect(uiDockItems("components/foundation/button")).toEqual([])
    expect(uiDockItems("components/foundation/button/basic").map(({route}) => route)).toEqual([
      "components/foundation/button/basic/text",
      "components/foundation/button/basic/contained",
      "components/foundation/button/basic/outlined",
    ])
    expect(uiDockItems("elements/primitives/div").map(({route}) => route)).toEqual([
      "elements/primitives/div/basic/background",
      "elements/primitives/div/basic/border",
      "elements/primitives/div/basic/padding",
      "elements/primitives/div/basic/z-index",
      "elements/primitives/div/overflow/nested",
      "elements/primitives/div/scroll/vertical",
      "elements/primitives/div/scroll/horizontal",
      "elements/primitives/div/scroll/both",
    ])
    expect({
      primary: uiPrimaryRoute(""),
      secondary: uiSecondaryRoute(""),
      dock: uiDockRoute(""),
    }).toEqual({primary: "elements/primitives", secondary: "", dock: ""})
    expect({
      primary: uiPrimaryRoute("components/foundation/button"),
      secondary: uiSecondaryRoute("components/foundation/button"),
      dock: uiDockRoute("components/foundation/button"),
    }).toEqual({
      primary: "components/foundation/button",
      secondary: "components/foundation/button",
      dock: "",
    })
    expect({
      primary: uiPrimaryRoute("components/foundation/button/basic"),
      secondary: uiSecondaryRoute("components/foundation/button/basic"),
      dock: uiDockRoute("components/foundation/button/basic"),
    }).toEqual({
      primary: "components/foundation/button",
      secondary: "components/foundation/button/basic",
      dock: "",
    })
    expect(uiDockRoute("components/foundation/button/basic/contained"))
      .toBe("components/foundation/button/basic/contained")
  })

  test("fails closed for old and unknown paths", () => {
    expect(UI_STORY_ROUTE_TREE.find("components/button/basic/contained")).toBeUndefined()
    expect(UI_STORY_ROUTE_TREE.find("components/foundation/button/missing")).toBeUndefined()
    expect(() => uiStoryDescriptor("components/button")).toThrow("Unknown UI story")
  })
})
