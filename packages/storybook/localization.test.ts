import {describe, expect, test} from "bun:test"
import {join, resolve} from "node:path"

const repositoryRoot = resolve(import.meta.dir, "../..")
const visibleOwnerRoots = [
  "packages/storybook/app",
  "packages/components/storybook",
  "packages/elements/storybook",
] as const

const forbiddenVisiblePhrases = [
  "Production-компонент",
  "Production-элемент",
  "Production Pane",
  "одну story",
  "состояние story",
  'label: "Story"',
  'label: "Operation"',
  'label: "Add"',
  'label: "Multiply"',
  'label: "Factor"',
  'label: "Clamp"',
  'label: "Translation"',
  'label: "Rotation"',
  'label: "Distribution"',
  'label: "Base Color"',
  'label: "Name"',
  'label: "Object"',
  'label: "Image"',
  'label: "Status"',
  'value: "Identity"',
  "UI component",
  "Основной текст production Typography",
  "public production export",
  "disabled-маршрутом",
  "retained content",
  "Retained parent",
  "Hit и keyboard state",
  "WebGPU draw pass",
  "Lazy production import",
  "// Загрузка story…",
  'comparison: "Reference comparison"',
  'title: "BLENDER COMPARISON"',
  'cell(surface, cx, cy, cw, ch, "header"',
  'cell(surface, cx, cy, cw, ch, "footer"',
] as const

const requiredLocalizedPhrases = [
  "Рабочий компонент, параметры и TypeScript используют один сценарий.",
  "Рабочий элемент, параметры и TypeScript используют один сценарий.",
  'label: "Сценарий"',
] as const

describe("Workbench visible localization", () => {
  test("scans every storybook-owned visible source and rejects known English labels", async () => {
    const sources = await visibleSources()
    expect(new Set(sources.map(({owner}) => owner))).toEqual(new Set(visibleOwnerRoots))
    const combined = sources.map(({path, source}) => `// ${path}\n${source}`).join("\n")
    for (const phrase of forbiddenVisiblePhrases) expect(combined).not.toContain(phrase)
    for (const phrase of requiredLocalizedPhrases) expect(combined).toContain(phrase)
  })
})

async function visibleSources(): Promise<readonly Readonly<{owner: string; path: string; source: string}>[]> {
  const sources: Readonly<{owner: string; path: string; source: string}>[] = []
  const glob = new Bun.Glob("**/*.ts")
  for (const owner of visibleOwnerRoots) {
    const directory = join(repositoryRoot, owner)
    for await (const path of glob.scan({cwd: directory, onlyFiles: true})) {
      if (path.endsWith(".test.ts") || path === "server.ts") continue
      sources.push({owner, path: `${owner}/${path}`, source: await Bun.file(join(directory, path)).text()})
    }
  }
  return sources
}
