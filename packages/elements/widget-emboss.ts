import {rgba8ToColor, uiTheme} from "./theme-reference.ts"
import {Z, type UiSurface} from "@layout/core/surface"
import type {StyleProps} from "./style.ts"

export type WidgetEmbossRect = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>

/** True when the resolved widget chrome has an explicit visible fill. */
export function widgetEmbossVisible(style: StyleProps): boolean {
  if (style.backgroundColor !== undefined) return style.backgroundColor !== null
  if (style.background !== undefined) return style.background !== null
  return false
}

/** One shifted analytical widget quad; the ordinary chrome masks its upper half. */
export function drawWidgetEmboss(
  surface: UiSurface,
  rect: WidgetEmbossRect,
  radius: number,
  enabled = true,
  z = Z.ELEMENT - 0.01,
): void {
  if (!enabled || rect.width <= 0 || rect.height <= 0) return
  surface.drawRoundedRect(rect.x, rect.y + 1, rect.width, rect.height, {
    radius,
    fill: rgba8ToColor(uiTheme.material.widgetEmboss),
    border: null,
    borderWidth: 0,
    z,
  })
}
