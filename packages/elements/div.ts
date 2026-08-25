import {flexColumn, flexRow} from "@layout/core/flex"
import {Z, type HitOptions, type UiClipShape, type UiSurface} from "@layout/core/surface"
import {scrollbar} from "./scrollbar.ts"
import {span} from "./span.ts"
import {
  backgroundColor,
  boxPadding,
  cssColor,
  glassTintColor,
  glassTintOpacity,
  isGlassBackground,
  mergeStyle,
  px,
  type ElementChildren,
  type InteractiveElementProps,
  type StyleProps,
} from "./style.ts"
import type {Color} from "@engine/core"

export type DivScrollContext = {
  scrollLeft: number
  scrollTop: number
  viewportX: number
  viewportY: number
  viewportWidth: number
  viewportHeight: number
  contentX: number
  contentY: number
  contentWidth: number
  contentHeight: number
}

export type DivProps = Omit<InteractiveElementProps, "children"> & {
  children?: ElementChildren | ((ctx: DivScrollContext) => void)
  scrollContentWidth?: number
  scrollContentHeight?: number
}

type DivScrollState = {
  top: number
  left: number
  targetTop: number
  targetLeft: number
  animationRafId: number | null
  animationLastAtMs: number | null
  pendingTop: number
  pendingLeft: number
  wheelTauTopMs: number
  wheelTauLeftMs: number
  maxScrollTop: number
  maxScrollLeft: number
  wheelAxis: ScrollAxis
  lastWheelAtMs: number | null
  dragY: {startY: number; startTop: number} | null
  dragX: {startX: number; startLeft: number} | null
}

export type ScrollAxis = "x" | "y" | null

const scrollStates = new WeakMap<UiSurface, Map<string, DivScrollState>>()
const WHEEL_LINE_PX = 40
const DOM_DELTA_PIXEL = 0
const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2
const WHEEL_PIXEL_TAU_MS = 42
const WHEEL_LINE_TAU_MS = 72
const WHEEL_PAGE_TAU_MS = 100
const WHEEL_ANIMATION_DEFAULT_FRAME_MS = 1000 / 60
const WHEEL_ANIMATION_MAX_FRAME_MS = 34
const WHEEL_PENDING_SNAP_PX = 0.35
const WHEEL_AXIS_EVENT_SEPARATION_MS = 28
const WHEEL_AXIS_UNLOCK_PERCENT = 1.9
const WHEEL_AXIS_UNLOCK_MIN_PX = 6

export function divScrollTo(surface: UiSurface, key: string, next: {left?: number; top?: number}): void {
  const state = divScrollState(surface, key)
  let changed = false
  if (next.left !== undefined && Number.isFinite(next.left)) {
    const left = Math.max(0, next.left)
    if (left !== state.left) {
      stopDivScrollAnimation(state)
      state.left = left
      state.targetLeft = left
      changed = true
    }
  }
  if (next.top !== undefined && Number.isFinite(next.top)) {
    const top = Math.max(0, next.top)
    if (top !== state.top) {
      stopDivScrollAnimation(state)
      state.top = top
      state.targetTop = top
      changed = true
    }
  }
  if (changed) surface.requestKeyedRender(key)
}

export function divScrollPosition(surface: UiSurface, key: string): {left: number; top: number} {
  const state = divScrollState(surface, key)
  return {left: state.left, top: state.top}
}

