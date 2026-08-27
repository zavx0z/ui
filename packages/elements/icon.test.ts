import {describe, expect, test} from "bun:test"
import {Color} from "@engine/core"
import {drawIcon} from "./icon.ts"
import {UiSurface} from "@layout/core/surface"

type ImageCall = Parameters<UiSurface["drawImage"]>

class RecordingSurface extends UiSurface {
  readonly images: ImageCall[] = []
  override drawImage(...args: ImageCall): void { this.images.push(args) }
  protected render(): void {}
}

describe("icon image tint", () => {
  test("forwards an optional generic tint without changing the neutral default", () => {
    const surface = new RecordingSurface()
    drawIcon(surface, "icon.svg", 1, 2, 12)
    expect(surface.images[0]![5]!.tint).toBeUndefined()

    const tint = new Color(0.25, 0.5, 0.75, 0.4)
    drawIcon(surface, "icon.svg", 1, 2, 12, {tint})
    expect(surface.images[1]![5]!.tint).toBe(tint)
  })

  test("applies caller style after legacy image options", () => {
    const surface = new RecordingSurface()
    const legacyTint = new Color(0.1, 0.2, 0.3, 1)
    const styleTint = new Color(0.7, 0.6, 0.5, 1)

    drawIcon(surface, "icon.svg", 1, 2, 12, {
      opacity: 0.2,
      tint: legacyTint,
      z: 3,
      style: {color: styleTint, opacity: 0.6, zIndex: 7},
    })

    expect(surface.images[0]?.[5]).toMatchObject({tint: styleTint, opacity: 0.6, z: 7})
  })
})
