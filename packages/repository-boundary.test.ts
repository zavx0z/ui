import {describe, expect, test} from "bun:test"
import {readdirSync, readFileSync} from "node:fs"
import {join, relative, sep} from "node:path"

const packagesDirectory = import.meta.dir
const exactSubpathOwners = new Set(["components", "elements", "hud"])

function productionSources(directory = packagesDirectory): string[] {
  const sources: string[] = []
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "static") continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      sources.push(...productionSources(path))
    } else if (/\.tsx?$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)) {
      sources.push(path)
    }
  }
  return sources
}

function ownerOf(path: string): string {
  return relative(packagesDirectory, path).split(sep)[0] ?? ""
}

describe("UI repository package boundaries", () => {
  test("cross-owner production imports use exact subpaths and never re-export another owner", () => {
    const violations: string[] = []

    for (const path of productionSources()) {
      const owner = ownerOf(path)
      const source = readFileSync(path, "utf8")
      const location = relative(packagesDirectory, path)

      for (const match of source.matchAll(/(?:from\s+|import\(\s*)["']@ui\/([^/"']+)["']/g)) {
        const target = match[1] ?? ""
        if (exactSubpathOwners.has(target) && target !== owner) {
          violations.push(`${location}: root import @ui/${target}`)
        }
      }

      if (/["']@ui\/components\/src(?:\/|["'])/u.test(source)) {
        violations.push(`${location}: private @ui/components/src import`)
      }

      for (const match of source.matchAll(/^\s*export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+["']@ui\/([^/"']+)(?:\/[^"']+)?["']/gm)) {
        const target = match[1] ?? ""
        if (exactSubpathOwners.has(target) && target !== owner) {
          violations.push(`${location}: cross-owner re-export @ui/${target}`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
