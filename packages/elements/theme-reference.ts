import {Color} from "@engine/core"

/**
 * Raw Blender runtime 4.5.5 theme bytes and widget state resolution.
 * `release/datafiles/userdef/userdef_default_theme.c` SHA-256
 * `1871145a25268d3310f3e0d8ae54ed6892f4ebb0a5d57399b899bef7dc0adbd3` and
 * `source/blender/editors/interface/interface_widgets.cc` SHA-256
 * `72eac700ab7949dac5ab424dc06041740d58d6c174a781e3adb820c74ffeb66f` are
 * byte-identical at official v4.5.5 and local v4.5.12. Resolver anchors:
 * `widget_alpha_factor`, `widget_active_color`, `widget_state`,
 * `widget_state_menu_item`, and `widget_numbut_draw`.
 */
export type Rgba8 = readonly [r: number, g: number, b: number, a: number]

export type WidgetClass =
  | "regular"
  | "text"
  | "number"
  | "numberSlider"
  | "option"
  | "toggle"
  | "tool"
  | "toolbarItem"
  | "tab"
  | "menu"
  | "menuBack"
  | "menuItem"
  | "box"
  | "listItem"
  | "scroll"

export type WidgetColorSet = Readonly<{
  outline: Rgba8
  inner: Rgba8
  innerSelected: Rgba8
  item: Rgba8
  text: Rgba8
  textSelected: Rgba8
  roundness: number
}>

export type WidgetState = Readonly<{
  hovered?: boolean
  pressed?: boolean
  selected?: boolean
  activeDefault?: boolean
  selectedDraw?: boolean
  selectedPreview?: boolean
  disabled?: boolean
  inactive?: boolean
  searchNoMatch?: boolean
  textInput?: boolean
  listItem?: boolean
  numericZone?: "left" | "center" | "right" | null
}>

export type ResolvedWidgetColors = Readonly<{
  outline: Rgba8
  inner: Rgba8
  item: Rgba8
  text: Rgba8
  roundness: number
}>

export type ResolvedNumericZone = Readonly<{
  zone: "left" | "center" | "right"
  colors: ResolvedWidgetColors
}>

export type ResolvedScrollbarColors = Readonly<{
  track: Rgba8
  outline: Rgba8
  thumb: Rgba8
}>

export type UiThemeStateColors = Readonly<{
  error: Rgba8
  warning: Rgba8
  info: Rgba8
  success: Rgba8
}>

export type UiThemeMaterial = Readonly<{
  widgetEmboss: Rgba8
  menuShadowFactor: number
  menuShadowWidth: number
  editorBorder: Rgba8
  editorOutline: Rgba8
  editorOutlineActive: Rgba8
  checkerPrimary: Rgba8
  checkerSecondary: Rgba8
  checkerSize: number
  panelRoundness: number
  widgetTextCursor: Rgba8
}>

export type UiThemeAxes = Readonly<{
  x: Rgba8
  y: Rgba8
  z: Rgba8
}>

export type UiThemeSpaceNode = Readonly<{
  back: Rgba8
  header: Rgba8
  navigationBar: Rgba8
  executionButtons: Rgba8
  panel: Readonly<{
    header: Rgba8
    back: Rgba8
    subBack: Rgba8
  }>
  tab: Readonly<{
    active: Rgba8
    inactive: Rgba8
    back: Rgba8
    outline: Rgba8
  }>
  list: Rgba8
}>

/**
 * Text Editor region roles from Blender 5.2.0 LTS
 * `release/datafiles/userdef/userdef_default_theme.c` `.space_text`.
 * Syntax categories remain owned by the selected consumer syntax theme.
 */
export type UiThemeSpaceText = Readonly<{
  back: Rgba8
  gutter: Rgba8
  lineNumbers: Rgba8
  text: Rgba8
  selection: Rgba8
  cursor: Rgba8
}>

/** Measured lower status-bar roles from the owner-supplied 4.5.5 reference crop. */
export type UiThemeStatusBar = Readonly<{
  back: Rgba8
  top: Rgba8
  text: Rgba8
  textHighlight: Rgba8
  textShadow: Rgba8
}>

export type UiTheme = Readonly<{
  widgets: Readonly<Record<WidgetClass, WidgetColorSet>>
  state: UiThemeStateColors
  material: UiThemeMaterial
  axes: UiThemeAxes
  spaceNode: UiThemeSpaceNode
  spaceText: UiThemeSpaceText
  statusBar: UiThemeStatusBar
}>

