import {describe, expect, test} from "bun:test"
import {createDocument, HTMLButtonElement} from "@zavx0z/dom"
import {createButtonIconDomStory} from "./button-icon-dom-story.ts"

describe("DOM icon-label Button stories", () => {
  test("uses one standard button and reorders semantic span children", () => {
    const left = createButtonIconDomStory(createDocument(), "components/foundation/button/icon-label/left")
    const right = createButtonIconDomStory(createDocument(), "components/foundation/button/icon-label/right")
    expect(left.element).toBeInstanceOf(HTMLButtonElement)
    expect(right.element).toBeInstanceOf(HTMLButtonElement)
    expect(left.element.children[0]?.getAttribute("aria-hidden")).toBe("true")
    expect(right.element.children[1]?.getAttribute("aria-hidden")).toBe("true")
    expect(left.source.html).toContain("◆")
    expect(right.source.typescript).toContain("button.append(label, icon)")
  })
})
