import {describe, expect, test} from "bun:test"
import {uiStorybookWorkbenchCss} from "./workbench-style.ts"

describe("UI Storybook Workbench visual policy", () => {
  test("keeps the measured compact StatusBar contract", () => {
    const status = rule(".storybook-dom-workbench__status")

    expect(status).toContain("box-sizing: border-box")
    expect(status).toContain("height: 24px")
    expect(status).toContain("padding: 0 12px 0 8px")
    expect(status).toContain("border-top: 2px solid #161616")
    expect(status).toContain("background: #181818")
    expect(status).toContain("color: #878787")
    expect(status).toContain("font-size: 11px")
  })

  test("keeps five compact editor regions and separate source materials", () => {
    for (const selector of [
      ".storybook-dom-workbench__catalog",
      ".storybook-dom-workbench__secondary",
      ".storybook-dom-workbench__preview",
      ".storybook-dom-workbench__scenarios",
      ".storybook-dom-workbench__inspector",
    ]) {
      expect(uiStorybookWorkbenchCss).toContain(selector)
    }

    expect(rule(".storybook-dom-workbench__source")).toContain("border-radius: 4px")
    expect(rule(".storybook-dom-workbench__source .storybook-dom-workbench__heading"))
      .toContain("background: #303030")
    expect(rule(".storybook-dom-workbench__code")).toContain("background: #1d1d1d")
  })

  test("uses bounded low-radius controls without pill silhouettes", () => {
    const item = rule(".storybook-dom-workbench__item")
    const search = rule(".storybook-dom-workbench__search")

    expect(item).toContain("min-height: 24px")
    expect(item).toContain("border-radius: 2px")
    expect(search).toContain("height: 24px")
    expect(search).toContain("border-radius: 4px")
    expect(uiStorybookWorkbenchCss).not.toMatch(/border-radius:\s*(?:999|50%)/u)
  })

  test("stays scoped to the semantic Workbench", () => {
    for (const selector of uiStorybookWorkbenchCss.matchAll(/([^{}]+)\{/gu)) {
      for (const branch of (selector[1] ?? "").split(",")) {
        expect(branch.trim().startsWith(".storybook-dom-workbench")).toBeTrue()
      }
    }
    expect(uiStorybookWorkbenchCss).not.toMatch(/(?:^|[\s,{])(html|body|canvas|#ui-storybook-canvas)(?:[\s,{]|$)/u)
  })
})

function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
  const match = uiStorybookWorkbenchCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "u"))
  if (match === null) throw new Error(`Missing CSS rule ${selector}`)
  return match[1] ?? ""
}
