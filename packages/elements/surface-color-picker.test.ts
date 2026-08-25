import {beforeAll, describe, expect, test} from "bun:test"
import {
  BufferGeometry,
  Color,
  ColorPickerMaterial,
  Mesh,
  Object3D,
  type TrueTypeFont,
} from "@engine/core"
import {loadSharedFont} from "@engine/core/default-font"
import type {UiRuntime} from "@layout/core/runtime"
import {UiSurface} from "@layout/core/surface"

class ColorPickerTestSurface extends UiSurface {
  createParent(): Object3D {
    return this.createRetainedParent()
  }

  materialize(parent: Object3D, draw: () => void): void {
    this.materializeRetainedParent(parent, draw)
  }

  transform(parent: Object3D, update: (parent: Object3D) => void): void {
    this.updateRetainedTransform(parent, update)
  }

  protected render(): void {}
}

type FakeRuntime = Readonly<{
  runtime: UiRuntime
  invalidated: BufferGeometry[]
}>

const fakeRuntime = (): FakeRuntime => {
  const invalidated: BufferGeometry[] = []
  const runtime = {
    canvas: {style: {}},
    renderer: {
      pixelRatio: 1,
      invalidateGeometry: (geometry: BufferGeometry) => invalidated.push(geometry),
    },
    requestRender() {},
    uiRectToFramebufferClipBounds: (x0: number, y0: number, x1: number, y1: number) => [x0, y0, x1, y1],
  } as unknown as UiRuntime
  return {runtime, invalidated}
}

let font: TrueTypeFont

beforeAll(async () => {
  font = await loadSharedFont(import.meta.resolve("@engine/core/fonts/jetbrains-mono-bold.ttf"))
})

describe("UiSurface color picker plane", () => {
  test("keeps one quad stable through transform and disposes each rematerialized geometry once", () => {
    const fake = fakeRuntime()
    const surface = new ColorPickerTestSurface()
    surface.attachCanvas(fake.runtime)
    surface.setRect({x: 0, y: 0, w: 200, h: 180}, 0.001, font)
    fake.invalidated.length = 0
    const parent = surface.createParent()
    const draw = (): void => surface.drawColorPickerPlane(10, 20, 100, 100, {
      mode: "wheel",
      hue: 0.2,
      saturation: 0.4,
      value: 0.8,
      alpha: 0.6,
      checkerPrimary: new Color(0.2, 0.2, 0.2, 1),
      checkerSecondary: new Color(0.15, 0.15, 0.15, 1),
      checkerSize: 8,
    })

    surface.materialize(parent, draw)
    expect(parent.children).toHaveLength(1)
    const first = parent.children[0] as Mesh
    const firstGeometry = first.geometry
    expect(first.material).toBeInstanceOf(ColorPickerMaterial)
    expect((first.material as ColorPickerMaterial).checkerSize).toBe(0.008)

    surface.transform(parent, (target) => target.position.set(0.04, -0.03, 0))
    expect(parent.children).toEqual([first])
    expect(first.geometry).toBe(firstGeometry)
    expect(fake.invalidated).toHaveLength(0)

    surface.materialize(parent, draw)
    expect(parent.children).toHaveLength(1)
    expect((parent.children[0] as Mesh).geometry).not.toBe(firstGeometry)
    expect(fake.invalidated).toEqual([firstGeometry])
    const secondGeometry = (parent.children[0] as Mesh).geometry

    surface.dispose()
    expect(fake.invalidated.filter((geometry) => geometry === secondGeometry)).toHaveLength(1)
  })
})
