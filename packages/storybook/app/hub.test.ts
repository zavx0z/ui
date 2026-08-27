import {describe, expect, test} from "bun:test"
import {fileURLToPath} from "node:url"
import {startStorybookHubServer} from "@zavx0z/storybook/server"
import {engineFontPath} from "../engine-assets.ts"
import {createUiStorybookApp} from "./server/page-registry.ts"
import {
  UI_STORY_ROUTE_TREE,
  loadUiStory,
  uiDockItems,
  uiPrimaryItems,
  uiSecondaryItems,
  uiStoryDescriptor,
  uiStoryPresentationRoute,
} from "./stories.ts"

const hubRoot = fileURLToPath(new URL(".", import.meta.url))
const storybookRoot = fileURLToPath(new URL("..", import.meta.url))

describe("one-root UI Storybook", () => {
  test("uses package groups, categories, components and scenarios", async () => {
    expect(uiPrimaryItems().map(({id, label, route, group}) => ({
      id,
      label,
      route,
      group: group?.label,
    }))).toEqual([
      {id: "elements/primitives", label: "Примитивы", route: "elements/primitives", group: "Элементы"},
      {id: "elements/style", label: "Стили", route: "elements/style", group: "Элементы"},
      {id: "elements/events", label: "События", route: "elements/events", group: "Элементы"},
      {id: "components/foundation/button", label: "Кнопка", route: "components/foundation/button", group: "Компоненты"},
      {id: "components/foundation", label: "Основные", route: "components/foundation", group: "Компоненты"},
      {id: "components/inputs", label: "Ввод", route: "components/inputs", group: "Компоненты"},
      {id: "components/data", label: "Данные", route: "components/data", group: "Компоненты"},
      {id: "hud/foundation", label: "Основные", route: "hud/foundation", group: "HUD"},
    ])
    expect(uiSecondaryItems("elements/primitives").map(({label}) => label)).toEqual([
      "Контейнер",
      "Строка текста",
      "Кнопка",
      "Текстовый ввод",
      "Выбор значения",
      "Всплывающий слой",
      "Изображение",
      "Список",
      "Строка состояния",
    ])
    expect(uiSecondaryItems("components/inputs").map(({label}) => label)).toContain("Поле")
    expect(uiSecondaryItems("components/inputs").map(({label}) => label)).toContain("Ввод матрицы")
    expect(uiSecondaryItems("components/foundation").map(({label}) => label)).not.toContain("Кнопка")
    expect(uiSecondaryItems("components/foundation/button").map(({label}) => label)).toEqual([
      "Основные",
      "Иконка",
      "Иконка и подпись",
      "Размер",
      "Цвет",
    ])
    expect(uiDockItems("components/foundation")).toEqual([])
    expect(uiDockItems("components/foundation/button")).toEqual([])
    expect(uiDockItems("components/foundation/button/basic").map(({label}) => label)).toEqual([
      "Текстовая",
      "Заполненная",
      "Контурная",
    ])

    expect(uiStoryPresentationRoute("")).toBe("")
    expect(uiStoryDescriptor("")).toMatchObject({
      kind: "overview",
      category: {route: "elements/primitives"},
      component: {id: "overview", route: ""},
    })
    expect(uiStoryDescriptor("components/foundation/button")).toMatchObject({kind: "overview"})
    expect(uiStoryDescriptor("components/foundation/button/basic/contained")).toMatchObject({kind: "detail"})
    expect((await loadUiStory("components/foundation/button")).source({}).typescript).toContain("@ui/components/button")
  })

  test("keeps one complete prefixed route tree without a landing page", () => {
    expect(UI_STORY_ROUTE_TREE.find("")).toMatchObject({kind: "overview", path: ""})
    expect(UI_STORY_ROUTE_TREE.find("elements/primitives")).toMatchObject({kind: "overview"})
    expect(UI_STORY_ROUTE_TREE.find("components/foundation/button/basic/contained")).toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("hud/foundation/timeline/inventory/default")).toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("unknown")).toBeUndefined()
  })

  test("registers exactly one canvas page and one runtime contract", () => {
    const app = createUiStorybookApp()
    expect(app.pages).toHaveLength(1)
    expect(app.pages[0]).toMatchObject({
      id: "workbench",
      mountPath: "/",
      capability: "webgpu",
      body: {kind: "canvas", canvasId: "ui-storybook-canvas"},
      canvas: {id: "ui-storybook-canvas", evidence: "non-black"},
    })
    expect(app.pages[0]?.routeTree.leaves).toHaveLength(133)
  })

  test("serves every category through the same no-HMR Workbench page", async () => {
    const server = startStorybookHubServer({
      app: createUiStorybookApp(),
      hostname: "127.0.0.1",
      port: 0,
      staticFiles: [{
        publicPath: "/fonts/jetbrains-mono-bold.ttf",
        sourcePath: engineFontPath(),
      }],
    })
    try {
      const origin = server.url.origin
      for (const route of [
        "/",
        "/elements/",
        "/elements/primitives/",
        "/elements/primitives/div/",
        "/elements/primitives/div/basic/background",
        "/components/",
        "/components/foundation/",
        "/components/foundation/button/basic/contained",
        "/components/data/inspector/basic/default",
        "/hud/",
        "/hud/foundation/timeline/inventory/default",
      ]) {
        const response = await fetch(`${origin}${route}`)
        const html = await response.text()
        expect(response.status, route).toBe(200)
        expect(html, route).toContain("<title>UI storybook</title>")
        expect(html, route).toContain('<canvas id="ui-storybook-canvas"></canvas>')
        expect(html, route).toContain("/@storybook-assets/workbench/entry.js")
        expect(html, route).not.toContain("ui-package-catalog")
        expect(html, route).not.toContain("data-storybook-home")
      }
      for (const [path, location] of [
        ["/elements", "/elements/"],
        ["/components/foundation", "/components/foundation/"],
        ["/hud", "/hud/"],
      ] as const) {
        const response = await fetch(`${origin}${path}`, {redirect: "manual"})
        expect(response.status, path).toBe(308)
        expect(response.headers.get("location"), path).toBe(location)
      }
      for (const path of ["/missing", "/elements/missing", "/components/foundation/missing", "/hud/missing"]) {
        expect(await fetch(`${origin}${path}`).then(({status}) => status), path).toBe(404)
      }
      const entry = await fetch(`${origin}/@storybook-assets/workbench/entry.js`)
      const source = await entry.text()
      expect(entry.status).toBe(200)
      expect(source).toContain("UiStoryPreviewSurface")
      expect(source).toContain("UiAggregateTileSurface")
      expect(source).toContain("__elementsStoryControlBridge")
      expect(source).toContain("__componentsStoryControlBridge")
      expect(source).toContain("import(")
      expect(source).not.toContain("function createButtonStory")
      expect(source).not.toContain("function createPrimitiveStory")
    } finally {
      server.stop(true)
    }
  }, 30_000)

  test("keeps package-owned implementations lazy in the root split bundle", async () => {
    const build = await Bun.build({
      entrypoints: [`${hubRoot}/entry.ts`],
      target: "browser",
      format: "esm",
      splitting: true,
      minify: false,
      sourcemap: "none",
    })
    expect(build.success, build.logs.map(({message}) => message).join("\n")).toBeTrue()
    const sources = await Promise.all(build.outputs.map((output) => output.text()))
    const entry = sources.find((source) => source.includes("UiStoryPreviewSurface"))
    expect(entry).toBeDefined()
    expect(entry).not.toContain("function createButtonStory")
    expect(entry).not.toContain("function createPrimitiveStory")
    expect(sources.some((source) => source.includes("function createButtonStory"))).toBeTrue()
    expect(sources.some((source) => source.includes("function createPrimitiveStory"))).toBeTrue()
  })

  test("keeps the runnable package-named with an automatic port", async () => {
    const source = await Bun.file(`${storybookRoot}/app/server.ts`).text()
    expect(source).toContain("startStorybookPackageServer")
    expect(source).not.toContain("port:")
    expect(source).not.toMatch(/UI_STORYBOOK_(?:HOST|PORT)/u)
  })
})
