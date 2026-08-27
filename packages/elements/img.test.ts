import {describe, expect, test} from "bun:test"
import {UiSurface} from "@layout/core/surface"
import {img} from "./img.ts"

type ImageCall = Parameters<UiSurface["drawImage"]>

class RecordingSurface extends UiSurface {
  readonly images: ImageCall[] = []

  override drawImage(...args: ImageCall): void { this.images.push(args) }
  protected render(): void {}
}

describe("img element style", () => {
  test("applies caller opacity to its image draw", () => {
    const surface = new RecordingSurface()

    img(surface, 1, 2, 30, 40, {
      src: "image.png",
      fit: "cover",
      style: {opacity: 0.35},
    })

    expect(surface.images[0]).toMatchObject(["image.png", 1, 2, 30, 40, {fit: "cover", opacity: 0.35}])
  })
})
