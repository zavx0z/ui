import {describe, expect, test} from "bun:test"
import {Event, createDocument, type HTMLButtonElement, type HTMLInputElement, type HTMLSelectElement} from "@zavx0z/dom"
import {
  createBadgeProductionStory,
  createButtonProductionStory,
  createCheckboxProductionStory,
  createCollectionInputProductionStory,
  createColorInputProductionStory,
  createControlGroupProductionStory,
  createDividerProductionStory,
  createEnumInputProductionStory,
  createFieldProductionStory,
  createHudFrameProductionStory,
  createHudWindowProductionStory,
  createPaneProductionStory,
  createIntegerInputProductionStory,
  createListProductionStory,
  createMatrixInputProductionStory,
  createNumberInputProductionStory,
  createPathInputProductionStory,
  createProgressCheckboxProductionStory,
  createReferenceInputProductionStory,
  createSliderControlProductionStory,
  createSwitcherProductionStory,
  createTableProductionStory,
  createTextFieldProductionStory,
  createTypographyProductionStory,
  createTimelineProductionStory,
  createVectorInputProductionStory,
} from "./production-component-stories.ts"

describe("production Component Storybook adapters", () => {
  test("render exact production owners and publish their exported CSS", () => {
    const document = createDocument()
    const stories = [
      createButtonProductionStory(document),
      createTextFieldProductionStory(document),
      createPaneProductionStory(document),
      createBadgeProductionStory(document),
      createTypographyProductionStory(document),
      createDividerProductionStory(document),
      createCheckboxProductionStory(document),
      createSwitcherProductionStory(document),
      createControlGroupProductionStory(document),
      createNumberInputProductionStory(document),
      createIntegerInputProductionStory(document),
      createEnumInputProductionStory(document),
      createSliderControlProductionStory(document),
      createProgressCheckboxProductionStory(document),
      createVectorInputProductionStory(document),
      createMatrixInputProductionStory(document),
      createReferenceInputProductionStory(document),
      createPathInputProductionStory(document),
      createCollectionInputProductionStory(document),
      createColorInputProductionStory(document),
      createListProductionStory(document),
      createTableProductionStory(document),
      createFieldProductionStory(document, {
        id: "output",
        label: "Output",
        kind: "text",
        value: "Ready",
      }),
      createHudWindowProductionStory(document),
      createHudFrameProductionStory(document),
      createTimelineProductionStory(document),
    ]

    const classes = stories.map(({story}) => story.element.className)
    expect(classes).toEqual([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ])
    for (const {story, css} of stories) {
      expect(story.source.css).toBe(css)
      expect(story.source.html).toContain(story.element.localName)
      expect(story.source.typescript).toContain("@ui/components/")
      expect(story.props).toBeDefined()
      story.dispose()
    }
  })

  test("keeps controlled native state and retained identity in compiled wrappers", () => {
    const document = createDocument()
    const text = createTextFieldProductionStory(document)
    const checkbox = createCheckboxProductionStory(document)
    const switcher = createSwitcherProductionStory(document)
    const enumInput = createEnumInputProductionStory(document)
    const slider = createSliderControlProductionStory(document)
    const progress = createProgressCheckboxProductionStory(document)
    const integer = createIntegerInputProductionStory(document)

    const textInput = text.story.element as HTMLInputElement
    const checkboxInput = checkbox.story.element as HTMLInputElement
    const switcherButton = switcher.story.element as HTMLButtonElement
    const select = enumInput.story.element as HTMLSelectElement
    const sliderInput = slider.story.element as HTMLInputElement
    const progressInput = progress.story.element as HTMLInputElement
    const integerInput = integer.story.element.querySelector("input") as HTMLInputElement
    const switcherThumb = switcherButton.querySelector("span")
    const enumOptions = [...select.querySelectorAll("option")]
    const checkboxIdentity = checkbox.story.element
    const switcherIdentity = switcher.story.element
    const enumIdentity = enumInput.story.element
    const sliderIdentity = slider.story.element
    const progressIdentity = progress.story.element
    const integerIdentity = integer.story.element
    textInput.value = "Changed"
    textInput.dispatchEvent(new Event("input", {bubbles: true}))
    checkboxInput.click()
    switcherButton.click()
    select.value = "viewport"
    select.dispatchEvent(new Event("change", {bubbles: true}))
    sliderInput.valueAsNumber = 0.75
    sliderInput.dispatchEvent(new Event("input", {bubbles: true}))
    progressInput.click()
    integerInput.valueAsNumber = 9
    integerInput.dispatchEvent(new Event("input", {bubbles: true}))

    expect(textInput.value).toBe("Changed")
    expect(text.story.source.html).not.toContain('value="Changed"')
    expect(text.story.source.typescript).toContain('useState("Changed")')
    expect(checkboxInput.checked).toBeFalse()
    expect(checkboxInput.getAttribute("aria-checked")).toBe("false")
    expect(checkbox.story.element).toBe(checkboxIdentity)
    expect(checkbox.story.source.typescript).toContain("useState(false)")
    expect(checkbox.story.source.typescript).toContain("<Checkbox")
    expect(checkbox.story.source.typescript).not.toContain("createCheckbox(")
    expect(switcherButton.getAttribute("aria-checked")).toBe("false")
    expect(switcher.story.element).toBe(switcherIdentity)
    expect(switcherButton.querySelector("span")).toBe(switcherThumb)
    expect(switcher.story.source.typescript).toContain("useState(false)")
    expect(switcher.story.source.typescript).toContain("<Switcher")
    expect(switcher.story.source.typescript).not.toContain("createSwitcher(")
    expect(enumInput.story.element).toBe(enumIdentity)
    const retainedEnumOptions = [...select.querySelectorAll("option")]
    expect(retainedEnumOptions).toHaveLength(enumOptions.length)
    for (const [index, option] of retainedEnumOptions.entries()) {
      expect(option).toBe(enumOptions[index]!)
    }
    expect(select.value).toBe("viewport")
    expect(enumInput.story.source.typescript).toContain('useState("viewport")')
    expect(enumInput.story.source.typescript).toContain("<EnumInput")
    expect(enumInput.story.source.typescript).not.toContain("createEnumInput(")
    expect(slider.story.element).toBe(sliderIdentity)
    expect(sliderInput.valueAsNumber).toBeCloseTo(0.75, 12)
    expect(slider.story.source.typescript).toContain("useState(0.75)")
    expect(slider.story.source.typescript).toContain("<SliderControl")
    expect(slider.story.source.typescript).not.toContain("createSliderControl(")
    expect(progress.story.element).toBe(progressIdentity)
    expect(progressInput.checked).toBeTrue()
    expect(progressInput.indeterminate).toBeFalse()
    expect(progressInput.getAttribute("aria-checked")).toBe("true")
    expect(progress.story.source.typescript).toContain("useState({checked: true, indeterminate: false})")
    expect(progress.story.source.typescript).toContain("<ProgressCheckbox")
    expect(progress.story.source.typescript).not.toContain("createProgressCheckbox(")
    expect(integer.story.element).toBe(integerIdentity)
    expect(integer.story.element.querySelector("input")).toBe(integerInput)
    expect(integerInput.valueAsNumber).toBe(9)
    expect(integer.story.source.typescript).toContain("useState(9)")
    expect(integer.story.source.typescript).toContain("<IntegerInput")
    expect(integer.story.source.typescript).toContain("integerInputCss")
    expect(integer.story.source.typescript).not.toContain("createIntegerInput(")
  })

  test("contains no private direct-element story imports", async () => {
    const source = await Bun.file(new URL("./production-component-stories.ts", import.meta.url)).text()
    expect(source).not.toContain("../../components/dom/")
    for (const owner of [
      "button",
      "text-field",
      "pane",
      "badge",
      "typography",
      "divider",
      "checkbox",
      "switcher",
      "control-group",
      "number-input",
      "integer-input",
      "enum-input",
      "slider-control",
      "progress-checkbox",
      "vector-input",
      "matrix-input",
      "reference-input",
      "path-input",
      "collection-input",
      "color-input",
      "list",
      "table",
      "field",
      "hud",
    ]) expect(source).toContain(`from \"@ui/components/${owner}\"`)
  })
})
