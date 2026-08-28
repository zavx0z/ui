import {describe, expect, test} from "bun:test"
import {uiRouteStoryCss} from "./route-style.ts"
import {buttonCss} from "@ui/components/button"
import {codeEditorCss} from "@ui/components/code-editor"
import {fieldCss} from "@ui/components/field"
import {inspectorCss} from "@ui/components/inspector"
import {textFieldCss} from "@ui/components/text-field"
import {numberInputCss} from "@ui/components/number-input"

describe("persistent UI Storybook route stylesheet", () => {
  test("contains every production and platform route family", () => {
    for (const selector of [
      ".element-dom-story",
      ".dom-interface-story",
      ".popover-dom-story",
      ".image-dom-story",
      ".ui-aggregate-overview",
    ]) expect(uiRouteStoryCss, selector).toContain(selector)
    expect(uiRouteStoryCss).toContain(buttonCss)
    expect(uiRouteStoryCss).toContain(codeEditorCss)
    expect(uiRouteStoryCss).toContain(fieldCss)
    expect(uiRouteStoryCss).toContain(inspectorCss)
    expect(uiRouteStoryCss).toContain(textFieldCss)
    expect(uiRouteStoryCss).toContain(numberInputCss)
  })

  test("is installed once without route-specific runtime recreation", async () => {
    const entry = await Bun.file(new URL("./dom-entry.ts", import.meta.url)).text()
    expect(entry).toContain("styleSheets: [storybookDomWorkbenchCss, uiStorybookWorkbenchCss, uiRouteStoryCss]")
    expect(entry).not.toContain("storyCss")
    expect(entry.match(/createDocumentCanvasRuntime\(/gu)).toHaveLength(1)
    expect(uiRouteStoryCss).not.toContain("flex-wrap")
  })
})
