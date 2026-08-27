import {describe, expect, test} from "bun:test"
import {createDocument, HTMLHeadingElement, HTMLLIElement, HTMLUListElement} from "@zavx0z/dom"
import {createDomOverviewStory, domOverviewStoryCss} from "./dom-overview-story.ts"

describe("DOM Storybook overview presentation", () => {
  test("builds one semantic overview without loading a hidden descendant story", () => {
    const story = createDomOverviewStory(createDocument(), {
      title: "Ввод · Обзор",
      route: "components/inputs",
      items: [
        {label: "Поле", route: "components/inputs/field"},
        {label: "Слайдер", route: "components/inputs/slider-control"},
      ],
    })
    expect(story.element.querySelector("h2")).toBeInstanceOf(HTMLHeadingElement)
    expect(story.element.querySelector("ul")).toBeInstanceOf(HTMLUListElement)
    expect(story.element.querySelectorAll("li")).toHaveLength(2)
    expect(story.element.querySelector("li")).toBeInstanceOf(HTMLLIElement)
    expect(story.element.textContent).toContain("Семантических DOM-разделов: 2")
    expect(story.source.css).toBe(domOverviewStoryCss)
    expect(story.source.typescript).not.toContain("loadUiStory")
  })
})
