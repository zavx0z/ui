import {describe, expect, test} from "bun:test"
import {Color} from "@engine/core"
import {UiSurface, Z} from "@layout/core/surface"
import {rgba8ToColor, uiTheme} from "./theme-reference.ts"
import {
  statusBar,
  statusBarMetrics,
  statusBarText,
  type StatusBarItem,
} from "./status-bar.ts"

type RoundedRectCall = Parameters<UiSurface["drawRoundedRect"]>
type TextCall = Parameters<UiSurface["drawText"]>

class StatusBarSurface extends UiSurface {
  readonly roundedRects: RoundedRectCall[] = []
  readonly texts: TextCall[] = []

  override drawRoundedRect(...args: RoundedRectCall): void { this.roundedRects.push(args) }
  override drawText(...args: TextCall): number { this.texts.push(args); return this.measureText(args[0], args[3].fontPx) }
  override measureText(value: string, fontPx: number): number { return value.length * fontPx * 0.5 }
  override textTopForVisualCenter(_value: string, centerY: number, fontPx: number): number {
    return centerY - fontPx / 2
  }
  protected override render(): void {}
}

const referenceItems: readonly StatusBarItem[] = Object.freeze([
  {id: "collection", text: "Collection"},
  {id: "object", text: "Cube"},
  {id: "vertices", text: "Verts:8"},
  {id: "faces", text: "Faces:6"},
  {id: "triangles", text: "Tris:12"},
  {id: "objects", text: "Objects:1/3"},
  {id: "version", text: "4.5.5"},
])

describe("StatusBar element", () => {
  test("matches the measured lower chrome and right-aligned literal run", () => {
    const surface = new StatusBarSurface()
    const before = structuredClone(referenceItems)
    statusBar(surface, 0, 10, 500, statusBarMetrics.height, {
      end: referenceItems,
    })

    expect(referenceItems).toEqual(before)
    expect(statusBarText(referenceItems)).toBe(
      "Collection | Cube | Verts:8 | Faces:6 | Tris:12 | Objects:1/3 | 4.5.5",
    )
    expect(surface.roundedRects[0]).toMatchObject([0, 10, 500, 24, {
      radius: 0,
      fill: rgba8ToColor(uiTheme.statusBar.back),
      border: null,
      borderWidth: 0,
    }])
    expect(surface.roundedRects[1]).toMatchObject([0, 10, 500, 2, {
      radius: 0,
      fill: rgba8ToColor(uiTheme.statusBar.top),
      border: null,
    }])
    expect(surface.roundedRects).toHaveLength(2)

    const main = surface.texts.filter((call) => call[3].z === Z.TEXT)
    expect(main.map(([text]) => text).join("")).toBe(statusBarText(referenceItems))
    expect(main.at(-1)?.[1]! + surface.measureText("4.5.5", statusBarMetrics.fontPx)).toBe(488)
    expect(main.every((call) => call[3].fontPx === 11)).toBeTrue()
    expect(main[0]?.[3].material.color).toEqual(rgba8ToColor(uiTheme.statusBar.text))
    const shadows = surface.texts.filter((call) => call[3].z === Z.TEXT - 0.01)
    expect(shadows).toHaveLength(main.length)
    expect(shadows[0]?.[2]).toBe((main[0]?.[2] ?? 0) + 1)
    expect(shadows[0]?.[3].material.color).toEqual(rgba8ToColor(uiTheme.statusBar.textShadow))
  })

  test("supports highlighted start content without window chrome", () => {
    const surface = new StatusBarSurface()
    statusBar(surface, 5, 6, 240, 24, {
      start: [{id: "mode", text: "Готово", highlighted: true}],
      end: [{id: "version", text: "1.0.0"}],
    })
    expect(surface.roundedRects).toHaveLength(2)
    expect(surface.roundedRects[0]?.[4].radius).toBe(0)
    const main = surface.texts.filter((call) => call[3].z === Z.TEXT)
    expect(main.map(([text]) => text)).toEqual(["Готово", "1.0.0"])
    expect(main[0]?.[3].material.color).toEqual(rgba8ToColor(uiTheme.statusBar.textHighlight))
    expect(main[1]?.[3].material.color).toEqual(rgba8ToColor(uiTheme.statusBar.text))
  })

  test("renders only chrome for empty or zero-width content", () => {
    const surface = new StatusBarSurface()
    statusBar(surface, 0, 0, 120, 24)
    expect(surface.roundedRects).toHaveLength(2)
    expect(surface.texts).toEqual([])
    statusBar(surface, 0, 0, 0, 24, {end: referenceItems})
    expect(surface.roundedRects).toHaveLength(2)
  })

  test("applies caller CSS-like style after its status defaults", () => {
    const surface = new StatusBarSurface()
    const fill = new Color(0.1, 0.2, 0.3, 1)
    const border = new Color(0.4, 0.5, 0.6, 1)
    const text = new Color(0.7, 0.8, 0.9, 1)

    statusBar(surface, 5, 6, 240, 24, {
      start: [{id: "mode", text: "Готово", highlighted: true}],
      style: {
        background: fill,
        borderColor: border,
        borderRadius: 4,
        borderWidth: 3,
        color: text,
        fontSize: 13,
        opacity: 0.5,
        paddingX: 7,
        zIndex: 8,
      },
    })

    expect(surface.roundedRects[0]?.[4]).toMatchObject({radius: 4, fill, opacity: 0.5, z: 8})
    expect(surface.roundedRects[1]).toMatchObject([5, 6, 240, 3, {fill: border, opacity: 0.5, z: 8.02}])
    const main = surface.texts.filter((call) => call[3].z === 8.1)
    expect(main).toHaveLength(1)
    expect(main[0]?.[1]).toBe(12)
    expect(main[0]?.[3]).toMatchObject({fontPx: 13, material: {color: text}})
  })

  test("plans start, end and token sibling slots through Flex", async () => {
    const source = await Bun.file(new URL("./status-bar.ts", import.meta.url)).text()
    expect(source).toContain('import {flexRow} from "@layout/core/flex"')
    expect(source).toContain("allocateStatusBarTokens")
    expect(source).not.toContain("let cursor = left")
  })
})
