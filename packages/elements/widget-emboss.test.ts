import {describe, expect, test} from "bun:test"
import {rgba8ToColor, uiTheme} from "./theme-reference.ts"
import {UiSurface, type UiSurface as UiSurfaceType, Z} from "@layout/core/surface"
import {drawWidgetEmboss} from "./widget-emboss.ts"

type RoundedRectCall = Parameters<UiSurfaceType["drawRoundedRect"]>

class RecordingSurface extends UiSurface {
  readonly roundedRects: RoundedRectCall[] = []
  override drawRoundedRect(...args: RoundedRectCall): void { this.roundedRects.push(args) }
  protected render(): void {}
}

describe("Blender widget emboss", () => {
  test("draws one shifted analytical bottom half and suppresses aligned-down cells", () => {
    const surface = new RecordingSurface()
    drawWidgetEmboss(surface, {x: 10, y: 20, width: 100, height: 22}, 4, true)
    expect(surface.roundedRects).toHaveLength(1)
    expect(surface.roundedRects[0]?.slice(0, 4)).toEqual([10, 21, 100, 22])
    expect(surface.roundedRects[0]?.[4]).toMatchObject({
      radius: 4,
      fill: rgba8ToColor(uiTheme.material.widgetEmboss),
      border: null,
      z: Z.ELEMENT - 0.01,
    })
    drawWidgetEmboss(surface, {x: 10, y: 20, width: 100, height: 22}, 4, false)
    expect(surface.roundedRects).toHaveLength(1)
  })
})
