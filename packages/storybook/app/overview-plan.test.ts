import {describe, expect, test} from "bun:test"
import {UI_DOM_STORY_ROUTES, type UiDomStoryRoute} from "./dom-routes.ts"
import {uiStoryDescriptor} from "./dom-story-navigation.ts"
import {planUiOverview} from "./overview-plan.ts"

describe("UI overview aggregate plan", () => {
  test("maps every overview child to one bounded real detail representative", () => {
    const overviews = UI_DOM_STORY_ROUTES.filter((route) => uiStoryDescriptor(route).kind === "overview")
    expect(overviews.length).toBeGreaterThan(100)

    for (const route of overviews) {
      const items = planUiOverview(route as UiDomStoryRoute)
      expect(items.length, route || "root").toBeGreaterThan(0)
      expect(new Set(items.map(({route: child}) => child)).size, route || "root").toBe(items.length)
      for (const item of items) {
        expect(uiStoryDescriptor(item.representativeRoute).kind, `${route} → ${item.route}`).toBe("detail")
        expect(
          item.representativeRoute === item.route || item.representativeRoute.startsWith(`${item.route}/`),
          `${route} → ${item.route} → ${item.representativeRoute}`,
        ).toBeTrue()
      }
    }
  })

  test("rejects detail routes as aggregate owners", () => {
    expect(() => planUiOverview("components/foundation/button/basic/contained"))
      .toThrow("is not an overview")
  })
})
