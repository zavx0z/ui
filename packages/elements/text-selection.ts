export type TextPosition = {
  line: number
  col: number
}

export type TextSelectionRange = {
  start: TextPosition
  end: TextPosition
}

export function compareTextPosition(a: TextPosition, b: TextPosition): number {
  if (a.line !== b.line) return a.line - b.line
  return a.col - b.col
}

export function sameTextPosition(a: TextPosition | null, b: TextPosition | null): boolean {
  if (a === null || b === null) return a === b
  return a.line === b.line && a.col === b.col
}

export function orderedTextSelection(anchor: TextPosition | null, focus: TextPosition | null): TextSelectionRange | null {
  if (anchor === null || focus === null) return null
  const order = compareTextPosition(anchor, focus)
  if (order === 0) return null
  return order < 0 ? {start: anchor, end: focus} : {start: focus, end: anchor}
}

export function textFromRange(lines: readonly string[], range: TextSelectionRange | null): string | null {
  if (range === null) return null
  const startLine = clampLine(range.start.line, lines.length)
  const endLine = clampLine(range.end.line, lines.length)
  if (startLine === endLine) {
    const line = lines[startLine] ?? ""
    return line.slice(clampColumn(range.start.col, line), clampColumn(range.end.col, line))
  }

  const parts: string[] = []
  const first = lines[startLine] ?? ""
  parts.push(first.slice(clampColumn(range.start.col, first)))
  for (let line = startLine + 1; line < endLine; line++) {
    parts.push(lines[line] ?? "")
  }
  const last = lines[endLine] ?? ""
  parts.push(last.slice(0, clampColumn(range.end.col, last)))
  return parts.join("\n")
}

export function textFromSelection(lines: readonly string[], anchor: TextPosition | null, focus: TextPosition | null): string | null {
  return textFromRange(lines, orderedTextSelection(anchor, focus))
}

export async function readClipboardText(label = "clipboard paste"): Promise<string | null> {
  try {
    return await navigator.clipboard.readText()
  } catch (error) {
    console.warn(`${label} failed:`, error)
    return null
  }
}

export async function writeClipboardText(text: string, label = "clipboard copy"): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.warn(`${label} failed:`, error)
    return false
  }
}

export async function copyTextSelectionOrFallback(options: {
  lines: readonly string[]
  anchor: TextPosition | null
  focus: TextPosition | null
  fallbackText: string
  label?: string
}): Promise<boolean> {
  return await writeClipboardText(
    textFromSelection(options.lines, options.anchor, options.focus) ?? options.fallbackText,
    options.label,
  )
}

export async function copySelectedText(options: {
  lines: readonly string[]
  anchor: TextPosition | null
  focus: TextPosition | null
  label?: string
}): Promise<boolean> {
  const selected = textFromSelection(options.lines, options.anchor, options.focus)
  if (selected === null) return false
  return await writeClipboardText(selected, options.label)
}

export function wordRangeAt(
  text: string,
  col: number,
  isWordChar: (character: string) => boolean = defaultWordCharacter,
): {start: number; end: number} | null {
  if (text.length === 0) return null
  let index = Math.max(0, Math.min(text.length - 1, Math.floor(col)))
  if (!isWordChar(text[index] ?? "") && index > 0 && isWordChar(text[index - 1]!)) index--
  if (!isWordChar(text[index] ?? "")) return null

  let start = index
  let end = index + 1
  while (start > 0 && isWordChar(text[start - 1]!)) start--
  while (end < text.length && isWordChar(text[end]!)) end++
  return {start, end}
}

function defaultWordCharacter(character: string): boolean {
  return /[\p{L}\p{N}_-]/u.test(character)
}

function clampLine(line: number, lineCount: number): number {
  if (lineCount <= 0) return 0
  if (!Number.isFinite(line)) return 0
  return Math.max(0, Math.min(lineCount - 1, Math.floor(line)))
}

function clampColumn(column: number, line: string): number {
  if (!Number.isFinite(column)) return 0
  return Math.max(0, Math.min(line.length, Math.floor(column)))
}