export function div(surface: UiSurface, x: number, y: number, width: number, height: number, props: DivProps = {}): void {
  const style = mergeStyle(props)
  if (style.display === "none" || width <= 0 || height <= 0) return
  const fill = backgroundColor(style)
  const border = style.borderColor === null ? null : style.borderColor === undefined ? undefined : cssColor(style.borderColor)
  const box = resolveDivBox(x, y, width, height, style, border !== null && border !== undefined)
  const visibleRoundedChrome = (fill?.a ?? 0) > 0 || (border?.a ?? 0) > 0
  const hitRadius = style.borderRadius !== undefined || visibleRoundedChrome
    ? box.outerRadius
    : 0
  const z = style.zIndex ?? Z.CONTAINER
  const isGlass = isGlassBackground(style)

  if (fill !== null || border !== null) {
    const roundedOpts: {
      radius: number
      fill: Color | null
      border: Color | null
      borderWidth: number
      opacity?: number
      z: number
    } = {
      radius: box.outerRadius,
      fill,
      border: border ?? null,
      borderWidth: box.borderWidth,
      z,
    }
    if (style.opacity !== undefined) roundedOpts.opacity = style.opacity
    surface.drawRoundedRect(x, y, width, height, roundedOpts)
    if (isGlass) {
      const tint = glassTintColor(style)
      const tintOpacity = glassTintOpacity(style) * (style.opacity ?? 1)
      if (tint !== null && tintOpacity > 0 && width > 4 && height > 4) {
        surface.drawRoundedRect(x + 2, y + 2, width - 4, height - 4, {
          radius: Math.max(0, box.outerRadius - 2),
          fill: tint,
          border: null,
          borderWidth: 0,
          opacity: tintOpacity,
          z: z + 0.01,
        })
      }
    }
  }

  if (
    props.onClick !== undefined ||
    props.onPointerEnter !== undefined ||
    props.onPointerLeave !== undefined ||
    props.onPointerDown !== undefined ||
    props.onPointerMove !== undefined ||
    props.onPointerUp !== undefined
  ) {
    const hit: HitOptions = {cursor: "pointer"}
    if (props.key !== undefined) hit.key = props.key
    if (props.onPointerEnter !== undefined) hit.onPointerEnter = props.onPointerEnter
    if (props.onPointerLeave !== undefined) hit.onPointerLeave = props.onPointerLeave
    if (props.onPointerDown !== undefined) hit.onPointerDown = props.onPointerDown
    if (props.onPointerMove !== undefined) hit.onPointerMove = props.onPointerMove
    if (props.onPointerUp !== undefined) hit.onPointerUp = props.onPointerUp
    surface.withChildClip(clipShapeFor({x, y, w: width, h: height}, hitRadius), () => {
      surface.hit(x, y, width, height, props.onClick ?? (() => {}), hit)
    })
  }

  const overflowX = style.overflowX ?? style.overflow ?? "visible"
  const overflowY = style.overflowY ?? style.overflow ?? "visible"
  const scrollableX = overflowX === "auto" || overflowX === "scroll"
  const scrollableY = overflowY === "auto" || overflowY === "scroll"

  if (typeof props.children === "function") {
    const children = props.children
    const layout = divScrollLayout(surface, {
      x,
      y,
      width,
      height,
      style,
      inner: box.inner,
      innerRadius: box.innerRadius,
      key: props.key,
      overflowX,
      overflowY,
      scrollableX,
      scrollableY,
      contentWidth: props.scrollContentWidth,
      contentHeight: props.scrollContentHeight,
    })
    renderDivOverflow(surface, layout, () => children({
      scrollLeft: scrollableX ? layout.state.left : 0,
      scrollTop: scrollableY ? layout.state.top : 0,
      viewportX: layout.viewport.x,
      viewportY: layout.viewport.y,
      viewportWidth: layout.viewport.w,
      viewportHeight: layout.viewport.h,
      contentX: layout.content.x,
      contentY: layout.content.y,
      contentWidth: layout.content.w,
      contentHeight: layout.content.h,
    }))
  }
  else if (props.children !== false && props.children !== null && props.children !== undefined) {
    const text = String(props.children)
    const fontSize = px(style.fontSize, 12)
    const lineHeight = px(typeof style.lineHeight === "number" ? `${style.lineHeight * fontSize}px` : style.lineHeight, Math.round(fontSize * 1.45))
    const lines = text.split(/\r?\n/)
    const lineWidths = lines.map((line) => surface.measureText(line, fontSize))
    const maxLineW = Math.max(1, ...lineWidths)
    const layout = divScrollLayout(surface, {
      x,
      y,
      width,
      height,
      style,
      inner: box.inner,
      innerRadius: box.innerRadius,
      key: props.key,
      overflowX,
      overflowY,
      scrollableX,
      scrollableY,
      contentWidth: maxLineW,
      contentHeight: lines.length * lineHeight,
    })
    renderDivOverflow(surface, layout, () => {
      if (lines.length === 1) {
        span(surface, layout.content.x, layout.content.y, scrollableX ? Math.max(maxLineW, layout.viewport.w + layout.state.left) : layout.viewport.w, layout.viewport.h, {
          children: text,
          style,
        })
      } else {
        for (const [i, line] of lines.entries()) {
          const lineY = layout.content.y + i * lineHeight
          if (lineY + lineHeight < layout.viewport.y || lineY > layout.viewport.y + layout.viewport.h) continue
          span(surface, layout.content.x, lineY, scrollableX ? Math.max(lineWidths[i] ?? 1, layout.viewport.w + layout.state.left) : layout.viewport.w, lineHeight, {
            children: line,
            style,
          })
        }
      }
    })
  }
}

