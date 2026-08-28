import {describe, expect, test} from "bun:test"
import {basename, join, resolve} from "node:path"

const repositoryRoot = resolve(import.meta.dir, "../..")

describe("UI repository boundaries", () => {
  test("keeps every TypeScript filename lowercase kebab-case", async () => {
    const glob = new Bun.Glob("packages/**/*.{ts,tsx}")
    for await (const path of glob.scan({cwd: repositoryRoot, onlyFiles: true})) {
      if (path.includes("/node_modules/")) continue
      const name = basename(path)
      const stem = name.endsWith(".d.ts")
        ? name.slice(0, -5)
        : name.endsWith(".test.tsx") || name.endsWith(".spec.tsx")
          ? name.slice(0, -9)
        : name.endsWith(".test.ts") || name.endsWith(".spec.ts")
          ? name.slice(0, -8)
          : name.endsWith(".tsx") ? name.slice(0, -4) : name.slice(0, -3)
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
      "@zavx0z/react": "link:@zavx0z/react",
      "@zavx0z/template": "link:@zavx0z/template",
    })
    expect(components.dependencies["@engine/core"]).toBeUndefined()
    expect(components.dependencies["@layout/core"]).toBeUndefined()
    expect(components.dependencies["@ui/elements"]).toBeUndefined()

    const storybook = await Bun.file(join(repositoryRoot, "packages/storybook/package.json")).json() as {
      dependencies: Record<string, string>
    }
    expect(storybook.dependencies["@engine/core"]).toBe("link:@engine/core")
    expect(storybook.dependencies["@zavx0z/template"]).toBe("link:@zavx0z/template")
    expect(storybook.dependencies["@layout/core"]).toBeUndefined()
    expect(storybook.dependencies["@ui/elements"]).toBeUndefined()
    expect(storybook.dependencies["@ui/hud"]).toBeUndefined()
  })

  test("publishes one natural TSX owner per exact component subpath", async () => {
    const componentsRoot = join(repositoryRoot, "packages/components")
    const components = await Bun.file(join(componentsRoot, "package.json")).json() as {
      exports: Record<string, string>
    }
    expect(components.exports).toEqual({
      "./button": "./button.tsx",
      "./field": "./field.tsx",
      "./pane": "./pane.tsx",
      "./checkbox": "./checkbox.tsx",
      "./badge": "./badge.tsx",
      "./typography": "./typography.tsx",
      "./text-field": "./text-field.tsx",
      "./control-group": "./control-group.tsx",
      "./number-input": "./number-input.tsx",
      "./integer-input": "./integer-input.tsx",
      "./color-input": "./color-input.tsx",
      "./vector-input": "./vector-input.tsx",
      "./matrix-input": "./matrix-input.tsx",
      "./reference-input": "./reference-input.tsx",
      "./enum-input": "./enum-input.tsx",
      "./collection-input": "./collection-input.tsx",
      "./path-input": "./path-input.tsx",
      "./switcher": "./switcher.tsx",
      "./progress-checkbox": "./progress-checkbox.tsx",
      "./slider-control": "./slider-control.tsx",
      "./divider": "./divider.tsx",
      "./list": "./list.tsx",
      "./table": "./table.tsx",
      "./code-editor": "./code-editor.tsx",
      "./inspector": "./inspector.tsx",
      "./hud": "./hud.tsx",
      "./icons": "./icons.ts",
      "./syntax-theme": "./syntax-theme.ts",
      "./theme": "./theme.ts",
    })
    expect(Object.keys(components.exports).some((path) => path.startsWith("./dom/"))).toBeFalse()
    expect(await Bun.file(join(componentsRoot, "index.ts")).exists()).toBeFalse()
    for (const path of Object.values(components.exports)) {
      const source = await Bun.file(join(componentsRoot, path.slice(2))).text()
      expect(path).not.toContain("-component")
      expect(source).not.toMatch(/^export type [A-Za-z]+Component(?:Props)?\b/m)
      expect(source).not.toMatch(/^export function create[A-Z]/m)
      if (path.endsWith(".tsx")) {
        expect(await Bun.file(join(componentsRoot, path.slice(2, -1))).exists(), path).toBeFalse()
      }
      for (const forbidden of ["@engine/core", "@layout/core", "@ui/elements", "@ui/hud", "UiSurface", "UiRuntime"]) {
        expect(source, path).not.toContain(forbidden)
      }
    }
    expect(await Bun.file(join(componentsRoot, "dom")).exists()).toBeFalse()
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
    const adapters = await Bun.file(join(repositoryRoot, "packages/storybook/app/production-component-stories.ts")).text()
    const codeEditorAdapter = await Bun.file(join(
      repositoryRoot,
      "packages/storybook/app/compiled-code-editor-production-story.tsx"
    )).text()
    expect(entry).toContain('from "./production-component-stories.ts"')
    expect(adapters).toContain('from "@ui/components/button"')
    expect(adapters).toContain('from "@ui/components/text-field"')
    expect(adapters).not.toContain("../../components/dom/")
    expect(entry).toContain('from "./compiled-code-editor-production-story.tsx"')
    expect(codeEditorAdapter).toContain('from "@ui/components/code-editor"')
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
