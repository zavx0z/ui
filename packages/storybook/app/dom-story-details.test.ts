import {describe, expect, test} from "bun:test"
import details from "./dom-story-details.json"
import {DOM_INTERFACE_API_NAMES} from "./dom-interface-story.ts"
import {DOM_INTERFACE_STORY_ROUTES} from "./dom-routes.ts"
import {UI_STORY_ROUTE_TREE} from "./dom-story-navigation.ts"

describe("generated DOM-only Storybook detail metadata", () => {
  test("owns every exact route without carrying legacy loaders", () => {
    expect(details.version).toBe(1)
    expect(details.details).toHaveLength(176)
    expect(details.details.map(({route}) => route)).toEqual([...UI_STORY_ROUTE_TREE.leaves])
    expect(new Set(details.details.map(({route}) => route)).size).toBe(176)
    expect(details.details.every(({title, apiName}) => title.length > 0 && apiName.length > 0)).toBeTrue()
    expect(JSON.stringify(details)).not.toContain("load")
  })

  test("declares every implemented DOM runtime interface exactly once", () => {
    const interfaces = details.details.filter(({route}) => route.startsWith("dom/interfaces/"))
    expect(interfaces).toHaveLength(43)
    expect(new Set(interfaces.map(({apiName}) => apiName)).size).toBe(43)
    expect([...interfaces.map(({apiName}) => apiName)].sort())
      .toEqual([...DOM_INTERFACE_API_NAMES].sort())
    expect([...interfaces.map(({route}) => route)].sort())
      .toEqual([...DOM_INTERFACE_STORY_ROUTES].sort())
  })
})
