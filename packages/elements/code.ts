import {Color, TextMaterial} from "@engine/core"
import type {UiSurface} from "@layout/core/surface"
import type {Token} from "@zavx0z/highlighter"
import {syntaxTokens} from "./theme.ts"

export type CodeTokenMaterialMap = Map<string, TextMaterial>

export function createCodeTokenMaterials(): CodeTokenMaterialMap {
  const materials: CodeTokenMaterialMap = new Map()
  for (const [category, color] of Object.entries(syntaxTokens)) {
    materials.set(category, new TextMaterial({color}))
  }
  return materials
}

export type RenderCodeTokenLineOptions = {
  surface: UiSurface
  text: string
  tokens: readonly Token[]
  startX: number
  y: number
  fontPx: number
  letterSpacingPx?: number
  spaceAdvancePx?: number
  maxPx: number
  materials: CodeTokenMaterialMap
  fallbackMaterial: TextMaterial
  sliceStart?: number
  tokensNormalized?: boolean
  chunkWidth?: (startCol: number, endCol: number, text: string) => number
  chunkX?: (startCol: number) => number
  animOffsetFor?: (absoluteColumn: number) => number
  drawTokenBackground?: (x: number, y: number, w: number, h: number, bg: string, slotX: number, slotW: number) => void
}

export type RenderCodeTextRunsOptions = {
  surface: UiSurface
  text: string
  startX: number
  y: number
  fontPx: number
  material: TextMaterial
  maxPx: number
  letterSpacingPx?: number
  spaceAdvancePx?: number
  columnStart?: number
  sliceStart?: number
  columnX?: (col: number) => number
  animOffsetFor?: (absoluteColumn: number) => number
}

export function normalizeCodeTokensForLine(text: string, tokens: readonly Token[]): Token[] {
  const len = text.length
  const out: Token[] = []
  let cursor = 0

  for (const token of [...tokens].sort((a, b) => a.s - b.s || b.e - a.e)) {
    if (!Number.isFinite(token.s) || !Number.isFinite(token.e)) continue
    const rawStart = Math.floor(token.s)
    const rawEnd = Math.floor(token.e)
    const s = Math.max(cursor, Math.min(len, rawStart))
    const e = Math.max(s, Math.min(len, rawEnd))
    if (e <= s) continue

    const normalized: Token = {s, e, c: token.c}
    if (token.fg !== undefined) normalized.fg = token.fg
    if (token.bg !== undefined) normalized.bg = token.bg
    out.push(normalized)
    cursor = e
  }

  return out
}

export function renderCodeTokenizedLine(options: RenderCodeTokenLineOptions): void {
  let cursor = 0
  let cursorX = options.startX
  const sliceStart = options.sliceStart ?? 0

  const placeChunk = (chunkText: string, category: string, fg: string | undefined, bg: string | undefined, chunkColStart: number): void => {
    if (chunkText.length === 0) return
    const width = options.chunkWidth?.(chunkColStart, chunkColStart + chunkText.length, chunkText)
      ?? options.surface.measureText(chunkText, options.fontPx, options.letterSpacingPx, options.spaceAdvancePx)
    const chunkX = options.chunkX === undefined
      ? cursorX
      : options.startX + options.chunkX(chunkColStart)
    const offset = options.animOffsetFor?.(sliceStart + chunkColStart) ?? 0
    if (!Number.isFinite(offset)) {
      cursorX += width
      return
    }
    const drawX = chunkX + offset
    if (bg !== undefined && width > 0) {
      const slot = colorSwatchSlot(options, chunkColStart, drawX, offset)
      if (slot !== null) options.drawTokenBackground?.(drawX, options.y, width, options.fontPx + 2, bg, slot.x, slot.w)
    }
    renderCodeTextRuns({
      surface: options.surface,
      text: chunkText,
      startX: options.startX,
      y: options.y,
      fontPx: options.fontPx,
      material: materialForToken(options.materials, category, fg) ?? options.fallbackMaterial,
      maxPx: options.maxPx,
      columnStart: chunkColStart,
      sliceStart,
      ...(options.chunkX === undefined ? {} : {columnX: options.chunkX}),
      ...(options.animOffsetFor === undefined ? {} : {animOffsetFor: options.animOffsetFor}),
      ...(options.letterSpacingPx === undefined ? {} : {letterSpacingPx: options.letterSpacingPx}),
      ...(options.spaceAdvancePx === undefined ? {} : {spaceAdvancePx: options.spaceAdvancePx}),
    })
    cursorX += width
  }

  const sorted = options.tokensNormalized === true
    ? options.tokens
    : normalizeCodeTokensForLine(options.text, options.tokens)
  for (const token of sorted) {
    if (token.s > cursor) placeChunk(options.text.slice(cursor, token.s), "d", undefined, undefined, cursor)
    placeChunk(options.text.slice(token.s, token.e), token.c, token.fg, token.bg, token.s)
    cursor = token.e
  }
  if (cursor < options.text.length) placeChunk(options.text.slice(cursor), "d", undefined, undefined, cursor)
}

