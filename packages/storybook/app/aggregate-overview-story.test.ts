import {describe, expect, test} from "bun:test"
import {createDocument} from "@zavx0z/dom"
import {
  createButtonProductionStory,
  createPaneProductionStory,
  productionComponentStoryCss,
} from "./production-component-stories.ts"
import {
  aggregateOverviewStoryCss,
  createAggregateOverviewStory,
} from "./aggregate-overview-story.ts"

describe("aggregate overview production previews", () => {
  test("mounts one real production root for every immediate child", async () => {
    const document = createDocument()
    const css = `${productionComponentStoryCss}\n${aggregateOverviewStoryCss}`
    const story = await createAggregateOverviewStory(document, {
      title: "Основные · Обзор",
      route: "components/foundation",
      items: [
        {label: "Панель", route: "components/foundation/pane", representativeRoute: "components/foundation/pane/variants/filled"},
        {label: "Кнопка", route: "components/foundation/button", representativeRoute: "components/foundation/button/basic/contained"},
      ],
      css,
      async load(route) {
        return route.includes("/pane/")
          ? createPaneProductionStory(document).story
          : createButtonProductionStory(document).story
      },
    })

    expect(story.element.querySelectorAll(".ui-aggregate-overview__item")).toHaveLength(2)
    expect(story.element.querySelectorAll('[data-story-component="pane"]')).toHaveLength(1)
    expect(story.element.querySelectorAll('[data-story-component="button"]')).toHaveLength(1)
    expect(story.element.querySelector("ul")).toBeNull()
    expect(story.element.querySelector("a")).toBeNull()
    expect(story.element.textContent).not.toContain("components/foundation/")
    expect(story.source.typescript).toContain('from "@ui/components/pane"')
    expect(story.source.typescript).toContain('from "@ui/components/button"')
    expect(story.source.css).toBe(css)
    story.dispose()
  })
})
