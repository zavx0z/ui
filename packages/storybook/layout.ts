import {flexColumnCss, flexRowCss, type FlexCssRowItem} from "@layout/core/flex-css"
import {storybookTheme} from "./theme.ts"

export type StorybookFrame = Readonly<{x: number; y: number; w: number; h: number; visible?: boolean}>
export type StorybookShellFrames = Readonly<{
  compact: boolean
  stage: StorybookFrame
  catalog: StorybookFrame
  section: StorybookFrame
  preview: StorybookFrame
  dock: StorybookFrame
  info: StorybookFrame
}>

export type StorybookShellOptions = Readonly<{
  padding?: number
  gap?: number
  catalogWidth?: number
  sectionWidth?: number
  infoWidth?: number
  dockHeight?: number
  collapsed?: readonly StorybookShellPanel[]
}>

export type StorybookShellPanel = "catalog" | "section" | "info"

const hidden = (): StorybookFrame => ({x: 0, y: 0, w: 0, h: 0, visible: false})

export function planStorybookShell(
  width: number,
  height: number,
  options: StorybookShellOptions = {},
): StorybookShellFrames {
  const compact = false
  const padding = options.padding ?? storybookTheme.stagePadding
  let stage = hidden()
  let catalog = hidden()
  let section = hidden()
  let preview = hidden()
  let dock = hidden()
  let info = hidden()

  const stageWidth = Math.max(1, width - padding * 2)
  const stageHeight = Math.max(1, height - padding * 2)
  const collapsed = new Set(options.collapsed ?? [])
  flexColumnCss({
    x: 0,
    y: 0,
    w: width,
    h: height,
    paddingLeft: padding,
    paddingRight: padding,
    paddingTop: padding,
    paddingBottom: padding,
    items: [
      {height: stageHeight, draw: (rowX, rowY, rowW, rowH) => flexRowCss({
        x: rowX,
        y: rowY,
        w: rowW,
        h: rowH,
        items: [
          {width: stageWidth, draw: (x, y, w, h) => {
            stage = {x, y, w, h}
            const rowItems: FlexCssRowItem[] = []
            if (!collapsed.has("catalog")) rowItems.push({
              width: options.catalogWidth ?? storybookTheme.catalogWidth,
              draw: (slotX, slotY, slotW, slotH) => { catalog = {x: slotX, y: slotY, w: slotW, h: slotH} },
            })
            if (!collapsed.has("section")) rowItems.push({
              width: options.sectionWidth ?? storybookTheme.sectionWidth,
              draw: (slotX, slotY, slotW, slotH) => { section = {x: slotX, y: slotY, w: slotW, h: slotH} },
            })
            rowItems.push({width: "1fr", draw: (columnX, columnY, columnW, columnH) => flexColumnCss({
              x: columnX,
              y: columnY,
              w: columnW,
              h: columnH,
              gap: options.gap ?? storybookTheme.stageGap,
              items: [
                {height: "1fr", draw: (slotX, slotY, slotW, slotH) => { preview = {x: slotX, y: slotY, w: slotW, h: slotH} }},
                {height: options.dockHeight ?? storybookTheme.dockHeight, draw: (slotX, slotY, slotW, slotH) => { dock = {x: slotX, y: slotY, w: slotW, h: slotH} }},
              ],
            })})
            if (!collapsed.has("info")) rowItems.push({
              width: options.infoWidth ?? storybookTheme.infoWidth,
              draw: (slotX, slotY, slotW, slotH) => { info = {x: slotX, y: slotY, w: slotW, h: slotH} },
            })
            flexRowCss({
              x,
              y,
              w,
              h,
              gap: options.gap ?? storybookTheme.stageGap,
              items: rowItems,
            })
          }},
        ],
      })},
    ],
  })
  return {compact, stage, catalog, section, preview, dock, info}
}