type DivRect = {x: number; y: number; w: number; h: number}

type DivBox = {
  outerRadius: number
  borderWidth: number
  inner: DivRect
  innerRadius: number
}

type DivScrollLayout = {
  inner: DivRect
  innerRadius: number
  childClip: UiClipShape
  viewport: DivRect
  content: DivRect
  verticalScrollbar: DivRect | null
  horizontalScrollbar: DivRect | null
  key: string
  style: StyleProps
  state: DivScrollState
  clipChildren: boolean
  showX: boolean
  showY: boolean
  maxScrollX: number
  maxScrollY: number
}

function resolveDivBox(x: number, y: number, width: number, height: number, style: StyleProps, hasBorder: boolean): DivBox {
  const half = Math.max(0, Math.min(width, height) / 2)
  const outerRadius = clamp(finiteNonNegative(px(style.borderRadius, Math.min(32, half))), 0, half)
  const borderWidth = hasBorder
    ? clamp(finiteNonNegative(px(style.borderWidth, 1)), 0, half)
    : 0
  const inner = {
    x: x + borderWidth,
    y: y + borderWidth,
    w: Math.max(0, width - borderWidth * 2),
    h: Math.max(0, height - borderWidth * 2),
  }
  const innerRadius = clamp(
    Math.max(0, outerRadius - borderWidth),
    0,
    Math.max(0, Math.min(inner.w, inner.h) / 2),
  )
  return {outerRadius, borderWidth, inner, innerRadius}
}

