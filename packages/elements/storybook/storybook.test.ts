import {describe, expect, test} from "bun:test"
import {basename, join} from "node:path"
import {fileURLToPath} from "node:url"
import {planStorybookShell} from "@zavx0z/storybook/workbench"
import {
  ELEMENT_STORIES,
  ELEMENT_STORY_ROUTES,
  elementCatalogItems,
  elementSectionItems,
  elementVariantItems,
} from "./stories.ts"
import {uiShapeMetrics} from "../shape.ts"
import {UI_STORYBOOK_RESPONSIVE_POLICY} from "../../storybook/app/workbench-policy.ts"

const storybookRoot = fileURLToPath(new URL(".", import.meta.url))
describe("@ui/elements package-owned Workbench stories", () => {
  test("derives package and prefix overviews from every exact story leaf", () => {
    expect(ELEMENT_STORIES.routeTree.find("")).toMatchObject({kind: "overview", path: ""})
    expect(ELEMENT_STORIES.routeTree.find("div")).toMatchObject({kind: "overview", path: "div"})
    expect(ELEMENT_STORIES.routeTree.find("div/basic")).toMatchObject({kind: "overview", path: "div/basic"})
    expect(ELEMENT_STORIES.routeTree.find("div/basic/background")).toMatchObject({kind: "leaf"})
    expect(ELEMENT_STORIES.routeTree.find("missing")).toBeUndefined()
    expect(ELEMENT_STORIES.routeTree.leaves).toEqual(ELEMENT_STORY_ROUTES)
  })

  test("catalogs concrete Russian Elements and their real sections", () => {
    const catalog = elementCatalogItems(new Set())
    expect(catalog.map(({id}) => id)).toEqual([
      "div",
      "span",
      "button",
      "input",
      "select",
      "popover",
      "img",
      "list",
      "status-bar",
      "css",
      "theme",
      "pointer",
    ])
    expect(catalog.map(({label}) => label)).toEqual([
      "Контейнер",
      "Строка текста",
      "Кнопка",
      "Текстовый ввод",
      "Выбор значения",
      "Всплывающий слой",
      "Изображение",
      "Список",
      "Строка состояния",
      "CSS-свойства",
      "Тема",
      "Указатель",
    ])
    expect(catalog.map(({group}) => group?.label)).toEqual([
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Примитивы",
      "Стили",
      "Стили",
      "События",
    ])
    expect(catalog.map(({route}) => route)).toEqual(catalog.map(({id}) => id))
    expect(elementSectionItems("div/basic/background").map(({route}) => route)).toEqual([
      "div/basic",
      "div/overflow",
      "div/scroll",
    ])
    expect(elementVariantItems("div/overflow/nested").map(({id}) => id)).toEqual(["nested"])
    expect(elementVariantItems("div/scroll/both").map(({id}) => id)).toEqual(["vertical", "horizontal", "both"])
    expect(elementSectionItems("div/scroll/vertical").map(({id}) => id)).toEqual(["basic", "overflow", "scroll"])
    expect(elementSectionItems("css/border/rounded").map(({id}) => id)).toEqual(["padding", "flex", "border", "color", "typography"])
    expect(elementVariantItems("div/basic/padding").map(({id}) => id)).toEqual(["background", "border", "padding", "z-index"])
    expect(elementVariantItems("select/state/header").map(({id}) => id)).toEqual([
      "inactive", "active", "open", "header", "flipped", "disabled",
    ])
    expect(elementVariantItems("pointer/state/release").map(({id}) => id)).toEqual(["idle", "hover", "press", "release", "click", "disabled"])
  })

  test("loads lazy stories through exact public subpaths and keeps source driven by args", async () => {
    const primitive = await ELEMENT_STORIES.load("button/state/clickable")
    expect(primitive.source(primitive.defaultArgs)).toContain('from "@ui/elements/button"')
    expect(primitive.defaultArgs).toMatchObject({disabled: false, state: "clickable", clicks: 0})
    expect(primitive.source({...primitive.defaultArgs, label: "Запуск", disabled: true})).toContain('children: "Запуск"')
    expect(primitive.source({...primitive.defaultArgs, label: "Запуск", disabled: true})).toContain("disabled: true")
    expect(primitive.defaultArgs).toMatchObject({radius: uiShapeMetrics.lowRadius})

    const input = await ELEMENT_STORIES.load("input/state/inactive")
    expect(input.defaultArgs).toMatchObject({radius: uiShapeMetrics.lowRadius})

    const select = await ELEMENT_STORIES.load("select/state/open")
    expect(select.source(select.defaultArgs)).toContain('from "@ui/elements/select"')
    expect(select.defaultArgs).toMatchObject({label: "Умножение", open: true, radius: uiShapeMetrics.lowRadius})
    expect(select.source(select.defaultArgs)).toContain("options")
    const selectHeader = await ELEMENT_STORIES.load("select/state/header")
    expect(selectHeader.defaultArgs).toMatchObject({open: true, state: "header"})
    expect(selectHeader.source(selectHeader.defaultArgs)).toContain('popupLabel: "Операция"')
    const selectFlipped = await ELEMENT_STORIES.load("select/state/flipped")
    expect(selectFlipped.defaultArgs).toMatchObject({open: true, state: "flipped"})
    const popover = await ELEMENT_STORIES.load("popover/state/open")
    expect(popover.source(popover.defaultArgs)).toContain('from "@ui/elements/popover"')
    expect(popover.defaultArgs).toMatchObject({open: true})
    for (const route of ["button/state/default", "input/state/inactive", "select/state/inactive"] as const) {
      const control = await ELEMENT_STORIES.load(route)
      expect(control.source(control.defaultArgs)).not.toContain("borderColor")
    }

    const style = await ELEMENT_STORIES.load("theme/tone/green")
    expect(style.source(style.defaultArgs)).toContain('from "@ui/elements/theme"')
    expect(style.defaultArgs).toMatchObject({tone: "green"})

    const events = await ELEMENT_STORIES.load("pointer/state/click")
    expect(events.source(events.defaultArgs)).toContain('from "@ui/elements/button"')
    expect(events.defaultArgs).toMatchObject({state: "click", clicks: 1})

    const status = await ELEMENT_STORIES.load("status-bar/content/statistics")
    expect(status.source(status.defaultArgs)).toContain('from "@ui/elements/status-bar"')
    expect(status.source(status.defaultArgs)).toContain("Collection")
    expect(status.defaultArgs).toMatchObject({"highlight-version": false})

    const nestedOverflow = await ELEMENT_STORIES.load("div/overflow/nested")
    expect(nestedOverflow.source(nestedOverflow.defaultArgs)).toContain('from "@layout/core/flex"')
    expect(nestedOverflow.source(nestedOverflow.defaultArgs)).toContain('overflow: "hidden"')
    const bothAxes = await ELEMENT_STORIES.load("div/scroll/both")
    expect(bothAxes.source(bothAxes.defaultArgs)).toContain('overflow: "auto"')
  })

  test("loads every published detail story with non-empty exact code", async () => {
    expect(ELEMENT_STORY_ROUTES).toHaveLength(48)
    for (const route of ELEMENT_STORY_ROUTES) {
      const module = await ELEMENT_STORIES.load(route)
      const source = module.source(module.defaultArgs)
      expect(source.length).toBeGreaterThan(24)
      expect(source).toContain("@ui/elements/")
    }
  })

  test("mounts Elements metadata in the one-root shared interaction panel", async () => {
    const entry = await Bun.file(join(storybookRoot, "../../storybook/app/entry.ts")).text()
    const stories = await Bun.file(join(storybookRoot, "../../storybook/app/stories.ts")).text()
    expect(stories).toContain("ELEMENT_STORIES")
    expect(entry).toContain("StorybookStoryPanelSurface")
    expect(entry).toContain("UiStoryPreviewSurface")
    expect(entry).toContain('title: "UI"')
    expect(entry).toContain("navigator.clipboard.writeText")
    expect(entry).toContain("runtime.handleResize()")
    expect(entry).toContain("runtime.renderer.captureLastPresentedFramePng()")
    expect(entry).toContain("await waitForStorybookFrameBoundary()")
    expect(entry.indexOf("await waitForStorybookFrameBoundary()")).toBeLessThan(
      entry.indexOf('dataset.uiStorybook = "ready"'),
    )
    expect(entry).not.toContain("StorybookInfoSurface")
    expect(entry).not.toContain("elementsStorybookInfo")
    expect(entry).not.toContain("location.assign")
    for (const forbidden of ["NodeEditor", "BlenderSocket", "NodeSystemSurface", "Hamiltonian", "Bulk"]) {
      expect(entry).not.toContain(forbidden)
    }
  })

  test("story modules import production Elements only through exact public leaves", async () => {
    const storyFiles = ["primitives.ts", "popover.ts", "style.ts", "events.ts", "status-bar.ts"]
    const sources = await Promise.all(storyFiles.map((name) => Bun.file(join(storybookRoot, "stories", name)).text()))
    for (const source of sources) {
      expect(source).not.toMatch(/from ["']@ui\/elements["']/)
      expect(source).not.toMatch(/from ["']\.\.\/\.\.\/(?:div|span|button|input|img|list|style|theme)\.ts["']/)
    }
    expect(sources[0]).toContain('from "@ui/elements/div"')
    expect(sources[0]).toContain('from "@ui/elements/list"')
    expect(sources[0]).toContain('from "@ui/elements/select"')
    expect(sources[0]).toContain('import {uiShapeMetrics} from "../../shape.ts"')
    expect(sources[0]!.match(/uiShapeMetrics\.controlHeight/g)?.length).toBe(7)
    expect(sources[0]).not.toContain("240, 52")
    expect(sources[0]).not.toContain("460, 50")
    expect(sources[1]).toContain('from "@ui/elements/popover"')
    expect(sources[2]).toContain('from "@ui/elements/theme"')
    expect(sources[3]).toContain('from "@ui/elements/button"')
    expect(sources[4]).toContain('from "@ui/elements/status-bar"')
  })

  test("keeps story implementations out of the initial split entry", async () => {
    const build = await Bun.build({
      entrypoints: [join(storybookRoot, "../../storybook/app/entry.ts")],
      target: "browser",
      format: "esm",
      splitting: true,
      minify: false,
      sourcemap: "none",
    })
    expect(build.success, build.logs.map(({message}) => message).join("\n")).toBeTrue()
    expect(build.outputs.length).toBeGreaterThan(4)
    const outputs = await Promise.all(build.outputs.map(async (output) => ({
      name: basename(output.path),
      source: await output.text(),
    })))
    const entry = outputs.find(({name}) => name === "entry.js")
    expect(entry).toBeDefined()
    expect(entry!.source).toContain("import(")
    expect(entry!.source).not.toContain("function createPrimitiveStory")
    expect(entry!.source).not.toContain("function createStyleStory")
    expect(entry!.source).not.toContain("function createEventStory")
    expect(entry!.source).not.toContain("function createPopoverStory")
    expect(entry!.source).not.toContain("function createStatusBarStory")
    expect(outputs.some(({source}) => source.includes("function createPrimitiveStory"))).toBeTrue()
    expect(outputs.some(({source}) => source.includes("function createStyleStory"))).toBeTrue()
    expect(outputs.some(({source}) => source.includes("function createEventStory"))).toBeTrue()
    expect(outputs.some(({source}) => source.includes("function createPopoverStory"))).toBeTrue()
    expect(outputs.some(({source}) => source.includes("function createStatusBarStory"))).toBeTrue()
  })

  test("serves detail paths through the central no-HMR UI hub and full desktop shell", async () => {
    const desktop = planStorybookShell(1920, 1080, {responsive: UI_STORYBOOK_RESPONSIVE_POLICY})
    expect(desktop.preview).toEqual({x: 375, y: 3, w: 1101, h: 1049})
    expect(desktop.info).toEqual({x: 1477, y: 3, w: 440, h: 1074})

    const port = await freePort()
    const process = Bun.spawn(["bun", "app/server.ts"], {
      cwd: fileURLToPath(new URL("../../storybook", import.meta.url)),
      env: {...Bun.env, STORYBOOK_PORT: String(port)},
      stdout: "pipe",
      stderr: "pipe",
    })
    try {
      const html = await waitForText(`http://127.0.0.1:${port}/elements/primitives/div/basic/background`)
      expect(html).toContain("<title>UI storybook</title>")
      expect(html).toContain('<canvas id="ui-storybook-canvas"></canvas>')
      expect(html).not.toContain("data-storybook-home")
      const entry = await fetch(`http://127.0.0.1:${port}/@storybook-assets/workbench/entry.js`)
      const source = await entry.text()
      expect(entry.status).toBe(200)
      expect(source).toContain("uiStorybook")
      expect(source).toContain("import(")
      expect(source).not.toContain("function createPrimitiveStory")
    } finally {
      process.kill()
      await process.exited
    }
  }, 30000)
})

async function freePort(): Promise<number> {
  const server = Bun.serve({hostname: "127.0.0.1", port: 0, fetch: () => new Response("probe")})
  const port = server.port
  server.stop(true)
  if (port === undefined) throw new Error("Bun did not allocate a test port")
  return port
}

async function waitForText(url: string): Promise<string> {
  let cause: unknown
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response.text()
      cause = new Error(`HTTP ${response.status}`)
    } catch (error) {
      cause = error
    }
    await Bun.sleep(50)
  }
  throw new Error(`Elements storybook did not start: ${String(cause)}`)
}
