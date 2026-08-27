/**
 * One package-owned set of visible UI geometry metrics.
 *
 * Radius is deliberately absent: each exact visual owner declares its own
 * CSS-like `borderRadius` default instead of reading a shared shape parameter.
 */
export type UiShapeMetrics = Readonly<{
  controlHeight: number
  rowHeight: number
  borderWidth: number
  separatorWidth: number
  tightGap: number
  iconActionSlot: number
  iconGlyphSize: number
  compactFontPx: number
  panelHeaderHeight: number
  panelSectionGap: number
}>

export const uiShapeMetrics: UiShapeMetrics = Object.freeze({
  controlHeight: 22,
  rowHeight: 24,
  borderWidth: 1,
  separatorWidth: 1,
  tightGap: 3,
  iconActionSlot: 22,
  iconGlyphSize: 14,
  compactFontPx: 11,
  panelHeaderHeight: 24,
  panelSectionGap: 3,
})
