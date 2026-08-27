import {describe, expect, test} from "bun:test"
import {Color} from "@engine/core"
import {UiSurface, type UiSurface as UiSurfaceType} from "@layout/core/surface"
import {rgba8ToColor, resolveScrollbarColors} from "./theme-reference.ts"
import {scrollbar} from "./scrollbar.ts"

type RoundedRectCall = Parameters<UiSurfaceType["drawRoundedRect"]>

class RecordingSurface extends UiSurface {
  readonly roundedRects: RoundedRectCall[] = []
  override drawRoundedRect(...args: RoundedRectCall): void { this.roundedRects.push(args) }
  protected render(): void {}
}

describe("Blender scrollbar material", () => {
  test("resolves transparent outlined track and exact idle/pressed thumb", () => {
    expect(resolveScrollbarColors(false)).toEqual({
      track: [0x22, 0x22, 0x22, 0x00],
      outline: [0x3d, 0x3d, 0x3d, 0xff],
      thumb: [0x54, 0x54, 0x54, 0xff],
    })
    expect(resolveScrollbarColors(true).thumb).toEqual([0x59, 0x59, 0x59, 0xff])
  })

  test("draws raw track and thumb without legacy palette or blue hover", () => {
    for (const pressed of [false, true]) {
      const surface = new RecordingSurface()
      scrollbar(surface, 0, 0, 100, {offset: 20, visible: 50, total: 100, trackWidth: 8, pressed})
      const colors = resolveScrollbarColors(pressed)
      expect(surface.roundedRects).toHaveLength(2)
      expect(surface.roundedRects[0]?.[4]).toMatchObject({
        fill: rgba8ToColor(colors.track),
        border: rgba8ToColor(colors.outline),
        borderWidth: 1,
      })
      expect(surface.roundedRects[1]?.[4]).toMatchObject({
        fill: rgba8ToColor(colors.thumb),
        border: rgba8ToColor(colors.outline),
        borderWidth: 1,
      })
    }
  })

  test("applies caller style after legacy scrollbar colors", () => {
    const surface = new RecordingSurface()
    const track = new Color(0.1, 0.2, 0.3, 1)
    const thumb = new Color(0.4, 0.5, 0.6, 1)
    const border = new Color(0.7, 0.8, 0.9, 1)

    scrollbar(surface, 0, 0, 100, {
      offset: 20,
      visible: 50,
      total: 100,
      trackColor: new Color(1, 0, 0, 1),
      thumbColor: new Color(0, 1, 0, 1),
      trackWidth: 8,
      style: {
        borderColor: border,
        borderRadius: 3,
        borderWidth: 2,
        opacity: 0.5,
        scrollbarColor: thumb,
        scrollbarTrackColor: track,
        scrollbarWidth: 10,
        zIndex: 7,
      },
    })

    expect(surface.roundedRects[0]?.[4]).toMatchObject({
      radius: 3,
      fill: track,
      border,
      borderWidth: 2,
      opacity: 0.5,
      z: 7,
    })
    expect(surface.roundedRects[1]?.[4]).toMatchObject({
      radius: 3,
      fill: thumb,
      border,
      borderWidth: 2,
      opacity: 0.5,
      z: 7.01,
    })
  })
})