type MutableRgba8 = [number, number, number, number]
type MutableWidgetColorSet = {
  outline: MutableRgba8
  inner: MutableRgba8
  innerSelected: MutableRgba8
  item: MutableRgba8
  text: MutableRgba8
  textSelected: MutableRgba8
  roundness: number
}

function rgba8(r: number, g: number, b: number, a: number): Rgba8 {
  return Object.freeze([r, g, b, a]) as Rgba8
}

function colorSet(
  outline: Rgba8,
  inner: Rgba8,
  innerSelected: Rgba8,
  item: Rgba8,
  text: Rgba8,
  textSelected: Rgba8,
  roundness: number,
): WidgetColorSet {
  return Object.freeze({outline, inner, innerSelected, item, text, textSelected, roundness})
}

const commonOutline = rgba8(0x3d, 0x3d, 0x3d, 0xff)
const commonInner = rgba8(0x54, 0x54, 0x54, 0xff)
const commonSelected = rgba8(0x47, 0x72, 0xb3, 0xff)
const commonText = rgba8(0xe6, 0xe6, 0xe6, 0xff)
const selectedText = rgba8(0xff, 0xff, 0xff, 0xff)

const widgets = Object.freeze({
  regular: colorSet(
    commonOutline,
    commonInner,
    commonSelected,
    rgba8(0x1d, 0x1d, 0x1d, 0x80),
    commonText,
    selectedText,
    0.2,
  ),
  text: colorSet(
    commonOutline,
    rgba8(0x1d, 0x1d, 0x1d, 0xff),
    rgba8(0x18, 0x18, 0x18, 0xff),
    rgba8(0xff, 0xff, 0xff, 0x33),
    commonText,
    selectedText,
    0.2,
  ),
  number: colorSet(
    commonOutline,
    commonInner,
    rgba8(0x22, 0x22, 0x22, 0xff),
    commonSelected,
    commonText,
    selectedText,
    0.2,
  ),
  numberSlider: colorSet(
    commonOutline,
    commonInner,
    rgba8(0x22, 0x22, 0x22, 0xff),
    commonSelected,
    commonText,
    selectedText,
    0.2,
  ),
  option: colorSet(
    commonOutline,
    commonInner,
    commonSelected,
    selectedText,
    commonText,
    selectedText,
    0.2,
  ),
  toggle: colorSet(
    commonOutline,
    commonInner,
    commonSelected,
    rgba8(0x25, 0x25, 0x25, 0xff),
    commonText,
    selectedText,
    0.2,
  ),
  tool: colorSet(
    commonOutline,
    commonInner,
    commonSelected,
    selectedText,
    commonText,
    selectedText,
    0.2,
  ),
  toolbarItem: colorSet(
    commonOutline,
    rgba8(0x28, 0x28, 0x28, 0xff),
    commonSelected,
    rgba8(0xff, 0xff, 0xff, 0xb3),
    commonText,
    selectedText,
    0.2,
  ),
  tab: colorSet(
    rgba8(0x1d, 0x1d, 0x1d, 0xff),
    rgba8(0x1d, 0x1d, 0x1d, 0xff),
    rgba8(0x30, 0x30, 0x30, 0xff),
    rgba8(0x1d, 0x1d, 0x1d, 0xff),
    rgba8(0x98, 0x98, 0x98, 0xff),
    selectedText,
    0.2,
  ),
  menu: colorSet(
    commonOutline,
    rgba8(0x28, 0x28, 0x28, 0xff),
    rgba8(0x47, 0x72, 0xb3, 0xb3),
    rgba8(0xd9, 0xd9, 0xd9, 0xff),
    commonText,
    selectedText,
    0.2,
  ),
  menuBack: colorSet(
    rgba8(0x24, 0x24, 0x24, 0xff),
    rgba8(0x18, 0x18, 0x18, 0xff),
    commonSelected,
    rgba8(0xd9, 0xd9, 0xd9, 0xff),
    rgba8(0x99, 0x99, 0x99, 0xff),
    selectedText,
    0.2,
  ),
  menuItem: colorSet(
    rgba8(0x3d, 0x3d, 0x3d, 0x00),
    rgba8(0x18, 0x18, 0x18, 0x00),
    commonSelected,
    rgba8(0xff, 0xff, 0xff, 0x8f),
    rgba8(0xdd, 0xdd, 0xdd, 0xff),
    selectedText,
    0.2,
  ),
  box: colorSet(
    commonOutline,
    rgba8(0x1d, 0x1d, 0x1d, 0x80),
    commonInner,
    rgba8(0x19, 0x19, 0x19, 0xff),
    commonText,
    selectedText,
    0.2,
  ),
  listItem: colorSet(
    rgba8(0x2d, 0x2d, 0x2d, 0xff),
    rgba8(0xff, 0xff, 0xff, 0x00),
    commonSelected,
    rgba8(0xff, 0xff, 0xff, 0x33),
    rgba8(0xcc, 0xcc, 0xcc, 0xff),
    selectedText,
    0.2,
  ),
  scroll: colorSet(
    commonOutline,
    rgba8(0x22, 0x22, 0x22, 0x00),
    selectedText,
    commonInner,
    commonText,
    selectedText,
    0.5,
  ),
}) satisfies Readonly<Record<WidgetClass, WidgetColorSet>>

