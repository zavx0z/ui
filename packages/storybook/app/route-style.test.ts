import {describe, expect, test} from "bun:test"
import {uiRouteStoryCss} from "./route-style.ts"
import {buttonComponentCss} from "@ui/components/button"
import {codeEditorComponentCss} from "@ui/components/code-editor"
import {fieldComponentCss} from "@ui/components/field"
import {inspectorComponentCss} from "@ui/components/inspector"
import {textFieldComponentCss} from "@ui/components/text-field"
import {numberInputComponentCss} from "@ui/components/number-input"

describe("persistent UI Storybook route stylesheet", () => {
  test("contains every production and platform route family", () => {
    for (const selector of [
      ".element-dom-story",
      ".dom-interface-story",
      ".popover-dom-story",
      ".image-dom-story",
      ".ui-aggregate-overview",
    ]) expect(uiRouteStoryCss, selector).toContain(selector)
    expect(uiRouteStoryCss).toContain(buttonComponentCss)
    expect(uiRouteStoryCss).toContain(codeEditorComponentCss)
    expect(uiRouteStoryCss).toContain(fieldComponentCss)
    expect(uiRouteStoryCss).toContain(inspectorComponentCss)
    expect(uiRouteStoryCss).toContain(textFieldComponentCss)
    expect(uiRouteStoryCss).toContain(numberInputComponentCss)
  })

  test("is installed once without route-specific runtime recreation", async () => {
    const entry = await Bun.file(new URL("./dom-entry.ts", import.meta.url)).text()
    expect(entry).toContain("styleSheets: [storybookDomWorkbenchCss, uiStorybookWorkbenchCss, uiRouteStoryCss]")
    expect(entry).not.toContain("storyCss")
    expect(entry.match(/createDocumentCanvasRuntime\(/gu)).toHaveLength(1)
    expect(uiRouteStoryCss).not.toContain("flex-wrap")
  })
})
