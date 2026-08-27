import type {Color} from "@engine/core"
import {Z, type UiSurface} from "@layout/core/surface"
import {cssColor, mergeStyle, type StyleProps} from "./style.ts"

export type DrawIconOptions = {
  opacity?: number
  tint?: Color
  z?: number
  style?: StyleProps
}

export function drawIcon(host: UiSurface, src: string, x: number, y: number, size: number, opts: DrawIconOptions = {}): void {
  if (src.length === 0 || size <= 0) return
  const style = mergeStyle({
    style: {
      opacity: opts.opacity ?? 1,
      ...(opts.tint === undefined ? {} : {color: opts.tint}),
      zIndex: opts.z ?? Z.TEXT,
      ...opts.style,
    },
  })
  host.drawImage(src, x, y, size, size, {
    fit: "contain",
    opacity: style.opacity ?? 1,
    ...(style.color === undefined ? {} : {tint: cssColor(style.color)}),
    z: style.zIndex ?? Z.TEXT,
  })
}

export function drawIconCentered(host: UiSurface, src: string, cx: number, cy: number, size: number, opts: DrawIconOptions = {}): void {
  drawIcon(host, src, cx - size / 2, cy - size / 2, size, opts)
}