export const uiTheme: UiTheme = Object.freeze({
  widgets,
  state: Object.freeze({
    error: rgba8(0x77, 0x11, 0x11, 0xff),
    warning: rgba8(0xac, 0x87, 0x37, 0xff),
    info: rgba8(0x28, 0x48, 0x7d, 0xff),
    success: rgba8(0x18, 0x86, 0x25, 0xff),
  }),
  material: Object.freeze({
    widgetEmboss: rgba8(0x00, 0x00, 0x00, 0x26),
    menuShadowFactor: 0.4,
    menuShadowWidth: 2,
    editorBorder: rgba8(0x16, 0x16, 0x16, 0xff),
    editorOutline: rgba8(0xff, 0xff, 0xff, 0x15),
    editorOutlineActive: rgba8(0xff, 0xff, 0xff, 0x2a),
    checkerPrimary: rgba8(0x33, 0x33, 0x33, 0xff),
    checkerSecondary: rgba8(0x26, 0x26, 0x26, 0xff),
    checkerSize: 8,
    panelRoundness: 0.4,
    widgetTextCursor: rgba8(0x71, 0xa8, 0xff, 0xff),
  }),
  axes: Object.freeze({
    x: rgba8(0xff, 0x33, 0x52, 0xff),
    y: rgba8(0x8b, 0xdc, 0x00, 0xff),
    z: rgba8(0x28, 0x90, 0xff, 0xff),
  }),
  spaceNode: Object.freeze({
    back: rgba8(0x1d, 0x1d, 0x1d, 0x00),
    header: rgba8(0x1d, 0x1d, 0x1d, 0xb3),
    navigationBar: rgba8(0x1d, 0x1d, 0x1d, 0xff),
    executionButtons: rgba8(0x30, 0x30, 0x30, 0xff),
    panel: Object.freeze({
      header: rgba8(0x3d, 0x3d, 0x3d, 0xff),
      back: rgba8(0x3d, 0x3d, 0x3d, 0xff),
      subBack: rgba8(0x00, 0x00, 0x00, 0x1f),
    }),
    tab: Object.freeze({
      active: rgba8(0x30, 0x30, 0x30, 0xff),
      inactive: rgba8(0x1d, 0x1d, 0x1d, 0xff),
      back: rgba8(0x18, 0x18, 0x18, 0xff),
      outline: commonOutline,
    }),
    list: rgba8(0x30, 0x30, 0x30, 0xff),
  }),
  spaceText: Object.freeze({
    back: rgba8(0x23, 0x23, 0x23, 0x00),
    gutter: rgba8(0x1d, 0x1d, 0x1d, 0xff),
    lineNumbers: rgba8(0x77, 0x77, 0x77, 0xff),
    text: rgba8(0xe6, 0xe6, 0xe6, 0xff),
    selection: rgba8(0x4d, 0x4d, 0x4d, 0xe6),
    cursor: rgba8(0x71, 0xa8, 0xff, 0xff),
  }),
  statusBar: Object.freeze({
    back: rgba8(0x18, 0x18, 0x18, 0xff),
    top: rgba8(0x16, 0x16, 0x16, 0xff),
    text: rgba8(0x87, 0x87, 0x87, 0xff),
    textHighlight: rgba8(0xff, 0xff, 0xff, 0xff),
    textShadow: rgba8(0x00, 0x00, 0x00, 0xbf),
  }),
})

