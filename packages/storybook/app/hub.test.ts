import {describe, expect, test} from "bun:test"
import {fileURLToPath} from "node:url"
import {mkdtemp, readdir, readFile, rm} from "node:fs/promises"
import {tmpdir} from "node:os"
import {join} from "node:path"
import {startStorybookHubServer} from "@zavx0z/storybook/server"
import {engineFontPath} from "../engine-assets.ts"
import {createUiStorybookApp} from "./server/page-registry.ts"
import {
  UI_STORY_ROUTE_TREE,
  uiDockItems,
  uiPrimaryItems,
  uiSecondaryItems,
  uiStoryDescriptor,
} from "./dom-story-navigation.ts"

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
      {id: "dom/interfaces", label: "Интерфейсы", route: "dom/interfaces", group: "DOM"},
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

    expect(uiStoryDescriptor("")).toMatchObject({
      kind: "overview",
      category: {route: "elements/primitives"},
      component: {id: "overview", route: ""},
    })
    expect(uiStoryDescriptor("components/foundation/button")).toMatchObject({kind: "overview"})
    expect(uiStoryDescriptor("components/foundation/button/basic/contained")).toMatchObject({kind: "detail"})
    expect(uiStoryDescriptor("components/foundation/button/basic/contained").apiName).toBe("Button")
  })

  test("keeps one complete prefixed route tree without a landing page", () => {
    expect(UI_STORY_ROUTE_TREE.find("")).toMatchObject({kind: "overview", path: ""})
    expect(UI_STORY_ROUTE_TREE.find("elements/primitives")).toMatchObject({kind: "overview"})
    expect(UI_STORY_ROUTE_TREE.find("components/foundation/button/basic/contained")).toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("dom/interfaces/html-element/title/default")).toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("dom/interfaces/html-table-cell-element/cell/default"))
      .toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("dom/interfaces/composition-event/data/default"))
      .toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("hud/foundation/timeline/inventory/default")).toMatchObject({kind: "leaf"})
    expect(UI_STORY_ROUTE_TREE.find("unknown")).toBeUndefined()
  })

  test("registers exactly one canvas page and one runtime contract", () => {
    const app = createUiStorybookApp()
    expect(app.pages).toHaveLength(1)
    expect(app.footer).toEqual({
      lead: "Создано для",
      owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"},
      detail: "переиспользуемая WebGPU-инфраструктура UI",
    })
    expect(app.pages[0]).toMatchObject({
      id: "workbench",
      mountPath: "/",
      capability: "webgpu",
      body: {kind: "canvas", canvasId: "ui-storybook-canvas"},
      canvas: {id: "ui-storybook-canvas", evidence: "non-black"},
    })
    expect(app.pages[0]?.routeTree.leaves).toHaveLength(176)
  })

  test("wires the sixth DOM Workbench region through addressed status state", async () => {
    const entry = await Bun.file(`${hubRoot}/dom-entry.ts`).text()
    expect(entry).toContain("createStorybookDomWorkbench")
    expect(entry).toContain('status: {')
    expect(entry).toContain('detail: " · HTML DOM → WebGPU"')
    expect(entry).not.toContain("StorybookStatusBarSurface")
    expect(entry).not.toContain("UiSurface")
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
        "/dom/interfaces/html-element/title/default",
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
        expect(html, route).toContain('name="storybook-status-bar-lead" content="Создано для"')
        expect(html, route).toContain('name="storybook-status-bar-owner" content="MetaFor"')
        expect(html, route).toContain('name="storybook-status-bar-detail" content="переиспользуемая WebGPU-инфраструктура UI"')
        expect(html, route).not.toContain("data-storybook-footer")
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
    } finally {
      server.stop(true)
    }
  }, 30_000)

  test("keeps package-owned implementations lazy in the root split bundle", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "ui-storybook-dom-build-"))
    try {
      const build = Bun.spawnSync([
        "bun",
        "build",
        `${hubRoot}/bootstrap.ts`,
        "--target",
        "browser",
        "--splitting",
        "--outdir",
        outputDirectory,
      ], {cwd: storybookRoot, stdout: "pipe", stderr: "pipe"})
      expect(build.exitCode, build.stderr.toString()).toBe(0)
      const sources = await Promise.all((await readdir(outputDirectory))
        .filter((name) => name.endsWith(".js"))
        .map((name) => readFile(join(outputDirectory, name), "utf8")))
      const bootstrap = sources.find((source) => source.includes("await import("))
      expect(bootstrap).toBeDefined()
      expect(bootstrap).not.toContain("UiStoryPreviewSurface")
      expect(bootstrap).not.toContain("createStorybookDomWorkbench")
      const documentEntry = sources.find((source) => source.includes("createStorybookDomWorkbench"))
      expect(documentEntry).toBeDefined()
      expect(documentEntry).toContain("components/data/inspector/basic/default")
      expect(documentEntry).toContain("function createButtonStory")
      expect(documentEntry).not.toContain("UiStoryPreviewSurface")
      expect(documentEntry).not.toContain("function createPrimitiveStory")
      expect(sources.some((source) => source.includes("UiStoryPreviewSurface"))).toBeFalse()
      expect(sources.some((source) => source.includes("function createPrimitiveStory"))).toBeFalse()
      const combined = sources.join("\n")
      for (const forbidden of ["@layout/core", "@ui/elements", "UiSurface", "UiRuntime"]) {
        expect(combined).not.toContain(forbidden)
      }
    } finally {
      await rm(outputDirectory, {recursive: true, force: true})
    }
  })

  test("keeps the runnable package-named with an automatic port", async () => {
    const source = await Bun.file(`${storybookRoot}/app/server.ts`).text()
    expect(source).toContain("startStorybookPackageServer")
    expect(source).not.toContain("port:")
    expect(source).not.toMatch(/UI_STORYBOOK_(?:HOST|PORT)/u)
  })
})
