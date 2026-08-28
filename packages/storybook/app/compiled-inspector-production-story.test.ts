import {describe, expect, test} from "bun:test"
import {Event, createDocument, type HTMLButtonElement, type HTMLInputElement} from "@zavx0z/dom"
import {inspectorComponentCss} from "@ui/components/inspector"
import {createCompiledInspectorProductionStory} from "./compiled-inspector-production-story.tsx"

describe("compiled Inspector production story", () => {
  test("uses the final keyed/hook-controlled owner", () => {
    const mounted = createCompiledInspectorProductionStory(createDocument())
    const owner = mounted.story.element
    const search = owner.querySelector("input") as HTMLInputElement
    search.value = "events"
    search.dispatchEvent(new Event("input", {bubbles: true}))
    const events = owner.querySelector('[data-section-id="events"]')!
    expect(events.getAttributeNames().some(name => name.startsWith("data-z-"))).toBe(true)
    const eventCategory = [...owner.querySelectorAll("nav button")].find(button => button.textContent === "E") as HTMLButtonElement
    eventCategory.click()
    expect(eventCategory.getAttribute("aria-pressed")).toBe("true")
    expect(mounted.story.source.css).toBe(inspectorComponentCss)
    expect(mounted.story.source.typescript).toContain("<Inspector")
    expect(mounted.story.source.typescript).toContain("useState")
    expect(mounted.story.source.typescript).toContain("inspectorComponentCss")
    expect(mounted.story.source.typescript).not.toContain("{...section}")
    expect(mounted.story.source.html).not.toContain('class="')
    mounted.story.dispose()
  })
})
