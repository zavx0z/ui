import {describe, expect, test} from "bun:test"
import {join} from "node:path"
import {fileURLToPath} from "node:url"
import {startStorybookHubServer} from "@zavx0z/storybook/server"
import {COMPONENT_STORIES} from "../../components/storybook/stories.ts"
import {ELEMENT_STORIES} from "../../elements/storybook/stories.ts"
import {UI_PACKAGE_CATALOG} from "./catalog/package-catalog.ts"
import {mountedStoryRepresentativeRoute} from "./mounted-story-page.ts"
import {
  createUiStorybookApp,
  createUiStorybookPages,
  uiStorybookPageFiles,
} from "./server/page-registry.ts"
import {engineFontPath} from "../engine-assets.ts"

const hubRoot = fileURLToPath(new URL(".", import.meta.url))
const storybookRoot = fileURLToPath(new URL("..", import.meta.url))

describe("central UI storybook hub", () => {
  test("keeps overview pathname separate from the representative Workbench story", () => {
    expect(mountedStoryRepresentativeRoute(ELEMENT_STORIES, "")).toBe("div/basic/background")
    expect(mountedStoryRepresentativeRoute(ELEMENT_STORIES, "div")).toBe("div/basic/background")
    expect(mountedStoryRepresentativeRoute(ELEMENT_STORIES, "div/scroll")).toBe("div/scroll/vertical")
    expect(mountedStoryRepresentativeRoute(ELEMENT_STORIES, "div/scroll/horizontal")).toBe("div/scroll/horizontal")
    expect(mountedStoryRepresentativeRoute(COMPONENT_STORIES, "")).toBe("button/basic/contained")
    expect(mountedStoryRepresentativeRoute(COMPONENT_STORIES, "button")).toBe("button/basic/contained")
    expect(mountedStoryRepresentativeRoute(COMPONENT_STORIES, "button/icon")).toBe("button/icon/svg")
    expect(() => mountedStoryRepresentativeRoute(COMPONENT_STORIES, "missing")).toThrow("Unknown mounted storybook route")
  })

  test("catalogs every UI package without inventing a HUD visual stand", async () => {
    expect(UI_PACKAGE_CATALOG.map(({id, routePrefix, defaultRoute, presentation}) => ({
      id,
      routePrefix,
      defaultRoute,
      presentation,
    }))).toEqual([
      {id: "elements", routePrefix: "/elements", defaultRoute: "/elements/", presentation: "webgpu"},
      {id: "components", routePrefix: "/components", defaultRoute: "/components/", presentation: "webgpu"},
      {id: "hud", routePrefix: "/hud", defaultRoute: "/hud/", presentation: "dom"},
    ])
    const hudBody = await Bun.file(join(hubRoot, "packages/hud/hud-storybook-body.html")).text()
    const hudEntry = await Bun.file(join(hubRoot, "packages/hud/hud-storybook.ts")).text()
    expect(hudBody).toContain("Отдельная визуальная витрина Storybook для HUD пока не реализована")
    expect(hudBody).toContain("не создаёт UiRuntime")
    expect(hudBody).not.toContain("node-view")
    expect(hudEntry).not.toContain("представление нод")
    expect(hudEntry).not.toContain("UiRuntime")
    expect(hudEntry).not.toContain("canvas")
  })

  test("registers one catalog and three independently built package pages", () => {
    const app = createUiStorybookApp()
    const pages = createUiStorybookPages()
    expect(pages.map(({id, mountPath}) => [id, mountPath])).toEqual([
      ["catalog", "/"],
      ["elements", "/elements"],
      ["components", "/components"],
      ["hud", "/hud"],
    ])
    expect(pages.every(({manifest}) => manifest.routeTree !== null)).toBeTrue()
    expect(pages.find(({id}) => id === "elements")?.manifest.routeTree.leaves).toHaveLength(47)
    expect(pages.find(({id}) => id === "components")?.manifest.routeTree.leaves).toHaveLength(81)
    expect(pages.find(({id}) => id === "hud")?.manifest.routeTree.leaves).toEqual([])
    expect(app.home.label).toBe("Главная")
    expect(app.footer).toEqual({
      lead: "Создано для",
      owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"},
      detail: "переиспользуемая WebGPU-инфраструктура UI",
    })
    expect(uiStorybookPageFiles("elements").body).toEqual({kind: "canvas", canvasId: "stage-canvas"})
    expect(uiStorybookPageFiles("components").body).toEqual({kind: "canvas", canvasId: "stage-canvas"})
    expect(uiStorybookPageFiles("hud").body.kind).toBe("html")
  })

  test("keeps the existing Workbench mounted on overview and leaf routes", async () => {
    const elements = await Bun.file(join(storybookRoot, "../elements/storybook/entry.ts")).text()
    const components = await Bun.file(join(storybookRoot, "../components/storybook/entry.ts")).text()
    const mounted = await Bun.file(join(hubRoot, "mounted-story-page.ts")).text()

    expect(elements).toContain('const ELEMENTS_MOUNT_PATH = storybookPublicPath("ui", "/elements")')
    expect(elements).toContain("createMountedStoryRouter<ElementsStoryRoute>")
    expect(elements).toContain("runtime.addSurface(preview")
    expect(elements).toContain("runtime.addSurface(storyPanel")
    expect(components).toContain('const COMPONENTS_MOUNT_PATH = storybookPublicPath("ui", "/components")')
    expect(components).toContain("createMountedStoryRouter<ComponentsStoryRoute>")
    expect(components).toContain("runtime.addSurface(preview")
    expect(components).toContain("runtime.addSurface(storyPanel")
    expect(mounted).toContain("new StorybookRouteTreeRouter(routeTree, {basePath})")
    expect(mounted).toContain("representativeDetailRoute")
    expect(mounted).not.toContain("StorybookOverviewSurface")
  })

  test("serves canonical package overviews, exact leaves and isolated page assets on one origin", async () => {
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
      const catalog = await fetch(`${origin}/`)
      const catalogHtml = await catalog.text()
      expect(catalog.status).toBe(200)
      expect(catalogHtml).toContain("<title>UI storybook</title>")
      expect(catalogHtml).toContain('<meta name="engine-default-font" content="/fonts/jetbrains-mono-bold.ttf">')
      expect(catalogHtml).toContain('id="ui-package-catalog"')
      expect(catalogHtml).not.toContain("MetaFor · UI")

      for (const [path, location] of [
        ["/elements", "/elements/"],
        ["/elements/div", "/elements/div/"],
        ["/components", "/components/"],
        ["/hud", "/hud/"],
      ] as const) {
        const response = await fetch(`${origin}${path}`, {redirect: "manual"})
        expect(response.status, path).toBe(308)
        expect(response.headers.get("location"), path).toBe(location)
      }

      for (const [path, title, marker, pageId] of [
        ["/elements/", "@ui/elements", 'id="stage-canvas"', "elements"],
        ["/elements/div/", "@ui/elements", 'id="stage-canvas"', "elements"],
        ["/elements/div/basic/background", "@ui/elements", 'id="stage-canvas"', "elements"],
        ["/components/", "@ui/components", 'id="stage-canvas"', "components"],
        ["/components/button/basic/contained", "@ui/components", 'id="stage-canvas"', "components"],
        ["/hud/", "@ui/hud", 'id="ui-hud-overview"', "hud"],
      ] as const) {
        const response = await fetch(`${origin}${path}`)
        const html = await response.text()
        expect(response.status, path).toBe(200)
        expect(html, path).toContain(`<title>UI storybook · ${title}</title>`)
        expect(html, path).toContain(marker)
        expect(html, path).toContain(`/@storybook-assets/${pageId}/entry.js`)
        expect(html, path).toContain('data-storybook-home href="/"')
        expect(html, path).toContain(">Главная</a>")
        expect(html, path).toContain("Создано для&nbsp;<a")
        expect(html, path).toContain("переиспользуемая WebGPU-инфраструктура UI")
        expect(html, path).not.toContain("Built for MetaFor")
      }

      for (const path of [
        "/missing",
        "/elements/missing",
        "/components/button/missing",
        "/storybook/",
        "/storybook/overview",
        "/hud/missing",
      ]) expect(await fetch(`${origin}${path}`).then(({status}) => status), path).toBe(404)

      const [catalogEntry, hudEntry, elementsEntry, componentsEntry] = await Promise.all(
        ["catalog", "hud", "elements", "components"].map(async (pageId) => {
          const response = await fetch(`${origin}/@storybook-assets/${pageId}/entry.js`)
          expect(response.status, pageId).toBe(200)
          return response.text()
        }),
      )
      expect(catalogEntry).toContain("uiPackageCount")
      expect(catalogEntry).not.toContain("UiRuntime")
      expect(catalogEntry).toContain("loadStorybookReferenceCatalog")
      expect(catalogEntry).toBeDefined()
      const referenceImport = catalogEntry!.match(/import\(["']([^"']+\.js)["']/)?.[1]
      expect(referenceImport).toBeDefined()
      const referenceChunk = await fetch(new URL(referenceImport!, `${origin}/@storybook-assets/catalog/entry.js`))
        .then((response) => response.text())
      expect(referenceChunk).toContain("schemaVersion")
      expect(referenceChunk).toContain("references")
      expect(hudEntry).toContain("hudStorybook")
      expect(hudEntry).not.toContain("UiRuntime")
      expect(elementsEntry).toContain("elementsStorybook")
      expect(elementsEntry).not.toContain("componentsStorybook")
      expect(componentsEntry).toContain("componentsStorybook")
    } finally {
      server.stop(true)
    }
  }, 30_000)

  test("keeps the runnable hub package-named with an automatic port", async () => {
    const source = await Bun.file(join(hubRoot, "server.ts")).text()
    expect(source).toContain("startStorybookPackageServer")
    expect(source).not.toContain("port:")
    expect(source).not.toMatch(/UI_STORYBOOK_(?:HOST|PORT)/u)
    expect(source).not.toContain("7901")
    expect(source).not.toContain("4192")
  })

  test("removes parallel package servers and exposes one root command", async () => {
    for (const path of [
      "../elements/storybook/server.ts",
      "../components/storybook/server.ts",
      "fixtures/server.ts",
    ]) expect(await Bun.file(join(storybookRoot, path)).exists(), path).toBeFalse()
    const manifest = await Bun.file(join(storybookRoot, "package.json")).json() as {scripts?: Record<string, string>}
    const elements = await Bun.file(join(storybookRoot, "../elements/package.json")).json() as {scripts?: Record<string, string>}
    const components = await Bun.file(join(storybookRoot, "../components/package.json")).json() as {scripts?: Record<string, string>}
    expect(manifest.scripts?.storybook).toBe("bun app/server.ts")
    expect(manifest.scripts?.check).toBe("bun run typecheck && bun run test && bun run build")
    expect(elements.scripts?.storybook).toBeUndefined()
    expect(components.scripts?.storybook).toBeUndefined()
  })
})
