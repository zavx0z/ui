import {Z, type UiSurface} from "@layout/core/surface"
import {flexRow} from "@layout/core/flex"
import {rgba8ToColor, uiTheme, type Rgba8} from "./theme-reference.ts"
import {backgroundColor, boxPadding, cssColor, mergeStyle, px, textMaterial, type CssColor, type StyleProps} from "./style.ts"

export type StatusBarItem = Readonly<{
  id: string
  text: string
  highlighted?: boolean
}>

export type StatusBarProps = Readonly<{
  start?: readonly StatusBarItem[]
  end?: readonly StatusBarItem[]
  separator?: string
  style?: StyleProps
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
  const style = mergeStyle({
    style: {
      background: rgba8ToColor(theme.back),
      borderColor: rgba8ToColor(theme.top),
      borderRadius: 0,
      borderWidth: statusBarMetrics.topBandHeight,
      color: rgba8ToColor(theme.text),
      fontSize: statusBarMetrics.fontPx,
      paddingX: statusBarMetrics.paddingX,
      zIndex: Z.CONTAINER,
      ...props.style,
    },
  })
  const z = style.zIndex ?? Z.CONTAINER

  surface.drawRoundedRect(x, y, width, height, {
    radius: px(style.borderRadius, 0),
    fill: backgroundColor(style),
    border: null,
    borderWidth: 0,
    opacity: style.opacity ?? 1,
    z,
  })
  const topBandHeight = Math.min(height, px(style.borderWidth, statusBarMetrics.topBandHeight))
  const topBandColor = style.borderColor === null ? null : cssColor(style.borderColor ?? rgba8ToColor(theme.top))
  if (topBandColor !== null && topBandHeight > 0) {
    surface.drawRoundedRect(x, y, width, topBandHeight, {
      radius: 0,
      fill: topBandColor,
      border: null,
      borderWidth: 0,
      opacity: style.opacity ?? 1,
      z: z + 0.02,
    })
  }
  const separator = props.separator ?? " | "
  const padding = boxPadding(style)
  const fontPx = px(style.fontSize, statusBarMetrics.fontPx)
  const innerLeft = x + padding.left
  const innerRight = x + width - padding.right
  const innerWidth = Math.max(0, innerRight - innerLeft)
  if (innerWidth <= 0) return
  const start = statusBarTokens(surface, props.start ?? [], separator, fontPx)
  const end = statusBarTokens(surface, props.end ?? [], separator, fontPx)
  const hasBoth = start.length > 0 && end.length > 0
  const endWidth = Math.min(innerWidth, tokenWidth(end))
  const groupGap = hasBoth ? Math.min(12, Math.max(0, innerWidth - endWidth)) : 0
  const textZ = props.style?.zIndex === undefined ? Z.TEXT : z + 0.1
  flexRow({
    x: innerLeft,
    y,
    w: innerWidth,
    h: height,
    gap: groupGap,
    alignItems: "stretch",
    justifyContent: start.length === 0 ? "end" : "start",
    items: [
      start.length === 0 ? false : {
        width: "grow",
        height,
        draw: (slotX, slotY, slotWidth, slotHeight) => drawStatusBarTokens(
          surface,
          start,
          slotX,
          slotY,
          slotWidth,
          slotHeight,
          fontPx,
          props.style?.color,
          textZ,
        ),
      },
      end.length === 0 ? false : {
        width: endWidth,
        height,
        draw: (slotX, slotY, slotWidth, slotHeight) => drawStatusBarTokens(
          surface,
          end,
          slotX,
          slotY,
          slotWidth,
          slotHeight,
          fontPx,
          props.style?.color,
          textZ,
        ),
      },
    ],
  })
}

export function statusBarText(items: readonly StatusBarItem[], separator = " | "): string {
  return items.map(({text}) => text).join(separator)
}

function statusBarTokens(
  surface: UiSurface,
  items: readonly StatusBarItem[],
  separator: string,
  fontPx: number,
): readonly StatusBarToken[] {
  return items.flatMap((item, index) => [
    ...(index === 0 ? [] : [token(surface, separator, false, fontPx)]),
    token(surface, item.text, item.highlighted === true, fontPx),
  ])
}

function token(surface: UiSurface, text: string, highlighted: boolean, fontPx: number): StatusBarToken {
  return Object.freeze({
    text,
    highlighted,
    width: surface.measureText(text, fontPx),
  })
}

function tokenWidth(tokens: readonly StatusBarToken[]): number {
  return tokens.reduce((total, token) => total + token.width, 0)
}

function drawStatusBarTokens(
  surface: UiSurface,
  tokens: readonly StatusBarToken[],
  x: number,
  y: number,
  width: number,
  height: number,
  fontPx: number,
  colorOverride: CssColor | undefined,
  z: number,
): void {
  const slots = allocateStatusBarTokens(tokens, width)
  const textY = surface.textTopForVisualCenter("Ag|", y + height / 2, fontPx)
  flexRow({
    x,
    y,
    w: width,
    h: height,
    gap: 0,
    alignItems: "stretch",
    items: slots.map(({token, width}) => ({
      width,
      height,
      draw: (slotX) => {
        const color = colorOverride ?? rgbaCss(token.highlighted ? uiTheme.statusBar.textHighlight : uiTheme.statusBar.text)
        surface.drawText(token.text, slotX, textY + statusBarMetrics.shadowOffsetY, {
          fontPx,
          material: textMaterial(surface, rgbaCss(uiTheme.statusBar.textShadow)),
          maxWidthPx: width,
          z: z - 0.01,
        })
        surface.drawText(token.text, slotX, textY, {
          fontPx,
          material: textMaterial(surface, color),
          maxWidthPx: width,
          z,
        })
      },
    })),
  })
}

function allocateStatusBarTokens(
  tokens: readonly StatusBarToken[],
  availableWidth: number,
): readonly Readonly<{token: StatusBarToken; width: number}>[] {
  const slots: Array<Readonly<{token: StatusBarToken; width: number}>> = []
  let remaining = Math.max(0, availableWidth)
  for (const token of tokens) {
    if (remaining <= 0) break
    const width = Math.min(token.width, remaining)
    slots.push(Object.freeze({token, width}))
    remaining -= width
  }
  return Object.freeze(slots)
}

function rgbaCss(color: Rgba8): CssColor {
  return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`
}
