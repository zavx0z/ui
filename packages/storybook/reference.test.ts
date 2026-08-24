import {describe, expect, test} from "bun:test"
import {defineStorybookReference, planStorybookComparison} from "./reference.ts"

describe("Storybook references", () => {
  test("does not load an image until the selected story requests it", async () => {
    let loads = 0
    const reference = defineStorybookReference({
      id: "number-input-default",
      label: "Number input reference",
      provenance: "UI 5.2.0 · exact capture",
      compatibility: "unverified",
      acceptance: "candidate",
      async load() {
        loads += 1
        return {url: "/ui/references/number-input.png", width: 640, height: 240, alt: "Number input"}
      },
    })

    expect(loads).toBe(0)
    const [first, second] = await Promise.all([reference.load(), reference.load()])
    expect(loads).toBe(1)
    expect(first).toBe(second)
  })

  test("chooses side-by-side for wide controls and top-to-bottom for tall controls", () => {
    const wide = planStorybookComparison({
      width: 1200,
      height: 600,
      subject: {width: 420, height: 80},
      reference: {width: 420, height: 80},
      gap: 12,
    })
    expect(wide.orientation).toBe("vertical")
    expect(wide.subject.w).toBeCloseTo(wide.reference.w)

    const tall = planStorybookComparison({
      width: 1200,
      height: 600,
      subject: {width: 180, height: 480},
      reference: {width: 180, height: 480},
      gap: 12,
    })
    expect(tall.orientation).toBe("horizontal")
    expect(tall.subject.h).toBeCloseTo(tall.reference.h)
  })
})
