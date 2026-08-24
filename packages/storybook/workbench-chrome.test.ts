import {describe, expect, test} from "bun:test"
import {join} from "node:path"
import {uiShapeMetrics} from "@ui/elements"
import {storybookTheme} from "./theme.ts"

const root = import.meta.dir

describe("shared Workbench chrome", () => {
  test("derives shell density from the one Elements shape owner", () => {
    expect(storybookTheme.stagePadding).toBe(uiShapeMetrics.tightGap)
    expect(storybookTheme.stageGap).toBe(uiShapeMetrics.separatorWidth)
    expect(storybookTheme.dockHeight).toBe(uiShapeMetrics.rowHeight)
    expect("panelRadius" in storybookTheme).toBeFalse()
    expect("previewRadius" in storybookTheme).toBeFalse()
    expect("panelBackground" in storybookTheme).toBeFalse()
    expect("previewBackground" in storybookTheme).toBeFalse()
  })

  test("has no local pill, control or island radius policy", async () => {
    const sharedSources = await Promise.all([
      "surfaces.ts",
      "fixtures/entry.ts",
      "fixtures/stories/button.ts",
    ].map((path) => Bun.file(join(root, path)).text()))
    const previewSources = await Promise.all([
      "../elements/storybook/story-preview.ts",
      "../components/storybook/story-preview.ts",
    ].map((path) => Bun.file(join(root, path)).text()))
    const paneSource = await Bun.file(join(root, "../components/pane.ts")).text()
    const visibleChrome = [...sharedSources, ...previewSources, paneSource].join("\n")

    expect(visibleChrome).not.toMatch(/\b(?:radius|borderRadius):\s*(?:8|12|17|34|36|38|999)\b/)
    expect(visibleChrome).toContain("uiShapeMetrics.lowRadius")
    expect(visibleChrome).toContain("uiShapeMetrics.panelHeaderHeight")
    expect(visibleChrome).toContain("uiShapeMetrics.rowHeight")
    expect(visibleChrome).toContain("uiShapeMetrics.controlHeight")
    expect(sharedSources[0]).toContain('appearance: "toolbar-item"')
    expect(sharedSources[0]).toContain('appearance: "tab"')
    expect(sharedSources[0]).toContain('appearance: "tool"')
    expect(sharedSources[0]).toContain('appearance: "panel"')
    expect(sharedSources[0]).toContain('appearance: "box"')
    expect(sharedSources[0]).toContain("resolveOpaqueRgba8")
    expect(sharedSources[0]).toContain("material.editorBorder")
    expect(sharedSources[0]).toContain("spaceNode.panel.header")
    expect(sharedSources[0]).not.toContain("drawBackdropGradient")
    expect(sharedSources[0]).not.toContain("palette.bgHot")
    expect(sharedSources[0]).not.toContain("palette.cyan")
    expect(sharedSources[2]).toContain("const width = 146")
    expect(sharedSources[2]).not.toContain("frame.w * 0.32")
    for (const source of previewSources) {
      expect(source).toContain("drawStorybookPreviewChrome")
      expect(source).not.toContain("borderRadius:")
      expect(source).not.toContain("fontSize:")
    }
  })
})
