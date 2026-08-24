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
  })

  test("keeps public attribution explicit without a runtime MetaFor dependency", async () => {
    for (const path of ["README.md", "ARCHITECTURE.md", "CONTRIBUTING.md"]) {
      const source = await Bun.file(join(repositoryRoot, path)).text()
      expect(source).toContain("Built for MetaFor")
      expect(source).toContain("https://github.com/zavx0z/metafor")
    }
    const server = await Bun.file(join(repositoryRoot, "packages/storybook/server.ts")).text()
    expect(server.match(/Built for MetaFor/g)).toHaveLength(2)
  })
})