function divScrollLayout(
  surface: UiSurface,
  opts: {
    x: number
    y: number
    width: number
    height: number
    style: StyleProps
    inner: DivRect
    innerRadius: number
    key: string | undefined
    overflowX: string
    overflowY: string
    scrollableX: boolean
    scrollableY: boolean
    contentWidth: number | undefined
    contentHeight: number | undefined
  },
): DivScrollLayout {
  const pad = boxPadding(opts.style)
  const trackWidth = Math.min(
    finiteNonNegative(px(opts.style.scrollbarWidth, 4)),
    opts.inner.w,
    opts.inner.h,
  )
  const rawViewportW = Math.max(0, opts.inner.w - pad.left - pad.right)
  const rawViewportH = Math.max(0, opts.inner.h - pad.top - pad.bottom)
  const intrinsicW = Math.max(1, opts.contentWidth ?? rawViewportW)
  const intrinsicH = Math.max(1, opts.contentHeight ?? rawViewportH)
  const scrollGutter = trackWidth
  let showX = opts.scrollableX && (opts.overflowX === "scroll" || intrinsicW > rawViewportW)
  let showY = opts.scrollableY && (opts.overflowY === "scroll" || intrinsicH > rawViewportH)
  for (let i = 0; i < 2; i++) {
    const viewportW = Math.max(0, rawViewportW - (showY ? scrollGutter : 0))
    const viewportH = Math.max(0, rawViewportH - (showX ? scrollGutter : 0))
    showX = opts.scrollableX && (opts.overflowX === "scroll" || intrinsicW > viewportW)
    showY = opts.scrollableY && (opts.overflowY === "scroll" || intrinsicH > viewportH)
  }
  let viewport: DivRect = {x: opts.inner.x, y: opts.inner.y, w: 0, h: 0}
  let verticalScrollbar: DivRect | null = null
  let horizontalScrollbar: DivRect | null = null
  flexColumn({
    x: opts.inner.x,
    y: opts.inner.y,
    w: opts.inner.w,
    h: opts.inner.h,
    items: [
      {height: "grow", draw: (mainX, mainY, mainWidth, mainHeight) => {
        flexRow({
          x: mainX,
          y: mainY,
          w: mainWidth,
          h: mainHeight,
          items: [
            {width: "grow", height: mainHeight, draw: (frameX, frameY, frameWidth, frameHeight) => {
              flexColumn({
                x: frameX,
                y: frameY,
                w: frameWidth,
                h: frameHeight,
                paddingTop: pad.top,
                paddingRight: pad.right,
                paddingBottom: pad.bottom,
                paddingLeft: pad.left,
                items: [{height: "grow", draw: (x, y, w, h) => { viewport = {x, y, w, h} }}],
              })
            }},
            showY && {width: trackWidth, height: mainHeight, draw: (x, y, w, h) => {
              verticalScrollbar = {x, y, w, h}
            }},
          ],
        })
      }},
      showX && {height: trackWidth, draw: (rowX, rowY, rowWidth, rowHeight) => {
        flexRow({
          x: rowX,
          y: rowY,
          w: rowWidth,
          h: rowHeight,
          items: [
            {width: "grow", height: rowHeight, draw: (x, y, w, h) => {
              horizontalScrollbar = {x, y, w, h}
            }},
            showY && {width: trackWidth, height: rowHeight, draw: () => {}},
          ],
        })
      }},
    ],
  })
  const contentW = Math.max(viewport.w, intrinsicW)
  const contentH = Math.max(viewport.h, intrinsicH)
  const key = opts.key ?? `div:${opts.x}:${opts.y}:${opts.width}:${opts.height}`
  surface.registerRenderKey(key)
  const state = divScrollState(surface, key)
  const maxScrollX = Math.max(0, contentW - viewport.w)
  const maxScrollY = Math.max(0, contentH - viewport.h)
  const left = clamp(state.left, 0, maxScrollX)
  const top = clamp(state.top, 0, maxScrollY)
  if (left !== state.left) state.pendingLeft = 0
  if (top !== state.top) state.pendingTop = 0
  state.left = left
  state.top = top
  state.targetLeft = clamp(state.left + state.pendingLeft, 0, maxScrollX)
  state.targetTop = clamp(state.top + state.pendingTop, 0, maxScrollY)
  state.pendingLeft = state.targetLeft - state.left
  state.pendingTop = state.targetTop - state.top
  state.maxScrollLeft = maxScrollX
  state.maxScrollTop = maxScrollY
  return {
    inner: opts.inner,
    innerRadius: opts.innerRadius,
    childClip: clipShapeFor(opts.inner, opts.innerRadius),
    viewport,
    content: {
      x: viewport.x - (opts.scrollableX ? state.left : 0),
      y: viewport.y - (opts.scrollableY ? state.top : 0),
      w: contentW,
      h: contentH,
    },
    verticalScrollbar,
    horizontalScrollbar,
    key,
    style: opts.style,
    state,
    clipChildren: opts.overflowX === "hidden" || opts.overflowY === "hidden" || opts.scrollableX || opts.scrollableY,
    showX,
    showY,
    maxScrollX,
    maxScrollY,
  }
}

function renderDivOverflow(surface: UiSurface, layout: DivScrollLayout, drawChildren: () => void): void {
  const draw = () => {
    registerDivWheel(surface, layout)
    if (layout.clipChildren) {
      surface.withChildClip({kind: "rect", ...layout.viewport}, drawChildren)
    } else {
      drawChildren()
    }
    renderDivScrollbars(surface, layout)
  }
  if (layout.clipChildren) surface.withChildClip(layout.childClip, draw)
  else draw()
}