function mutableRgba(color: Rgba8): MutableRgba8 {
  return [color[0], color[1], color[2], color[3]]
}

function mutableSet(source: WidgetColorSet, alphaFactor: number): MutableWidgetColorSet {
  const withAlpha = (color: Rgba8): MutableRgba8 => [
    color[0],
    color[1],
    color[2],
    Math.trunc(color[3] * alphaFactor),
  ]

  return {
    outline: withAlpha(source.outline),
    inner: withAlpha(source.inner),
    innerSelected: withAlpha(source.innerSelected),
    item: withAlpha(source.item),
    text: withAlpha(source.text),
    textSelected: withAlpha(source.textSelected),
    roundness: source.roundness,
  }
}

function stateAlphaFactor(state: WidgetState): number {
  if (state.disabled || state.inactive) return state.searchNoMatch ? 0.25 : 0.5
  return state.searchNoMatch ? 0.5 : 1
}

function copyRgba(target: MutableRgba8, source: MutableRgba8): void {
  target[0] = source[0]
  target[1] = source[1]
  target[2] = source[2]
  target[3] = source[3]
}

function copyRgb(target: MutableRgba8, source: MutableRgba8): void {
  target[0] = source[0]
  target[1] = source[1]
  target[2] = source[2]
}

function blendRgb(target: MutableRgba8, source: MutableRgba8, factor: number): void {
  target[0] = Math.trunc(target[0] + (source[0] - target[0]) * factor)
  target[1] = Math.trunc(target[1] + (source[1] - target[1]) * factor)
  target[2] = Math.trunc(target[2] + (source[2] - target[2]) * factor)
}

function grayscaleByte(color: MutableRgba8): number {
  return Math.trunc((54 * color[0] + 182 * color[1] + 19 * color[2]) / 255)
}

function rgbToHsl(color: MutableRgba8): [number, number, number] {
  const r = color[0] / 255
  const g = color[1] / 255
  const b = color[2] / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = Math.min(1, (max + min) / 2)

  if (max === min) return [0, 0, lightness]

  const delta = max - min
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min)
  let hue: number
  if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0)
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4

  return [hue / 6, saturation, lightness]
}

function unitFloatToByte(value: number): number {
  if (value <= 0) return 0
  if (value > 1 - 0.5 / 255) return 255
  return Math.trunc(255 * value + 0.5)
}

function multiplyHsl(color: MutableRgba8, saturationFactor: number, lightnessFactor: number): void {
  const [hue, saturation, lightness] = rgbToHsl(color)
  const adjustedSaturation = saturation * saturationFactor
  const adjustedLightness = lightness * lightnessFactor
  const nr = Math.min(1, Math.max(0, Math.abs(hue * 6 - 3) - 1))
  const ng = Math.min(1, Math.max(0, 2 - Math.abs(hue * 6 - 2)))
  const nb = Math.min(1, Math.max(0, 2 - Math.abs(hue * 6 - 4)))
  const chroma = (1 - Math.abs(2 * adjustedLightness - 1)) * adjustedSaturation

  color[0] = unitFloatToByte((nr - 0.5) * chroma + adjustedLightness)
  color[1] = unitFloatToByte((ng - 0.5) * chroma + adjustedLightness)
  color[2] = unitFloatToByte((nb - 0.5) * chroma + adjustedLightness)
}

function applyActiveColors(colors: MutableWidgetColorSet): void {
  const dark = grayscaleByte(colors.text) > grayscaleByte(colors.inner)
  multiplyHsl(colors.inner, 1.15, dark ? 1.2 : 1.1)
  multiplyHsl(colors.outline, 1.15, 1.15)
  multiplyHsl(colors.text, 1.15, dark ? 1.25 : 0.8)
}

function freezeRgba(color: MutableRgba8): Rgba8 {
  return Object.freeze(color) as Rgba8
}

function freezeResolved(colors: MutableWidgetColorSet): ResolvedWidgetColors {
  return Object.freeze({
    outline: freezeRgba(colors.outline),
    inner: freezeRgba(colors.inner),
    item: freezeRgba(colors.item),
    text: freezeRgba(colors.text),
    roundness: colors.roundness,
  })
}

