import {afterEach, describe, expect, test} from "bun:test"
import {
  copySelectedText,
  orderedTextSelection,
  readClipboardText,
  textFromSelection,
  wordRangeAt,
  writeClipboardText,
} from "./text-selection.ts"

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard")
const originalWarn = console.warn

afterEach(() => {
  if (clipboardDescriptor === undefined) delete (navigator as {clipboard?: Clipboard}).clipboard
  else Object.defineProperty(navigator, "clipboard", clipboardDescriptor)
  console.warn = originalWarn
})

describe("text selection helpers", () => {
  test("orders a reversed selection", () => {
    expect(orderedTextSelection({line: 2, col: 1}, {line: 0, col: 3})).toEqual({
      start: {line: 0, col: 3},
      end: {line: 2, col: 1},
    })
  })

  test("extracts selected text across lines", () => {
    expect(textFromSelection(["alpha", "beta", "gamma"], {line: 0, col: 2}, {line: 1, col: 2})).toBe("pha\nbe")
  })

  test("detects unicode word ranges", () => {
    expect(wordRangeAt("// русский комментарий", 5)).toEqual({start: 3, end: 10})
  })

  test("does not access the clipboard without a selection", async () => {
    let writes = 0
    installClipboard({
      writeText: async () => {
        writes++
      },
    })

    expect(await copySelectedText({lines: ["alpha"], anchor: null, focus: null})).toBeFalse()
    expect(writes).toBe(0)
  })

  test("returns safe results when clipboard access fails", async () => {
    const warnings: unknown[][] = []
    console.warn = (...values: unknown[]) => warnings.push(values)
    installClipboard({
      readText: async () => { throw new Error("read denied") },
      writeText: async () => { throw new Error("write denied") },
    })

    expect(await readClipboardText("read selection")).toBeNull()
    expect(await writeClipboardText("alpha", "write selection")).toBeFalse()
    expect(warnings.map((values) => values[0])).toEqual([
      "read selection failed:",
      "write selection failed:",
    ])
  })
})

function installClipboard(clipboard: Partial<Clipboard>): void {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  })
}