function registerDivWheel(surface: UiSurface, layout: DivScrollLayout): void {
  const {state} = layout
  if ((layout.showX && layout.maxScrollX > 0) || (layout.showY && layout.maxScrollY > 0)) {
    surface.wheel(layout.inner.x, layout.inner.y, layout.inner.w, layout.inner.h, (event) => {
      const eventAtMs = wheelEventTimeMs(event.timeStamp)
      const delta = wheelDeltasForEvent(event, layout)
      const locked = applyWheelAxisLock(delta.x, delta.y, nextWheelAxis(delta.x, delta.y, state.wheelAxis, state.lastWheelAtMs, eventAtMs))
      state.wheelAxis = locked.axis
      state.lastWheelAtMs = eventAtMs
      let handled = false
      if (locked.x !== 0) handled = applyWheelScroll(surface, state, layout.key, "left", locked.x, event.deltaMode, layout.maxScrollX, eventAtMs) || handled
      if (locked.y !== 0) handled = applyWheelScroll(surface, state, layout.key, "top", locked.y, event.deltaMode, layout.maxScrollY, eventAtMs) || handled
      if (handled) event.preventDefault()
    }, layout.key)
  }
}

function renderDivScrollbars(surface: UiSurface, layout: DivScrollLayout): void {
  const {state, style} = layout
  if (layout.showY && layout.verticalScrollbar !== null) {
    const slot = layout.verticalScrollbar
    const edgeInset = scrollbarEdgeInset(layout.innerRadius, slot.h)
    const topInset = edgeInset
    const bottomInset = edgeInset
    const scrollbarX = slot.x
    const scrollbarY = slot.y + topInset
    const scrollbarH = Math.max(0, slot.h - topInset - bottomInset)
    const scrollbarKey = `${layout.key}:scrollbar-y`
    const thumb = scrollbarThumbMetrics(state.top, layout.viewport.h, layout.content.h, scrollbarH)
    const thumbY = scrollbarY + thumb.y
    const thumbKey = `${scrollbarKey}:thumb`
    const thumbState = surface.hitState(scrollbarX, thumbY, slot.w, thumb.h, thumbKey)
    surface.hit(scrollbarX, scrollbarY, slot.w, scrollbarH, () => {}, {
      key: scrollbarKey,
      cursor: "pointer",
      onPointerDown: (_localX, localY) => {
        const localTrackY = localY - scrollbarY
        const direction = localTrackY < thumb.y ? -1 : 1
        stopDivScrollAnimation(state)
        state.top = clamp(state.top + direction * layout.viewport.h * 0.85, 0, layout.maxScrollY)
        state.targetTop = state.top
        surface.requestKeyedRender(layout.key)
      },
    })
    surface.hit(scrollbarX, thumbY, slot.w, thumb.h, () => {}, {
      key: thumbKey,
      cursor: "grab",
      activeCursor: "grabbing",
      onPointerDown: (_localX, localY) => {
        stopDivScrollAnimation(state)
        state.dragY = {startY: localY, startTop: state.top}
      },
      onPointerMove: (_localX, localY) => {
        if (state.dragY === null) return
        const range = Math.max(1, scrollbarH - thumb.h)
        const contentRange = Math.max(1, layout.content.h - layout.viewport.h)
        const next = state.dragY.startTop + ((localY - state.dragY.startY) / range) * contentRange
        state.top = clamp(next, 0, layout.maxScrollY)
        state.targetTop = state.top
        surface.requestKeyedRender(layout.key)
      },
      onPointerUp: () => {
        state.dragY = null
      },
    })
    scrollbar(surface, scrollbarX, scrollbarY, scrollbarH, {
      offset: state.top,
      visible: layout.viewport.h,
      total: layout.content.h,
      trackWidth: slot.w,
      minThumbHeight: Math.min(16, scrollbarH),
      ...(style.scrollbarTrackColor === undefined ? {} : {trackColor: cssColor(style.scrollbarTrackColor)}),
      ...(style.scrollbarColor === undefined ? {} : {thumbColor: cssColor(style.scrollbarColor)}),
      pressed: thumbState.pressed || state.dragY !== null,
    })
  }

  if (layout.showX && layout.horizontalScrollbar !== null) {
    const slot = layout.horizontalScrollbar
    const edgeInset = scrollbarEdgeInset(layout.innerRadius, slot.w)
    const leftInset = edgeInset
    const rightInset = edgeInset
    const scrollbarX = slot.x + leftInset
    const scrollbarY = slot.y
    const scrollbarW = Math.max(0, slot.w - leftInset - rightInset)
    const scrollbarKey = `${layout.key}:scrollbar-x`
    const thumb = scrollbarThumbMetrics(state.left, layout.viewport.w, layout.content.w, scrollbarW)
    const thumbX = scrollbarX + thumb.y
    const thumbKey = `${scrollbarKey}:thumb`
    const thumbState = surface.hitState(thumbX, scrollbarY, thumb.h, slot.h, thumbKey)
    surface.hit(scrollbarX, scrollbarY, scrollbarW, slot.h, () => {}, {
      key: scrollbarKey,
      cursor: "pointer",
      onPointerDown: (localX) => {
        const localTrackX = localX - scrollbarX
        const direction = localTrackX < thumb.y ? -1 : 1
        stopDivScrollAnimation(state)
        state.left = clamp(state.left + direction * layout.viewport.w * 0.85, 0, layout.maxScrollX)
        state.targetLeft = state.left
        surface.requestKeyedRender(layout.key)
      },
    })
    surface.hit(thumbX, scrollbarY, thumb.h, slot.h, () => {}, {
      key: thumbKey,
      cursor: "grab",
      activeCursor: "grabbing",
      onPointerDown: (localX) => {
        stopDivScrollAnimation(state)
        state.dragX = {startX: localX, startLeft: state.left}
      },
      onPointerMove: (localX) => {
        if (state.dragX === null) return
        const range = Math.max(1, scrollbarW - thumb.h)
        const contentRange = Math.max(1, layout.content.w - layout.viewport.w)
        const next = state.dragX.startLeft + ((localX - state.dragX.startX) / range) * contentRange
        state.left = clamp(next, 0, layout.maxScrollX)
        state.targetLeft = state.left
        surface.requestKeyedRender(layout.key)
      },
      onPointerUp: () => {
        state.dragX = null
      },
    })
    scrollbar(surface, scrollbarX, scrollbarY, scrollbarW, {
      axis: "horizontal",
      offset: state.left,
      visible: layout.viewport.w,
      total: layout.content.w,
      trackWidth: slot.h,
      minThumbHeight: Math.min(16, scrollbarW),
      ...(style.scrollbarTrackColor === undefined ? {} : {trackColor: cssColor(style.scrollbarTrackColor)}),
      ...(style.scrollbarColor === undefined ? {} : {thumbColor: cssColor(style.scrollbarColor)}),
      pressed: thumbState.pressed || state.dragX !== null,
    })
  }
}

