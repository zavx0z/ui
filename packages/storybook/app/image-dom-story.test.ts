import {describe, expect, test} from "bun:test"
import {
  HTMLButtonElement,
  HTMLImageElement,
  createDocument,
} from "@zavx0z/dom"
import {
  IMAGE_DOM_STORY_ARTWORK_SRC,
  IMAGE_DOM_STORY_ICON_SRC,
  createImageDomStory,
  imageDomStoryCss,
  isImageDomStoryRoute,
} from "./image-dom-story.ts"
import {IMAGE_DOM_STORY_ROUTES} from "./dom-routes.ts"

describe("exact DOM image stories", () => {
  test("covers the three final routes with one exact HTMLImageElement realm", async () => {
    expect(IMAGE_DOM_STORY_ROUTES).toEqual([
      "elements/primitives/img/fit/cover",
      "elements/primitives/img/fit/contain",
      "components/foundation/button/icon/svg",
    ])
    for (const route of IMAGE_DOM_STORY_ROUTES) {
      const story = createImageDomStory(createDocument(), route)
      expect(isImageDomStoryRoute(route), route).toBeTrue()
      expect(story.element.localName, route).toBe("section")
      expect(story.refs.image, route).toBeInstanceOf(HTMLImageElement)
      expect(story.source.html, route).toContain("<img")
      expect(story.source.html, route).not.toContain("</img>")
      expect(story.source.css, route).toBe(imageDomStoryCss)
      expect(story.source.typescript, route).toContain('from "@zavx0z/dom"')
      expect(story.source.typescript, route).toContain('document.createElement("img")')
      expect(story.source.typescript, route).toContain(story.refs.image.src)
      expect(Object.isFrozen(story.source), route).toBeTrue()
      expect(Object.isFrozen(story.refs), route).toBeTrue()
    }
    expect(isImageDomStoryRoute("elements/primitives/img/fit/stretch")).toBeFalse()

    const source = await Bun.file(new URL("./image-dom-story.ts", import.meta.url)).text()
    for (const forbidden of [
      "@layout/core",
      "@ui/elements",
      "@zavx0z/renderer",
      "UiSurface",
      "RenderHost",
    ]) {
      expect(source).not.toContain(forbidden)
    }
    expect(imageDomStoryCss).not.toContain("&")
  })

  test("uses explicit CSS boxes and object-fit for cover and contain", () => {
    const cover = createImageDomStory(
      createDocument(),
      "elements/primitives/img/fit/cover",
    )
    const contain = createImageDomStory(
      createDocument(),
      "elements/primitives/img/fit/contain",
    )

    for (const story of [cover, contain]) {
      expect(story.refs.button).toBeNull()
      expect(story.refs.image.src).toBe(IMAGE_DOM_STORY_ARTWORK_SRC)
      expect(story.refs.image.alt).toBe("Абстрактная сцена")
      expect(story.refs.image.width).toBe(320)
      expect(story.refs.image.height).toBe(180)
      expect(story.source.html).toContain('width="320"')
      expect(story.source.html).toContain('height="180"')
      expect(story.source.html).toContain('alt="Абстрактная сцена"')
    }
    expect(cover.refs.image.className).toContain("image-dom-story__image--cover")
    expect(contain.refs.image.className).toContain("image-dom-story__image--contain")
    expect(imageDomStoryCss).toContain("width: 320px;")
    expect(imageDomStoryCss).toContain("height: 180px;")
    expect(imageDomStoryCss).toContain("object-fit: cover;")
    expect(imageDomStoryCss).toContain("object-fit: contain;")
  })

  test("uses a self-contained SVG img as the icon-only button child", () => {
    const story = createImageDomStory(
      createDocument(),
      "components/foundation/button/icon/svg",
    )
    const button = story.refs.button
    const image = story.refs.image

    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button?.children).toEqual([image])
    expect(button?.textContent).toBe("")
    expect(button?.title).toBe("Применить")
    expect(button?.getAttribute("aria-label")).toBe("Применить")
    expect(image).toBeInstanceOf(HTMLImageElement)
    expect(image.src).toBe(IMAGE_DOM_STORY_ICON_SRC)
    expect(image.alt).toBe("")
    expect(image.getAttribute("aria-hidden")).toBe("true")
    expect(image.width).toBe(18)
    expect(image.height).toBe(18)
    expect(story.source.html).toContain('title="Применить"')
    expect(story.source.html).toContain('aria-hidden="true"')
    expect(story.source.typescript).toContain('image.setAttribute("aria-hidden", "true")')
  })

  test("embeds both image sources without network or package asset ownership", () => {
    for (const source of [IMAGE_DOM_STORY_ARTWORK_SRC, IMAGE_DOM_STORY_ICON_SRC]) {
      expect(source).toStartWith("data:image/svg+xml;charset=utf-8,")
      expect(source).not.toContain("http://")
      expect(source).not.toContain("https://")
      const svg = decodeURIComponent(source.slice(source.indexOf(",") + 1))
      expect(svg).toStartWith('<svg xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toEndWith("</svg>")
      expect(svg).not.toContain("<image")
      expect(svg).not.toContain("href=")
    }
  })
})
