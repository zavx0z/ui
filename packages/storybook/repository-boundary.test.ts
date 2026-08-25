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

  test("keeps Layout ownership direct and absent from Elements exports", async () => {
    const elementsRoot = join(repositoryRoot, "packages/elements")
    const manifest = await Bun.file(join(elementsRoot, "package.json")).json() as {
      exports: Record<string, string>
      dependencies: Record<string, string>
    }
    for (const removed of ["./runtime", "./surface", "./targets", "./flex", "./flex-css", "./polyline", "./virtual-input"]) {
      expect(manifest.exports).not.toHaveProperty(removed)
    }
    expect(manifest.dependencies["@layout/core"]).toBe("link:@layout/core")
    const index = await Bun.file(join(elementsRoot, "index.ts")).text()
    expect(index).not.toMatch(/from "@layout\/core/)

    for (const removed of [
      "runtime.ts",
      "surface.ts",
      "flex.ts",
      "flex.types.ts",
      "flex-css.ts",
      "polyline.ts",
      "popover-owner.ts",
      "virtual-input.ts",
      "targets",
    ]) expect(await Bun.file(join(elementsRoot, removed)).exists(), removed).toBeFalse()
  })

  test("uses only global package links for cross-repository owners", async () => {
    for (const path of [
      "package.json",
      "packages/elements/package.json",
      "packages/components/package.json",
      "packages/hud/package.json",
      "packages/storybook/package.json",
    ]) {
      const manifest = await Bun.file(join(repositoryRoot, path)).json() as {
        description: string
        metafor: string
        dependencies: Record<string, string>
      }
      expect(manifest.description).toContain("Built for MetaFor")
      expect(manifest.metafor).toBe("https://github.com/zavx0z/metafor")
      expect(manifest.dependencies["@engine/core"]).toBe("link:@engine/core")
      expect(manifest.dependencies["@layout/core"]).toBe("link:@layout/core")
    }

    for (const path of ["package.json", "packages/elements/package.json", "packages/components/package.json"]) {
      const manifest = await Bun.file(join(repositoryRoot, path)).json() as {
        dependencies: Record<string, string>
      }
      expect(manifest.dependencies["@zavx0z/highlighter"]).toBe("link:@zavx0z/highlighter")
    }
  })

  test("publishes code owners only through exact subpaths", async () => {
    const elementsRoot = join(repositoryRoot, "packages/elements")
    const componentsRoot = join(repositoryRoot, "packages/components")
    const elements = await Bun.file(join(elementsRoot, "package.json")).json() as {exports: Record<string, string>}
    const components = await Bun.file(join(componentsRoot, "package.json")).json() as {exports: Record<string, string>}
    expect(elements.exports["./code"]).toBe("./code.ts")
    expect(elements.exports["./text-selection"]).toBe("./text-selection.ts")
    expect(components.exports["./code-editor"]).toBe("./code-editor.ts")
    expect(await Bun.file(join(elementsRoot, "index.ts")).text()).not.toMatch(/code\.ts|text-selection\.ts/)
    expect(await Bun.file(join(componentsRoot, "index.ts")).text()).not.toContain("code-editor.ts")
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

    for (const owner of ["elements", "components"]) {
      const manifest = await Bun.file(join(repositoryRoot, `packages/${owner}/package.json`)).json() as {
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }
      expect(manifest.dependencies?.["@zavx0z/storybook"]).toBeUndefined()
      expect(manifest.devDependencies?.["@zavx0z/storybook"]).toBeUndefined()

      const glob = new Bun.Glob("**/*.ts")
      for await (const path of glob.scan({cwd: join(repositoryRoot, `packages/${owner}`), onlyFiles: true})) {
        if (path.startsWith("storybook/")) continue
        expect(await Bun.file(join(repositoryRoot, `packages/${owner}`, path)).text(), `${owner}/${path}`)
          .not.toContain("@zavx0z/storybook")
      }
    }
  })

  test("pins and registers every cold Pages dependency before the UI install", async () => {
    const workflow = await Bun.file(join(repositoryRoot, ".github/workflows/pages.yml")).text()
    for (const [repository, revision] of [
      ["zavx0z/engine", "ae461b8ab622d391247c714f3937f18bd5b4ae45"],
      ["zavx0z/layout", "c97bc83b935ae1299c3db304c35483bb30f6de80"],
      ["zavx0z/highlighter", "a9f240b682a6ccec042ea04522220f153d3b53eb"],
      ["zavx0z/storybook", "bbacaa721b9327dc771f348f017bd6e0a7cef3df"],
    ] as const) {
      expect(workflow).toContain(`repository: ${repository}\n          ref: ${revision}`)
    }

    const sharedCheckout = workflow.indexOf("Check out Storybook infrastructure dependency")
    const engineLink = workflow.indexOf("Register Engine package")
    const layoutLink = workflow.indexOf("Register Layout package")
    const elementsLink = workflow.indexOf("Register UI Elements package")
    const componentsLink = workflow.indexOf("Register UI Components package")
    const highlighterInstall = workflow.indexOf("Install and verify Highlighter dependency")
    const highlighterLink = workflow.indexOf("Register Highlighter package")
    const sharedInstall = workflow.indexOf("Install Storybook infrastructure dependencies")
    const sharedLink = workflow.indexOf("Register Storybook infrastructure package")
    const layoutInstall = workflow.indexOf("Install Layout dependencies")
    const uiInstall = workflow.indexOf("Install locked dependencies")
    const uiCheck = workflow.indexOf("Verify and build static Storybook")
    expect(sharedCheckout).toBeGreaterThan(-1)
    const bootstrapOrder = [
      engineLink,
      layoutLink,
      elementsLink,
      componentsLink,
      highlighterInstall,
      highlighterLink,
      sharedInstall,
      sharedLink,
      layoutInstall,
      uiInstall,
      uiCheck,
    ]
    expect(bootstrapOrder.every((position) => position >= 0)).toBeTrue()
    expect(bootstrapOrder).toEqual([...bootstrapOrder].sort((left, right) => left - right))
    expect(workflow.slice(sharedLink, uiInstall)).toContain("working-directory: storybook\n        run: bun link")
    expect(workflow).toContain("working-directory: ui\n        run: bun install --frozen-lockfile")
    for (const step of [
      "Register Engine package",
      "Register Layout package",
      "Register UI Elements package",
      "Register UI Components package",
      "Register Highlighter package",
      "Register Storybook infrastructure package",
    ]) expect(workflow.indexOf(step), step).toBeLessThan(uiInstall)
    expect(workflow.slice(sharedInstall, sharedLink)).toContain(
      "working-directory: storybook\n        run: bun install --frozen-lockfile",
    )

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
    expect(server).toContain("startStorybookHubServer")
    expect(registry).toContain('lead: "Создано для"')
    expect(registry).toContain('owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"}')
    expect(registry).toContain('detail: "переиспользуемая WebGPU-инфраструктура UI"')
    expect(registry).not.toContain("Built for MetaFor")
  })
})
