import {describe, expect, test} from "bun:test"
import {Color, type TextMaterial} from "@engine/core"
import type {UiSurface} from "@layout/core/surface"
import {
  createCodeTokenMaterials,
  normalizeCodeTokensForLine,
  renderCodeTextRuns,
  renderCodeTokenizedLine,
} from "./code.ts"

describe("normalizeCodeTokensForLine", () => {
  test("sorts, clamps and removes invalid ranges", () => {
    const tokens = normalizeCodeTokensForLine("abcdef", [
      {s: 4, e: 6, c: "z"},
      {s: 0, e: 2, c: "a"},
      {s: 1, e: 5, c: "b", fg: "#abcdef", bg: "#123456"},
      {s: -2, e: 1, c: "n"},
      {s: 6, e: 10, c: "out"},
      {s: 3, e: 3, c: "empty"},
      {s: Number.NaN, e: 4, c: "bad"},
    ])

    expect(tokens).toEqual([
      {s: 0, e: 1, c: "n"},
      {s: 1, e: 2, c: "a"},
      {s: 2, e: 5, c: "b", fg: "#abcdef", bg: "#123456"},
      {s: 5, e: 6, c: "z"},
    ])
  })

  test("prefers a longer token over punctuation at the same start", () => {
    const tokens = normalizeCodeTokensForLine("brane.stateCount", [
      {s: 5, e: 6, c: "p"},
      {s: 5, e: 16, c: "t", fg: "#c77dbb"},
    ])

    expect(tokens).toEqual([
      {s: 5, e: 16, c: "t", fg: "#c77dbb"},
    ])
  })
})

describe("renderCodeTextRuns", () => {
  test("keeps tab characters out of drawText", () => {
    const calls: Array<{text: string; x: number; maxWidthPx: number | undefined}> = []
    const surface = {
      drawText: (text: string, x: number, _y: number, options: {maxWidthPx?: number}) => {
        calls.push({text, x, maxWidthPx: options.maxWidthPx})
        return 0
      },
      measureText: (text: string) => text.length * 10,
    } as unknown as UiSurface

    renderCodeTextRuns({
      surface,
      text: "\t\tready",
      startX: 100,
      y: 20,
      fontPx: 13,
      material: {} as TextMaterial,
      maxPx: 400,
      columnX: (column) => [0, 20, 40, 50, 60, 70, 80, 90][column] ?? column * 10,
    })

    expect(calls).toEqual([{text: "ready", x: 140, maxWidthPx: 360}])
  })
})

describe("renderCodeTokenizedLine", () => {
  test("places color swatches in the whitespace before the token", () => {
    const backgrounds: Array<{x: number; w: number; slotX: number; slotW: number}> = []
    const surface = {
      drawText: () => 0,
      measureText: (text: string) => text.length * 10,
    } as unknown as UiSurface

    renderCodeTokenizedLine({
      surface,
      text: "color: #fff;",
      tokens: [{s: 7, e: 11, c: "n", bg: "#fff"}],
      startX: 100,
      y: 20,
      fontPx: 13,
      maxPx: 400,
      materials: new Map(),
      fallbackMaterial: {} as TextMaterial,
      drawTokenBackground: (x, _y, w, _h, _bg, slotX, slotW) => backgrounds.push({x, w, slotX, slotW}),
    })

    expect(backgrounds).toEqual([{x: 170, w: 40, slotX: 160, slotW: 10}])
  })

  test("uses an explicit foreground before the category material", () => {
    const materials = createCodeTokenMaterials()
    const drawn: TextMaterial[] = []
    const surface = {
      drawText: (_text: string, _x: number, _y: number, options: {material: TextMaterial}) => {
        drawn.push(options.material)
        return 0
      },
      measureText: (text: string) => text.length * 10,
    } as unknown as UiSurface

    renderCodeTokenizedLine({
      surface,
      text: "const",
      tokens: [{s: 0, e: 5, c: "k", fg: "#123abc"}],
      startX: 0,
      y: 0,
      fontPx: 13,
      maxPx: 100,
      materials,
      fallbackMaterial: {} as TextMaterial,
    })

    expect(drawn[0]?.color).toEqual(new Color("#123abc"))
    expect(drawn[0]).not.toBe(materials.get("k"))
  })
})