function resolveMenuItemColors(state: WidgetState): ResolvedWidgetColors {
  const colors = mutableSet(uiTheme.widgets.menuItem, 1)

  if (state.disabled && state.hovered) {
    colors.text[3] = 128
    blendRgb(colors.inner, colors.text, 0.5)
    colors.inner[3] = 64
  }
  else if (state.disabled) {
    colors.text[3] = 128
  }
  else if (state.inactive) {
    if (state.hovered) {
      blendRgb(colors.inner, colors.text, 0.2)
      copyRgb(colors.text, colors.textSelected)
      colors.inner[3] = 255
    }
    blendRgb(colors.text, colors.inner, 0.5)
  }
  else if (state.activeDefault || state.selectedDraw) {
    copyRgba(colors.inner, colors.innerSelected)
    copyRgba(colors.text, colors.textSelected)
  }
  else if (state.selectedPreview) {
    copyRgba(colors.inner, colors.innerSelected)
    copyRgba(colors.text, colors.textSelected)
  }
  else if (state.hovered) {
    blendRgb(colors.inner, colors.text, 0.2)
    copyRgb(colors.text, colors.textSelected)
    colors.inner[3] = 255
    colors.text[3] = 255
  }

  return freezeResolved(colors)
}

export function resolveWidgetColors(
  kind: WidgetClass,
  state: WidgetState = {},
): ResolvedWidgetColors {
  if (kind === "menuItem") return resolveMenuItemColors(state)

  const source = state.listItem ? uiTheme.widgets.listItem : uiTheme.widgets[kind]
  const colors = mutableSet(source, stateAlphaFactor(state))

  if (state.selected || state.pressed) {
    copyRgba(colors.inner, colors.innerSelected)
    copyRgba(colors.text, colors.textSelected)
  }
  else {
    if (state.activeDefault) {
      copyRgba(colors.inner, colors.innerSelected)
      copyRgba(colors.text, colors.textSelected)
    }
    if (state.hovered) applyActiveColors(colors)
  }

  return freezeResolved(colors)
}

export function resolveNumericZoneColors(
  kind: "number" | "numberSlider",
  state: WidgetState,
  targetZone: "left" | "center" | "right" | null = state.numericZone ?? null,
): ResolvedNumericZone | null {
  if (!state.numericZone || targetZone === null || !state.hovered || state.textInput) return null

  const base = resolveWidgetColors(kind, state)
  const colors: MutableWidgetColorSet = {
    outline: mutableRgba(base.outline),
    inner: mutableRgba(base.inner),
    innerSelected: mutableRgba(base.inner),
    item: mutableRgba(base.item),
    text: mutableRgba(base.text),
    textSelected: mutableRgba(base.text),
    roundness: base.roundness,
  }
  copyRgb(colors.item, colors.text)
  if (targetZone === state.numericZone) applyActiveColors(colors)

  return Object.freeze({
    zone: targetZone,
    colors: freezeResolved(colors),
  })
}

/** Blender scroll track + thumb material. Pressed thumb RGB is raised by five bytes. */
export function resolveScrollbarColors(pressed = false): ResolvedScrollbarColors {
  const source = uiTheme.widgets.scroll
  const item = source.item
  return Object.freeze({
    track: source.inner,
    outline: source.outline,
    thumb: pressed
      ? rgba8(
        Math.min(255, item[0] + 5),
        Math.min(255, item[1] + 5),
        Math.min(255, item[2] + 5),
        item[3],
      )
      : item,
  })
}

export function rgba8ToColor(rgba: Rgba8): Color {
  return new Color(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3] / 255)
}

/** Uses source RGB as an opaque editor-region color while preserving raw alpha in `UiTheme`. */
export function opaqueRgba8ToColor(rgba: Rgba8): Color {
  return new Color(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, 1)
}

/** Resolves one source RGBA role over an opaque fallback without mutating either tuple. */
export function resolveOpaqueRgba8(
  source: Rgba8,
  fallback: Rgba8,
): Rgba8 {
  const alpha = source[3] / 255
  return Object.freeze([
    Math.round(source[0] * alpha + fallback[0] * (1 - alpha)),
    Math.round(source[1] * alpha + fallback[1] * (1 - alpha)),
    Math.round(source[2] * alpha + fallback[2] * (1 - alpha)),
    255,
  ]) as Rgba8
}
