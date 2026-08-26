import {Z, type UiSurface} from "@layout/core/surface"
import {rgba8ToColor, uiTheme, type Rgba8} from "./theme-reference.ts"
import {textMaterial, type CssColor} from "./style.ts"

export type StatusBarItem = Readonly<{
  id: string
  text: string
  highlighted?: boolean
}>

export type StatusBarProps = Readonly<{
  start?: readonly StatusBarItem[]
  end?: readonly StatusBarItem[]
  separator?: string
}>

export const statusBarMetrics = Object.freeze({
  height: 24,
  topBandHeight: 2,
  paddingX: 12,
  fontPx: 11,
  shadowOffsetY: 1,
})

type StatusBarToken = Readonly<{
  text: string
  highlighted: boolean
  width: number
}>

/** Renders one passive owner-supplied status line inside the caller's exact rect. */
export function statusBar(
  surface: UiSurface,
  x: number,
  y: number,
  width: number,
  height: number,
  props: StatusBarProps = {},
): void {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return
  const theme = uiTheme.statusBar

  surface.drawRoundedRect(x, y, width, height, {
    radius: 0,
    fill: rgba8ToColor(theme.back),
    border: null,
    borderWidth: 0,
    z: Z.CONTAINER,
  })
  surface.drawRoundedRect(x, y, width, Math.min(height, statusBarMetrics.topBandHeight), {
    radius: 0,
    fill: rgba8ToColor(theme.top),
    border: null,
    borderWidth: 0,
    z: Z.CONTAINER + 0.02,
  })
  const separator = props.separator ?? " | "
  const innerLeft = x + statusBarMetrics.paddingX
  const innerRight = x + width - statusBarMetrics.paddingX
  const innerWidth = Math.max(0, innerRight - innerLeft)
  if (innerWidth <= 0) return
  const start = statusBarTokens(surface, props.start ?? [], separator)
  const end = statusBarTokens(surface, props.end ?? [], separator)
  const endWidth = tokenWidth(end)
  const endX = Math.max(innerLeft, innerRight - endWidth)
  const hasBoth = start.length > 0 && end.length > 0
  const startRight = Math.max(innerLeft, endX - (hasBoth ? 12 : 0))
  drawStatusBarTokens(surface, start, innerLeft, startRight, y, height)
  drawStatusBarTokens(surface, end, endX, innerRight, y, height)
}

export function statusBarText(items: readonly StatusBarItem[], separator = " | "): string {
  return items.map(({text}) => text).join(separator)
}

function statusBarTokens(
  surface: UiSurface,
  items: readonly StatusBarItem[],
  separator: string,
): readonly StatusBarToken[] {
  return items.flatMap((item, index) => [
    ...(index === 0 ? [] : [token(surface, separator, false)]),
    token(surface, item.text, item.highlighted === true),
  ])
}

function token(surface: UiSurface, text: string, highlighted: boolean): StatusBarToken {
  return Object.freeze({
    text,
    highlighted,
    width: surface.measureText(text, statusBarMetrics.fontPx),
  })
}

function tokenWidth(tokens: readonly StatusBarToken[]): number {
  return tokens.reduce((total, token) => total + token.width, 0)
}

function drawStatusBarTokens(
  surface: UiSurface,
  tokens: readonly StatusBarToken[],
  left: number,
  right: number,
  y: number,
  height: number,
): void {
  let cursor = left
  const textY = surface.textTopForVisualCenter("Ag|", y + height / 2, statusBarMetrics.fontPx)
  for (const token of tokens) {
    const available = right - cursor
    if (available <= 0) return
    const color = token.highlighted ? uiTheme.statusBar.textHighlight : uiTheme.statusBar.text
    const maxWidthPx = Math.min(token.width, available)
    surface.drawText(token.text, cursor, textY + statusBarMetrics.shadowOffsetY, {
      fontPx: statusBarMetrics.fontPx,
      material: textMaterial(surface, rgbaCss(uiTheme.statusBar.textShadow)),
      maxWidthPx,
      z: Z.TEXT - 0.01,
    })
    surface.drawText(token.text, cursor, textY, {
      fontPx: statusBarMetrics.fontPx,
      material: textMaterial(surface, rgbaCss(color)),
      maxWidthPx,
      z: Z.TEXT,
    })
    cursor += token.width
  }
}

function rgbaCss(color: Rgba8): CssColor {
  return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`
}