export function renderCodeTextRuns(options: RenderCodeTextRunsOptions): void {
  const columnStart = options.columnStart ?? 0
  const sliceStart = options.sliceStart ?? 0
  let runStart: number | null = null

  const flush = (end: number): void => {
    if (runStart === null) return
    const runText = options.text.slice(runStart, end)
    if (runText.trim().length === 0) {
      runStart = null
      return
    }
    const runColumn = columnStart + runStart
    const runX = options.columnX === undefined
      ? options.startX + options.surface.measureText(options.text.slice(0, runStart), options.fontPx, options.letterSpacingPx, options.spaceAdvancePx)
      : options.startX + options.columnX(runColumn)
    const offset = options.animOffsetFor?.(sliceStart + runColumn) ?? 0
    if (!Number.isFinite(offset)) {
      runStart = null
      return
    }
    const drawX = runX + offset
    const maxWidthPx = Math.max(0, options.startX + options.maxPx - drawX)
    if (maxWidthPx > 0) {
      options.surface.drawText(runText, drawX, options.y, {
        fontPx: options.fontPx,
        material: options.material,
        maxWidthPx,
        fit: false,
        measure: false,
        ...(options.letterSpacingPx === undefined ? {} : {letterSpacingPx: options.letterSpacingPx}),
        ...(options.spaceAdvancePx === undefined ? {} : {spaceAdvancePx: options.spaceAdvancePx}),
      })
    }
    runStart = null
  }

  for (let index = 0; index < options.text.length;) {
    const codePoint = options.text.codePointAt(index) ?? 0
    const width = codePoint > 0xffff ? 2 : 1
    if (isDrawableCodeTextCodePoint(codePoint)) {
      if (runStart === null) runStart = index
    } else {
      flush(index)
    }
    index += width
  }
  flush(options.text.length)
}

function colorSwatchSlot(
  options: RenderCodeTokenLineOptions,
  tokenColStart: number,
  tokenX: number,
  offset: number,
): {x: number; w: number} | null {
  if (tokenColStart <= 0 || !isCodeWhitespace(options.text[tokenColStart - 1] ?? "")) return null
  let slotStart = tokenColStart - 1
  while (slotStart > 0 && isCodeWhitespace(options.text[slotStart - 1] ?? "")) slotStart--
  const slotWidth = options.chunkWidth?.(slotStart, tokenColStart, options.text.slice(slotStart, tokenColStart))
    ?? options.surface.measureText(options.text.slice(slotStart, tokenColStart), options.fontPx, options.letterSpacingPx, options.spaceAdvancePx)
  if (slotWidth <= 0) return null
  const slotX = options.chunkX === undefined
    ? tokenX - slotWidth
    : options.startX + options.chunkX(slotStart) + offset
  return {x: slotX, w: slotWidth}
}

function isCodeWhitespace(character: string): boolean {
  return character === " " || character === "\t"
}

function isDrawableCodeTextCodePoint(codePoint: number): boolean {
  return codePoint >= 0x20 && codePoint !== 0x7f
}

function materialForToken(materials: CodeTokenMaterialMap, category: string, fg: string | undefined): TextMaterial | undefined {
  const hex = normalizeTokenHexColor(fg)
  if (hex === undefined) return materials.get(category)
  const key = `fg:${hex}`
  let material = materials.get(key)
  if (material === undefined) {
    material = new TextMaterial({color: new Color(hex)})
    materials.set(key, material)
  }
  return material
}

function normalizeTokenHexColor(value: string | undefined): string | undefined {
  const raw = value?.trim()
  if (raw === undefined) return undefined
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(raw)
  if (match === null) return undefined
  const body = match[1]!
  if (body.length === 3) return `#${body.split("").map((character) => character + character).join("").toLowerCase()}`
  return `#${body.toLowerCase()}`
}
