import {describe, expect, test} from "bun:test"
import {UiSurface, type HitOptions, type UiClipShape} from "@layout/core/surface"
import {applyWheelAxisLock, div, divScrollPosition, divScrollTo, integrateQueuedScroll, nextWheelAxis, wheelDeltaPxFor, wheelQueueTauMs, type DivScrollContext} from "./div.ts"

type RoundedRectCall = Parameters<UiSurface["drawRoundedRect"]>

type RecordedInput = Readonly<{
  key: string
  rect: Readonly<{x: number; y: number; w: number; h: number}>
  clips: readonly UiClipShape[]
}>

class DivRecordingSurface extends UiSurface {
  readonly clipCalls: UiClipShape[] = []
  readonly roundedRects: Array<Readonly<{call: RoundedRectCall; clips: readonly UiClipShape[]}>> = []
  readonly hits: RecordedInput[] = []
  readonly wheels: RecordedInput[] = []
  readonly #clips: UiClipShape[] = []

  override withChildClip(shape: UiClipShape, draw: () => void): void {
    this.clipCalls.push(shape)
    this.#clips.push(shape)
    try {
      draw()
    } finally {
      this.#clips.pop()
    }
  }

  override drawRoundedRect(...call: RoundedRectCall): void {
    this.roundedRects.push({call, clips: [...this.#clips]})
  }

  override hit(
    x: number,
    y: number,
    w: number,
    h: number,
    _action: () => void,
    cursorOrOptions: string | HitOptions = "pointer",
  ): void {
    const key = typeof cursorOrOptions === "string" ? `${x}:${y}:${w}:${h}` : cursorOrOptions.key ?? `${x}:${y}:${w}:${h}`
    this.hits.push({key, rect: {x, y, w, h}, clips: [...this.#clips]})
  }

  override wheel(x: number, y: number, w: number, h: number, _onWheel: (event: WheelEvent) => void, key?: string): void {
    this.wheels.push({key: key ?? `${x}:${y}:${w}:${h}`, rect: {x, y, w, h}, clips: [...this.#clips]})
  }

  protected render(): void {}
}

class ImmediateDivSurface extends UiSurface {
  override drawRoundedRect(): void {}
  protected render(): void {}
}

describe("div shaped overflow composition", () => {
  test("derives the inner child shape from the effective border and clips its own rounded hit", () => {
    const surface = new DivRecordingSurface()
    let context: DivScrollContext | null = null
    div(surface, 10, 20, 100, 80, {
      key: "bordered",
      onClick: () => {},
      scrollContentWidth: 92,
      scrollContentHeight: 72,
      style: {
        background: null,
        borderColor: "cyan",
        borderWidth: 4,
        borderRadius: 20,
        overflow: "hidden",
      },
      children: (next) => { context = next },
    })

    expect(surface.roundedRects[0]?.call[4]).toMatchObject({radius: 20, borderWidth: 4})
    expect(surface.hits.find(({key}) => key === "bordered")?.clips).toEqual([
      {kind: "rounded-rect", x: 10, y: 20, w: 100, h: 80, radius: 20},
    ])
    expect(surface.clipCalls).toContainEqual({kind: "rounded-rect", x: 14, y: 24, w: 92, h: 72, radius: 16})
    expect(context).toMatchObject({
      viewportX: 14,
      viewportY: 24,
      viewportWidth: 92,
      viewportHeight: 72,
      contentX: 14,
      contentY: 24,
    })

    const borderless = new DivRecordingSurface()
    div(borderless, 10, 20, 100, 80, {
      style: {background: null, borderColor: null, borderWidth: 8, borderRadius: 20, overflow: "hidden"},
      children: () => {},
    })
    expect(borderless.clipCalls).toContainEqual({kind: "rounded-rect", x: 10, y: 20, w: 100, h: 80, radius: 20})
  })

  test("rejects an immediate div hit outside its rounded corner", () => {
    const surface = new ImmediateDivSurface()
    div(surface, 0, 0, 100, 80, {
      key: "rounded-hit",
      onClick: () => {},
      style: {background: null, borderColor: null, borderRadius: 20},
    })
    expect(surface.pointerHitKey(1, 1)).toBeNull()
    expect(surface.pointerHitKey(50, 40)).toBe("rounded-hit")

    const transparent = new ImmediateDivSurface()
    div(transparent, 0, 0, 100, 80, {
      key: "transparent-hit",
      onClick: () => {},
      style: {background: null, borderColor: null},
    })
    expect(transparent.pointerHitKey(1, 1)).toBe("transparent-hit")
  })

  test("allocates both scrollbar axes through nested Flex slots and passes authoritative content origins", () => {
    const surface = new DivRecordingSurface()
    let context: DivScrollContext | null = null
    div(surface, 10, 20, 100, 80, {
      key: "both",
      scrollContentWidth: 200,
      scrollContentHeight: 160,
      style: {
        background: null,
        borderColor: "cyan",
        borderWidth: 2,
        borderRadius: 20,
        padding: 5,
        scrollbarWidth: 4,
        overflow: "auto",
      },
      children: (next) => {
        context = {...next}
        surface.wheel(next.viewportX, next.viewportY, next.viewportWidth, next.viewportHeight, () => {}, "nested")
        surface.hit(next.viewportX, next.viewportY, next.viewportWidth, next.viewportHeight, () => {}, {key: "child"})
      },
    })

    expect(context).toMatchObject({
      viewportX: 17,
      viewportY: 27,
      viewportWidth: 82,
      viewportHeight: 62,
      contentX: 17,
      contentY: 27,
      contentWidth: 200,
      contentHeight: 160,
    })
    divScrollTo(surface, "both", {left: 10, top: 20})
    div(surface, 10, 20, 100, 80, {
      key: "both",
      scrollContentWidth: 200,
      scrollContentHeight: 160,
      style: {
        background: null,
        borderColor: "cyan",
        borderWidth: 2,
        borderRadius: 20,
        padding: 5,
        scrollbarWidth: 4,
        overflow: "auto",
      },
      children: (next) => { context = {...next} },
    })
    expect(context).toMatchObject({viewportX: 17, viewportY: 27, contentX: 7, contentY: 7})
    expect(surface.wheels.map(({key}) => key).slice(0, 2)).toEqual(["both", "nested"])
    expect(surface.wheels[0]?.clips).toEqual([
      {kind: "rounded-rect", x: 12, y: 22, w: 96, h: 76, radius: 18},
    ])
    expect(surface.wheels[1]?.clips).toEqual([
      {kind: "rounded-rect", x: 12, y: 22, w: 96, h: 76, radius: 18},
      {kind: "rect", x: 17, y: 27, w: 82, h: 62},
    ])
    expect(surface.hits.find(({key}) => key === "both:scrollbar-y")?.rect).toEqual({x: 104, y: 40, w: 4, h: 36})
    expect(surface.hits.find(({key}) => key === "both:scrollbar-x")?.rect).toEqual({x: 30, y: 94, w: 56, h: 4})
    expect(surface.hits.find(({key}) => key === "both:scrollbar-y")?.clips).toEqual([surface.wheels[0]!.clips[0]!])
  })

  test("registers nested scroll owners after their parent", () => {
    const surface = new DivRecordingSurface()
    div(surface, 0, 0, 160, 120, {
      key: "outer",
      scrollContentHeight: 240,
      style: {overflowY: "auto", borderRadius: 18},
      children: ({viewportX, viewportY, viewportWidth, viewportHeight}) => {
        div(surface, viewportX, viewportY, viewportWidth, viewportHeight, {
          key: "inner",
          scrollContentHeight: 200,
          style: {overflowY: "auto", borderRadius: 12},
          children: () => {},
        })
      },
    })
    expect(surface.wheels.map(({key}) => key).slice(0, 2)).toEqual(["outer", "inner"])

    const immediate = new ImmediateDivSurface()
    div(immediate, 0, 0, 160, 120, {
      key: "outer-live",
      scrollContentHeight: 240,
      style: {background: null, borderColor: null, overflowY: "auto", borderRadius: 18},
      children: ({viewportX, viewportY, viewportWidth, viewportHeight}) => {
        div(immediate, viewportX, viewportY, viewportWidth, viewportHeight, {
          key: "inner-live",
          scrollContentHeight: 200,
          style: {background: null, borderColor: null, overflowY: "auto", borderRadius: 12},
          children: () => {},
        })
      },
    })
    immediate.onWheel({
      deltaX: 0,
      deltaY: 40,
      deltaMode: 0,
      shiftKey: false,
      timeStamp: 100,
      preventDefault() {},
    } as unknown as WheelEvent, 60, 60)
    expect(divScrollPosition(immediate, "inner-live").top).toBeGreaterThan(0)
    expect(divScrollPosition(immediate, "outer-live").top).toBe(0)
  })

  test("keeps exact nested Flex planners as the only scrollbar sibling placement", async () => {
    const source = await Bun.file(new URL("./div.ts", import.meta.url)).text()
    expect(source).toContain('from "@layout/core/flex"')
    expect(source).toContain("flexColumn({")
    expect(source.match(/flexRow\(\{/g)?.length).toBe(2)
    expect(source).not.toContain("layout.x + layout.width -")
    expect(source).not.toContain("layout.y + layout.height -")
  })
})

describe("div wheel delta normalization", () => {
  test("keeps pixel deltas unchanged", () => {
    expect(wheelDeltaPxFor(0.5, 0, 480)).toBe(0.5)
    expect(wheelDeltaPxFor(120, 0, 480)).toBe(120)
    expect(wheelDeltaPxFor(-14.25, 0, 480)).toBe(-14.25)
  })

  test("converts line deltas without clamping", () => {
    expect(wheelDeltaPxFor(1, 1, 480)).toBe(40)
    expect(wheelDeltaPxFor(-3, 1, 480)).toBe(-120)
  })

  test("converts page deltas to viewport-sized movement", () => {
    expect(wheelDeltaPxFor(1, 2, 480)).toBe(480)
    expect(wheelDeltaPxFor(-2, 2, 320)).toBe(-640)
  })

  test("ignores non-finite deltas", () => {
    expect(wheelDeltaPxFor(Number.NaN, 0, 480)).toBe(0)
    expect(wheelDeltaPxFor(Number.POSITIVE_INFINITY, 0, 480)).toBe(0)
  })
})

describe("div wheel smoothing", () => {
  test("uses wheel-mode-specific queue time constants", () => {
    expect(wheelQueueTauMs(0)).toBe(42)
    expect(wheelQueueTauMs(1)).toBe(72)
    expect(wheelQueueTauMs(2)).toBe(100)
  })

  test("integrates queued wheel distance without adding extra acceleration", () => {
    const first = integrateQueuedScroll(0, 26, 16, 42, 1000)
    expect(first.value).toBeGreaterThan(0)
    expect(first.value).toBeLessThan(26)
    expect(first.pending).toBeGreaterThan(0)
    expect(first.value + first.pending).toBeCloseTo(26, 6)

    const second = integrateQueuedScroll(first.value, first.pending, 16, 42, 1000)
    expect(second.value).toBeGreaterThan(first.value)
    expect(second.pending).toBeLessThan(first.pending)
    expect(second.value + second.pending).toBeCloseTo(26, 6)
  })

  test("snaps tiny pending distance and clamps at bounds", () => {
    expect(integrateQueuedScroll(10, 0.2, 16, 42, 1000)).toEqual({value: 10.2, pending: 0})
    expect(integrateQueuedScroll(999, 500, 16, 42, 1000)).toEqual({value: 1000, pending: 0})
  })
})

describe("div wheel axis lock", () => {
  test("starts a gesture on the dominant axis", () => {
    expect(nextWheelAxis(2, 12, null, null, 100)).toBe("y")
    expect(nextWheelAxis(12, 2, null, null, 100)).toBe("x")
  })

  test("keeps axis through small cross-axis noise", () => {
    expect(nextWheelAxis(5, 3, "y", 100, 112)).toBe("y")
    expect(applyWheelAxisLock(5, 3, "y")).toEqual({x: 0, y: 3, axis: "y"})
  })

  test("unlocks when the cross-axis movement clearly dominates", () => {
    expect(nextWheelAxis(12, 4, "y", 100, 112)).toBe(null)
    expect(nextWheelAxis(4, 12, "x", 100, 112)).toBe(null)
  })

  test("starts a new gesture after the separation window", () => {
    expect(nextWheelAxis(12, 4, "y", 100, 140)).toBe("x")
  })
})
