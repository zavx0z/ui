import {describe, expect, test} from "bun:test"
import type {UiSurface} from "@layout/core/surface"
import {UiSurface as BaseUiSurface} from "@layout/core/surface"
import {li, liY, ul, ulContentHeight, type UlElementContext} from "./list.ts"
import {rgba8ToColor, resolveWidgetColors} from "./theme-reference.ts"

type HitCall = Parameters<UiSurface["hit"]>
type RoundedRectCall = Parameters<UiSurface["drawRoundedRect"]>

class RecordingSurface extends BaseUiSurface {
  readonly hits: HitCall[] = []
  readonly roundedRects: RoundedRectCall[] = []
  override hit(...args: HitCall): void { this.hits.push(args) }
  override drawRoundedRect(...args: RoundedRectCall): void { this.roundedRects.push(args) }
  protected render(): void {}
}

class ImmediateListSurface extends BaseUiSurface {
  override drawRoundedRect(): void {}
  protected render(): void {}
}

describe("ul/li layout helpers", () => {
  test("computes content height from item count, padding and gaps", () => {
    expect(ulContentHeight(3, {itemHeight: 40, itemGap: 4, paddingTop: 6, paddingBottom: 10})).toBe(144)
  })

  test("keeps empty ul height to padding", () => {
    expect(ulContentHeight(0, {paddingTop: 6, paddingBottom: 10})).toBe(16)
  })

  test("computes stable row y positions", () => {
    expect(liY(2, {startY: 8, itemHeight: 44, itemGap: 6})).toBe(108)
  })

  test("applies explicit ul padding exactly once", () => {
    const surface = new RecordingSurface()
    let context: UlElementContext | null = null
    ul(surface, 0, 0, 100, 80, {
      style: {paddingX: 10, paddingY: 10},
      children: (next) => { context = next },
    })

    expect(context).toMatchObject({
      viewportX: 0,
      viewportY: 0,
      itemX: 10,
      itemY: 10,
      itemWidth: 80,
    })
  })

  test("uses pointer only for a real click or pointer action", () => {
    const tooltip = new RecordingSurface()
    li(tooltip, 0, 0, 100, 24, {tooltip: "Description"})
    expect(tooltip.hits[0]?.[5]).toMatchObject({cursor: "default", tooltip: {label: "Description"}})

    const hoverOnly = new RecordingSurface()
    li(hoverOnly, 0, 0, 100, 24, {onPointerEnter() {}})
    expect(hoverOnly.hits[0]?.[5]).toMatchObject({cursor: "default"})

    const clickable = new RecordingSurface()
    li(clickable, 0, 0, 100, 24, {onClick() {}})
    expect(clickable.hits[0]?.[5]).toMatchObject({cursor: "pointer"})
  })

  test("keeps a rounded li hit inside the same div shape", () => {
    const surface = new ImmediateListSurface()
    li(surface, 0, 0, 100, 40, {key: "rounded-li", onClick() {}})

    expect(surface.pointerHitKey(1, 1)).toBeNull()
    expect(surface.pointerHitKey(50, 20)).toBe("rounded-li")
  })

  test("maps hover, press, selection and disabled through listItem", () => {
    class StateSurface extends RecordingSurface {
      constructor(readonly state: Readonly<{hovered: boolean; pressed: boolean}>) { super() }
      override hitState(): {hovered: boolean; pressed: boolean} { return {...this.state} }
    }

    for (const entry of [
      {hit: {hovered: false, pressed: false}, props: {}, state: {}},
      {hit: {hovered: true, pressed: false}, props: {}, state: {hovered: true}},
      {hit: {hovered: true, pressed: true}, props: {}, state: {hovered: true, pressed: true}},
      {hit: {hovered: true, pressed: false}, props: {selected: true}, state: {hovered: true, selected: true}},
      {hit: {hovered: true, pressed: false}, props: {disabled: true}, state: {hovered: true, disabled: true}},
    ] as const) {
      const surface = new StateSurface(entry.hit)
      li(surface, 0, 0, 100, 24, {...entry.props, onClick() {}})
      const colors = resolveWidgetColors("listItem", {...entry.state, listItem: true})
      expect(surface.roundedRects[0]?.[4]).toMatchObject({
        fill: rgba8ToColor(colors.inner),
        border: rgba8ToColor(colors.outline),
      })
      if (entry.props.disabled === true) expect(surface.hits[0]?.[5]).toMatchObject({cursor: "default"})
    }
  })
})
