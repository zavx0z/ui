import {describe, expect, test} from "bun:test"
import {join} from "node:path"

const root = import.meta.dir
const removedGenericFiles = Object.freeze([
  "index.ts",
  "router.ts",
  "route-tree.ts",
  "environment.ts",
  "reference.ts",
  "story.ts",
  "layout.ts",
  "surfaces.ts",
  "theme.ts",
  "server.ts",
  "environment.test.ts",
  "reference.test.ts",
  "story.test.ts",
  "layout.test.ts",
  "route-tree.test.ts",
  "router.test.ts",
  "surfaces-retained.test.ts",
  "server.test.ts",
  "workbench-chrome.test.ts",
  "workbench-hierarchy.test.ts",
])
const sharedSubpath = /^@zavx0z\/storybook\/(?:app|build|catalog|environment|references|route-tree|server|stories|workbench)$/

describe("@ui/storybook private application boundary", () => {
  test("has no public package exports or local generic implementation", async () => {
    const manifest = await Bun.file(join(root, "package.json")).json() as Record<string, unknown>
    expect("main" in manifest).toBeFalse()
    expect("types" in manifest).toBeFalse()
    expect("exports" in manifest).toBeFalse()
    const dependencies = manifest.dependencies as Record<string, string>
    expect(dependencies["@layout/core"]).toBeUndefined()
    expect(dependencies["@ui/elements"]).toBeUndefined()

    const build = await Bun.file(join(root, "build.ts")).text()
    for (const forbidden of ["@layout/", "@ui/elements", "UiSurface", "UiRuntime"]) {
      expect(build).not.toContain(forbidden)
    }
    for (const owner of [
      "@zavx0z/dom",
      "@zavx0z/renderer",
      "@zavx0z/renderer-browser",
      "@zavx0z/renderer-webgpu",
    ]) expect(build).toContain(`import.meta.resolve("${owner}")`)

    for (const path of removedGenericFiles) {
      expect(await Bun.file(join(root, path)).exists(), path).toBeFalse()
    }
  })

  test("imports shared contracts only through exact public subpaths", async () => {
    const imports: string[] = []
    for (const directory of ["app"]) {
      const glob = new Bun.Glob("**/*.ts")
      for await (const path of glob.scan({cwd: join(root, directory), onlyFiles: true})) {
        const source = await Bun.file(join(root, directory, path)).text()
        expect(source, `${directory}/${path}`).not.toMatch(/from ["']@ui\/storybook(?:["'/])/)
        for (const match of source.matchAll(/from ["'](@zavx0z\/storybook(?:\/[^"']+)?)['"]/g)) {
          imports.push(match[1]!)
          expect(match[1], `${directory}/${path}`).toMatch(sharedSubpath)
        }
      }
    }
    expect(imports.length).toBeGreaterThan(0)
    expect(imports).not.toContain("@zavx0z/storybook")
  })

  test("keeps the lazy reference catalog owned by the UI application", async () => {
    const rootEntry = await Bun.file(join(root, "app/dom-entry.ts")).text()
    const catalog = await Bun.file(join(root, "reference-catalog.ts")).text()
    expect(rootEntry).toContain('import("../reference-catalog.ts")')
    expect(catalog).toContain('await import("./assets/references/catalog.json"')
    expect(catalog).not.toContain("@zavx0z/storybook")
  })

  test("contains no retained Workbench fallback", async () => {
    for (const path of [
      "app/entry.ts",
      "app/preview.ts",
      "app/overview.ts",
      "app/aggregate.ts",
      "app/aggregate-preview.ts",
      "app/hud-story.ts",
      "app/stories.ts",
    ]) expect(await Bun.file(join(root, path)).exists(), path).toBeFalse()
    const bootstrap = await Bun.file(join(root, "app/bootstrap.ts")).text()
    expect(bootstrap).toBe('await import("./dom-entry.ts")\n')
  })

  test("keeps shared package documentation out of the UI application", async () => {
    const pageRegistry = await Bun.file(join(root, "app/server/page-registry.ts")).text()
    expect(pageRegistry).toContain('from "@zavx0z/storybook/app"')
    expect(pageRegistry).toContain("UI_STORY_ROUTE_TREE")
    expect(pageRegistry).not.toContain('id: "storybook"')
    expect(pageRegistry).not.toContain("fixtures/")
    for (const path of ["fixtures/entry.ts", "fixtures/style.css", "fixtures/stories/button.ts"]) {
      expect(await Bun.file(join(root, path)).exists(), path).toBeFalse()
    }
  })
})
