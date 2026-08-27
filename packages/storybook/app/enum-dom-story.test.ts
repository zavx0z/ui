import {describe, expect, test} from "bun:test"
import {createDocument, HTMLInputElement, HTMLSelectElement} from "@zavx0z/dom"
import {ENUM_DOM_STORY_ROUTES} from "./dom-routes.ts"
import {createEnumDomStory, enumDomStoryCss} from "./enum-dom-story.ts"

describe("standard DOM EnumInput variants", () => {
  test("covers every migrated variant without retained menu callbacks", async () => {
    for (const route of ENUM_DOM_STORY_ROUTES) {
      const story = createEnumDomStory(createDocument(), route)
      expect(story.element.localName, route).toBe("section")
      expect(story.source.css, route).toBe(enumDomStoryCss)
      expect(story.source.typescript, route).toContain('from "@zavx0z/dom"')
    }
    const source = await Bun.file(new URL("./enum-dom-story.ts", import.meta.url)).text()
    for (const forbidden of ["@layout/core", "@ui/elements", "UiSurface", "../enum-input"]) {
      expect(source).not.toContain(forbidden)
    }
  })

  test("uses native select, radio and readonly semantic presentations", () => {
    const selected = createEnumDomStory(createDocument(), "components/inputs/enum-input/value/selected-description")
    expect(selected.element.querySelector("select")).toBeInstanceOf(HTMLSelectElement)
    expect((selected.element.querySelector("select") as HTMLSelectElement).value).toBe("output")

    const expanded = createEnumDomStory(createDocument(), "components/inputs/enum-input/presentation/expanded")
    expect(expanded.element.querySelectorAll('input[type="radio"]')).toHaveLength(3)
    const radios = [...expanded.element.querySelectorAll('input[type="radio"]')]
    expect(radios.find((input) => (input as HTMLInputElement).checked)).toBeInstanceOf(HTMLInputElement)

    const readonly = createEnumDomStory(createDocument(), "components/inputs/enum-input/state/readonly")
    expect(readonly.element.querySelector('[aria-readonly="true"]')?.textContent).toBe("Output")
  })

  test("keeps exceptional states explicit and observable", () => {
    const empty = createEnumDomStory(createDocument(), "components/inputs/enum-input/exception/no-items")
    expect(empty.element.querySelector("select")?.childNodes).toHaveLength(0)
    expect(empty.element.textContent).toContain("No items")
    const error = createEnumDomStory(createDocument(), "components/inputs/enum-input/exception/menu-error")
    expect(error.element.querySelector('[role="alert"]')?.textContent).toContain("error")
  })
})