function divScrollState(surface: UiSurface, key: string): DivScrollState {
  let byKey = scrollStates.get(surface)
  if (byKey === undefined) {
    byKey = new Map()
    scrollStates.set(surface, byKey)
  }
  let state = byKey.get(key)
  if (state === undefined) {
    state = {
      top: 0,
      left: 0,
      targetTop: 0,
      targetLeft: 0,
      animationRafId: null,
      animationLastAtMs: null,
      pendingTop: 0,
      pendingLeft: 0,
      wheelTauTopMs: WHEEL_PIXEL_TAU_MS,
      wheelTauLeftMs: WHEEL_PIXEL_TAU_MS,
      maxScrollTop: 0,
      maxScrollLeft: 0,
      wheelAxis: null,
      lastWheelAtMs: null,
      dragY: null,
      dragX: null,
    }
    byKey.set(key, state)
  }
  state.top ??= 0
  state.left ??= 0
  state.targetTop ??= state.top
  state.targetLeft ??= state.left
  state.animationRafId ??= null
  state.animationLastAtMs ??= null
  state.pendingTop ??= 0
  state.pendingLeft ??= 0
  state.wheelTauTopMs ??= WHEEL_PIXEL_TAU_MS
  state.wheelTauLeftMs ??= WHEEL_PIXEL_TAU_MS
  state.maxScrollTop ??= 0
  state.maxScrollLeft ??= 0
  state.wheelAxis ??= null
  state.lastWheelAtMs ??= null
  state.dragY ??= null
  state.dragX ??= null
  return state
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function clipShapeFor(rect: DivRect, radius: number): UiClipShape {
  if (radius <= 0) return {kind: "rect", ...rect}
  return {kind: "rounded-rect", ...rect, radius}
}

function scrollbarThumbMetrics(offset: number, visible: number, total: number, trackSize = visible): {y: number; h: number} {
  const thumbH = Math.min(trackSize, Math.max(Math.min(16, trackSize), Math.floor(trackSize * (visible / total))))
  const range = trackSize - thumbH
  const maxOffset = Math.max(1, total - visible)
  return {
    y: Math.floor(range * (offset / maxOffset)),
    h: thumbH,
  }
}

function scrollbarEdgeInset(radius: number, axisSize: number): number {
  if (radius <= 0 || axisSize <= 0) return 0
  return Math.ceil(Math.min(radius, axisSize / 2))
}

export function wheelDeltaPxFor(delta: number, deltaMode: number, pageSizePx: number): number {
  if (!Number.isFinite(delta) || delta === 0) return 0
  if (deltaMode === DOM_DELTA_PIXEL) return delta
  if (deltaMode === DOM_DELTA_PAGE) return delta * Math.max(1, pageSizePx)
  if (deltaMode === DOM_DELTA_LINE) return delta * WHEEL_LINE_PX
  return delta
}

export function wheelQueueTauMs(deltaMode: number): number {
  if (deltaMode === DOM_DELTA_PAGE) return WHEEL_PAGE_TAU_MS
  if (deltaMode === DOM_DELTA_LINE) return WHEEL_LINE_TAU_MS
  return WHEEL_PIXEL_TAU_MS
}

export function integrateQueuedScroll(current: number, pending: number, elapsedMs: number, tauMs: number, maxScroll: number): {value: number; pending: number} {
  if (!Number.isFinite(current)) return {value: 0, pending: 0}
  const currentPending = Number.isFinite(pending) ? pending : 0
  if (Math.abs(currentPending) <= WHEEL_PENDING_SNAP_PX) {
    const value = clamp(current + currentPending, 0, maxScroll)
    return {value, pending: 0}
  }

  const dt = clamp(elapsedMs, 1, WHEEL_ANIMATION_MAX_FRAME_MS) / 1000
  const tauSeconds = Math.max(0.001, tauMs / 1000)
  const consume = 1 - Math.exp(-dt / tauSeconds)
  const step = currentPending * consume
  const rawValue = current + step
  const value = clamp(rawValue, 0, maxScroll)
  let nextPending = currentPending - (value - current)
  if (value !== rawValue || Math.abs(nextPending) <= WHEEL_PENDING_SNAP_PX) nextPending = 0
  return {value, pending: nextPending}
}

function wheelDeltasForEvent(event: WheelEvent, layout: DivScrollLayout): {x: number; y: number} {
  let x = wheelDeltaPxFor(event.deltaX, event.deltaMode, layout.viewport.w)
  let y = wheelDeltaPxFor(event.deltaY, event.deltaMode, layout.viewport.h)
  if (event.shiftKey && y !== 0) {
    x = y
    y = 0
  }
  if (!layout.showX && layout.showY && y === 0 && x !== 0) {
    y = x
    x = 0
  }
  if (!layout.showY && layout.showX && x === 0 && y !== 0) {
    x = y
    y = 0
  }
  if (!layout.showX) x = 0
  if (!layout.showY) y = 0
  return {x, y}
}

export function nextWheelAxis(deltaX: number, deltaY: number, previousAxis: ScrollAxis, lastEventAtMs: number | null, eventAtMs: number): ScrollAxis {
  const x = Math.abs(deltaX)
  const y = Math.abs(deltaY)
  if (x === 0 && y === 0) return previousAxis
  let axis = previousAxis
  const newScroll = !isFiniteNumber(lastEventAtMs) || eventAtMs - lastEventAtMs > WHEEL_AXIS_EVENT_SEPARATION_MS
  if (newScroll) {
    axis = x > y ? "x" : "y"
  } else if (Math.max(x, y) >= WHEEL_AXIS_UNLOCK_MIN_PX) {
    if (axis === "y" && x > y && x >= y * WHEEL_AXIS_UNLOCK_PERCENT) axis = null
    else if (axis === "x" && y > x && y >= x * WHEEL_AXIS_UNLOCK_PERCENT) axis = null
  }
  return axis
}

export function applyWheelAxisLock(deltaX: number, deltaY: number, axis: ScrollAxis): {x: number; y: number; axis: ScrollAxis} {
  if (axis === "x") return {x: deltaX, y: 0, axis}
  if (axis === "y") return {x: 0, y: deltaY, axis}
  return {x: deltaX, y: deltaY, axis}
}

function applyWheelScroll(surface: UiSurface, state: DivScrollState, key: string, axis: "left" | "top", deltaPx: number, deltaMode: number, maxScroll: number, eventAtMs: number): boolean {
  if (!Number.isFinite(deltaPx) || deltaPx === 0) return false
  const pendingKey = axis === "left" ? "pendingLeft" : "pendingTop"
  const targetKey = axis === "left" ? "targetLeft" : "targetTop"
  const tauKey = axis === "left" ? "wheelTauLeftMs" : "wheelTauTopMs"
  const current = state[axis]
  const target = clamp(current + state[pendingKey] + deltaPx, 0, maxScroll)
  const nextPending = target - current
  if (nextPending === state[pendingKey]) return false
  state[targetKey] = target
  state[pendingKey] = nextPending
  state[tauKey] = wheelQueueTauMs(deltaMode)
  startDivScrollAnimation(surface, state, key, eventAtMs)
  return true
}

function wheelEventTimeMs(eventTimeStamp: number | undefined): number {
  if (isFiniteNumber(eventTimeStamp)) return eventTimeStamp
  if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now()
  return Date.now()
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function startDivScrollAnimation(surface: UiSurface, state: DivScrollState, key: string, eventAtMs = animationTimeMs()): void {
  if (state.animationRafId !== null) return
  if (typeof requestAnimationFrame !== "function") {
    state.left = state.targetLeft
    state.top = state.targetTop
    state.pendingLeft = 0
    state.pendingTop = 0
    state.animationLastAtMs = null
    surface.requestKeyedRender(key)
    return
  }
  state.animationLastAtMs = eventAtMs

  const tick = (timestamp: number) => {
    state.animationRafId = null
    const now = isFiniteNumber(timestamp) ? timestamp : animationTimeMs()
    const previous = state.animationLastAtMs ?? now - WHEEL_ANIMATION_DEFAULT_FRAME_MS
    const elapsedMs = clamp(now - previous, 1, WHEEL_ANIMATION_MAX_FRAME_MS)
    state.animationLastAtMs = now
    const nextLeft = integrateQueuedScroll(state.left, state.pendingLeft, elapsedMs, state.wheelTauLeftMs, state.maxScrollLeft)
    const nextTop = integrateQueuedScroll(state.top, state.pendingTop, elapsedMs, state.wheelTauTopMs, state.maxScrollTop)
    const changed = nextLeft.value !== state.left || nextTop.value !== state.top
    state.left = nextLeft.value
    state.top = nextTop.value
    state.pendingLeft = nextLeft.pending
    state.pendingTop = nextTop.pending
    state.targetLeft = state.left + state.pendingLeft
    state.targetTop = state.top + state.pendingTop
    if (changed) surface.requestKeyedRender(key)
    if (state.pendingLeft !== 0 || state.pendingTop !== 0) {
      state.animationRafId = requestAnimationFrame(tick)
    } else {
      state.animationLastAtMs = null
    }
  }
  state.animationRafId = requestAnimationFrame(tick)
}

function stopDivScrollAnimation(state: DivScrollState): void {
  if (state.animationRafId !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(state.animationRafId)
  state.animationRafId = null
  state.animationLastAtMs = null
  state.pendingLeft = 0
  state.pendingTop = 0
  state.wheelAxis = null
  state.lastWheelAtMs = null
}

function animationTimeMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now()
  return Date.now()
}
