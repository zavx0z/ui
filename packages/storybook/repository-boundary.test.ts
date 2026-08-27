import {describe, expect, test} from "bun:test"
import {basename, join, resolve} from "node:path"

const repositoryRoot = resolve(import.meta.dir, "../..")

describe("UI repository boundaries", () => {
  test("keeps every TypeScript filename lowercase kebab-case", async () => {
    const glob = new Bun.Glob("packages/**/*.ts")
    for await (const path of glob.scan({cwd: repositoryRoot, onlyFiles: true})) {
      if (path.includes("/node_modules/")) continue
      const name = basename(path)
      const stem = name.endsWith(".d.ts")
        ? name.slice(0, -5)
        : name.endsWith(".test.ts") || name.endsWith(".spec.ts")
          ? name.slice(0, -8)
          : name.slice(0, -3)
      expect(stem, path).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  test("keeps retired package boundaries out of the final production graph", async () => {
    const root = await Bun.file(join(repositoryRoot, "package.json")).json() as {
      dependencies: Record<string, string>
    }
    expect(root.dependencies).toEqual({"@ui/components": "workspace:*"})
    expect(await Bun.file(join(repositoryRoot, "packages/hud/package.json")).exists()).toBeFalse()

    const components = await Bun.file(join(repositoryRoot, "packages/components/package.json")).json() as {
      description: string
      metafor: string
      dependencies: Record<string, string>
    }
    expect(components.description).toContain("Built for MetaFor")
    expect(components.metafor).toBe("https://github.com/zavx0z/metafor")
    expect(components.dependencies).toEqual({
      "@zavx0z/dom": "link:@zavx0z/dom",
      "@zavx0z/highlighter": "link:@zavx0z/highlighter",
    })
    expect(components.dependencies["@engine/core"]).toBeUndefined()
    expect(components.dependencies["@layout/core"]).toBeUndefined()
    expect(components.dependencies["@ui/elements"]).toBeUndefined()

    const storybook = await Bun.file(join(repositoryRoot, "packages/storybook/package.json")).json() as {
      dependencies: Record<string, string>
    }
    expect(storybook.dependencies["@engine/core"]).toBe("link:@engine/core")
    expect(storybook.dependencies["@layout/core"]).toBeUndefined()
    expect(storybook.dependencies["@ui/elements"]).toBeUndefined()
    expect(storybook.dependencies["@ui/hud"]).toBeUndefined()
  })

  test("publishes only six DOM owners through natural exact subpaths", async () => {
    const componentsRoot = join(repositoryRoot, "packages/components")
    const components = await Bun.file(join(componentsRoot, "package.json")).json() as {
      exports: Record<string, string>
    }
    expect(components.exports).toEqual({
      "./field": "./field.ts",
      "./code-editor": "./code-editor.ts",
      "./inspector": "./inspector.ts",
      "./hud": "./hud.ts",
      "./icons": "./icons.ts",
      "./syntax-theme": "./syntax-theme.ts",
    })
    expect(Object.keys(components.exports).some((path) => path.startsWith("./dom/"))).toBeFalse()
    expect(await Bun.file(join(componentsRoot, "index.ts")).exists()).toBeFalse()
    for (const path of Object.values(components.exports)) {
      const source = await Bun.file(join(componentsRoot, path.slice(2))).text()
      for (const forbidden of ["@engine/core", "@layout/core", "@ui/elements", "@ui/hud", "UiSurface", "UiRuntime"]) {
        expect(source, path).not.toContain(forbidden)
      }
    }
  })

  test("keeps shared Storybook imports in dev-only owner directories", async () => {
    const rootManifest = await Bun.file(join(repositoryRoot, "package.json")).json() as {
      devDependencies: Record<string, string>
    }
    const storybookManifest = await Bun.file(join(repositoryRoot, "packages/storybook/package.json")).json() as {
      dependencies: Record<string, string>
    }
    expect(rootManifest.devDependencies["@zavx0z/storybook"]).toBe("link:@zavx0z/storybook")
    expect(storybookManifest.dependencies["@zavx0z/storybook"]).toBe("link:@zavx0z/storybook")

    const componentsRoot = join(repositoryRoot, "packages/components")
    const manifest = await Bun.file(join(componentsRoot, "package.json")).json() as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      exports: Record<string, string>
    }
    expect(manifest.dependencies?.["@zavx0z/storybook"]).toBeUndefined()
    expect(manifest.devDependencies?.["@zavx0z/storybook"]).toBeUndefined()
    const entry = await Bun.file(join(repositoryRoot, "packages/storybook/app/dom-entry.ts")).text()
    expect(entry).toContain('from "../../components/dom/button-story.ts"')
    expect(entry).toContain('from "@ui/components/code-editor"')
    expect(entry).not.toContain("@ui/components/dom/")
    expect(Object.keys(manifest.exports).some((path) => path.startsWith("./dom/"))).toBeFalse()
  })

  test("keeps deployment disabled until immutable final dependencies exist", async () => {
    expect(await Bun.file(join(repositoryRoot, ".github/workflows/pages.yml")).exists()).toBeFalse()
    const lock = await Bun.file(join(repositoryRoot, "bun.lock")).text()
    expect(lock).toContain('"@zavx0z/storybook": "link:@zavx0z/storybook"')
  })

  test("keeps public attribution explicit without a runtime MetaFor dependency", async () => {
    for (const path of ["README.md", "ARCHITECTURE.md", "CONTRIBUTING.md"]) {
      const source = await Bun.file(join(repositoryRoot, path)).text()
      expect(source).toContain("Built for MetaFor")
      expect(source).toContain("https://github.com/zavx0z/metafor")
    }
    const server = await Bun.file(join(repositoryRoot, "packages/storybook/app/server.ts")).text()
    const registry = await Bun.file(join(repositoryRoot, "packages/storybook/app/server/page-registry.ts")).text()
    expect(server).not.toContain("data-storybook-brand")
    expect(server).toContain("startStorybookPackageServer")
    expect(registry).toContain('lead: "Создано для"')
    expect(registry).toContain('owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"}')
    expect(registry).toContain('detail: "переиспользуемая WebGPU-инфраструктура UI"')
    expect(registry).not.toContain("Built for MetaFor")
    expect(registry).toContain('canvasId: "ui-storybook-canvas"')
    expect(registry).toContain("UI_STORY_ROUTE_TREE")
  })
})
