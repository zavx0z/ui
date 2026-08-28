import {
  buttonComponentCss,
  type ButtonProps,
} from "@ui/components/button"
import {createCompiledButtonProductionStory} from "./compiled-button-production-story.tsx"
import {createCompiledCheckboxProductionStory} from "./compiled-checkbox-production-story.tsx"
import {
  createCompiledCollectionInputProductionStory,
  createCompiledColorInputProductionStory,
  createCompiledListProductionStory,
  createCompiledTableProductionStory,
} from "./compiled-data-production-stories.tsx"
import {createCompiledEnumInputProductionStory} from "./compiled-enum-input-production-story.tsx"
import {createCompiledFieldProductionStory} from "./compiled-field-production-story.tsx"
import {createCompiledIntegerInputProductionStory} from "./compiled-integer-input-production-story.tsx"
import {
  createCompiledHudFrameProductionStory,
  createCompiledHudWindowProductionStory,
  createCompiledTimelineProductionStory,
} from "./compiled-hud-production-stories.tsx"
import {
  createCompiledBadgeProductionStory,
  createCompiledDividerProductionStory,
  createCompiledPaneProductionStory,
  createCompiledTypographyProductionStory,
} from "./compiled-foundation-production-stories.tsx"
import {
  createCompiledControlGroupProductionStory,
  createCompiledMatrixInputProductionStory,
  createCompiledVectorInputProductionStory,
} from "./compiled-group-production-stories.tsx"
import {createCompiledProgressCheckboxProductionStory} from "./compiled-progress-checkbox-production-story.tsx"
import {
  createCompiledPathInputProductionStory,
  createCompiledReferenceInputProductionStory,
} from "./compiled-resource-production-stories.tsx"
import {createCompiledSliderControlProductionStory} from "./compiled-slider-control-production-story.tsx"
import {createCompiledTextFieldProductionStory} from "./compiled-text-field-production-story.tsx"
import {createCompiledNumberInputProductionStory} from "./compiled-number-input-production-story.tsx"
import {createCompiledSwitcherProductionStory} from "./compiled-switcher-production-story.tsx"
import {
  checkboxComponentCss,
  type CheckboxProps,
} from "@ui/components/checkbox"
import {
  collectionInputComponentCss,
  type CollectionInputProps,
} from "@ui/components/collection-input"
import {
  colorInputComponentCss,
  type ColorInputProps,
} from "@ui/components/color-input"
import {
  controlGroupComponentCss,
  type ControlGroupProps,
} from "@ui/components/control-group"
import {
  badgeComponentCss,
  type BadgeProps,
} from "@ui/components/badge"
import {
  dividerComponentCss,
  type DividerProps,
} from "@ui/components/divider"
import {
  fieldComponentCss,
  type FieldDefinition,
} from "@ui/components/field"
import {
  enumInputComponentCss,
  type EnumInputProps,
} from "@ui/components/enum-input"
import {
  hudComponentCss,
  hudFrameDefaultProps,
  hudWindowDefaultProps,
  timelineDefaultProps,
  type HudFrameProps,
  type HudWindowProps,
  type TimelineProps,
} from "@ui/components/hud"
import {
  integerInputComponentCss,
  type IntegerInputProps,
} from "@ui/components/integer-input"
import {
  listComponentCss,
  type ListProps,
} from "@ui/components/list"
import {
  matrixInputComponentCss,
  type MatrixInputProps,
} from "@ui/components/matrix-input"
import {
  numberInputComponentCss,
  type NumberInputProps,
} from "@ui/components/number-input"
import {
  paneComponentCss,
  type PaneProps,
} from "@ui/components/pane"
import {
  pathInputComponentCss,
  type PathInputProps,
} from "@ui/components/path-input"
import {
  progressCheckboxComponentCss,
  type ProgressCheckboxProps,
} from "@ui/components/progress-checkbox"
import {
  referenceInputComponentCss,
  type ReferenceInputProps,
} from "@ui/components/reference-input"
import {
  sliderControlComponentCss,
  type SliderControlProps,
} from "@ui/components/slider-control"
import {
  switcherComponentCss,
  type SwitcherProps,
} from "@ui/components/switcher"
import {
  tableComponentCss,
  type TableProps,
} from "@ui/components/table"
import {
  textFieldComponentCss,
  type TextFieldProps,
} from "@ui/components/text-field"
import {
  typographyComponentCss,
  type TypographyProps,
} from "@ui/components/typography"
import {
  vectorInputComponentCss,
  type VectorInputProps,
} from "@ui/components/vector-input"
import type {Document, Element, Event, HTMLElement, Node} from "@zavx0z/dom"

export type ProductionComponentStorySource = Readonly<{
  html: string
  css: string
  typescript: string
}>

export type ProductionComponentStory = Readonly<{
  element: HTMLElement
  source: ProductionComponentStorySource
  dispose(): void
}>

export type RoutedProductionComponentStory = Readonly<{
  story: ProductionComponentStory
  css: string
}>

/** One immutable sheet installed once by the persistent Storybook runtime. */
export const productionComponentStoryCss = [
  buttonComponentCss,
  checkboxComponentCss,
  collectionInputComponentCss,
  colorInputComponentCss,
  controlGroupComponentCss,
  badgeComponentCss,
  dividerComponentCss,
  fieldComponentCss,
  enumInputComponentCss,
  hudComponentCss,
  integerInputComponentCss,
  listComponentCss,
  matrixInputComponentCss,
  numberInputComponentCss,
  paneComponentCss,
  pathInputComponentCss,
  progressCheckboxComponentCss,
  referenceInputComponentCss,
  sliderControlComponentCss,
  switcherComponentCss,
  tableComponentCss,
  textFieldComponentCss,
  typographyComponentCss,
  vectorInputComponentCss,
].join("\n")

export const buttonProductionStoryDefaultProps: ButtonProps = Object.freeze({
  label: "Output",
  variant: "contained",
  tone: "neutral",
  size: "medium",
  title: "Output",
})

export const textFieldProductionStoryDefaultProps: TextFieldProps = Object.freeze({
  value: "Output",
  type: "text",
  placeholder: "Введите значение",
  title: "Text field",
})

export const checkboxProductionStoryDefaultProps: CheckboxProps = Object.freeze({
  checked: true,
  title: "Checkbox",
})

export const switcherProductionStoryDefaultProps: SwitcherProps = Object.freeze({
  checked: true,
  title: "Switcher",
})

export const numberInputProductionStoryDefaultProps: NumberInputProps = Object.freeze({
  value: 42,
  min: 0,
  max: 100,
  step: 0.1,
  title: "Number input",
})

export const integerInputProductionStoryDefaultProps: IntegerInputProps = Object.freeze({
  value: 8,
  min: 0,
  max: 100,
  step: 1,
  title: "Integer input",
})

export const enumInputProductionStoryDefaultProps: EnumInputProps = Object.freeze({
  value: "output",
  options: Object.freeze([
    Object.freeze({key: "input", value: "input", label: "Input"}),
    Object.freeze({key: "output", value: "output", label: "Output"}),
    Object.freeze({key: "viewport", value: "viewport", label: "Viewport"}),
  ]),
  title: "Mode",
})

export const controlGroupProductionStoryDefaultProps: ControlGroupProps = Object.freeze({
  title: "Vector",
  items: Object.freeze([
    Object.freeze({key: "x", label: "X", value: "1", type: "number"}),
    Object.freeze({key: "y", label: "Y", value: "2", type: "number"}),
    Object.freeze({key: "z", label: "Z", value: "3", type: "number"}),
  ]),
})

export const sliderControlProductionStoryDefaultProps: SliderControlProps = Object.freeze({
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.01,
  title: "Factor",
})

export const progressCheckboxProductionStoryDefaultProps: ProgressCheckboxProps = Object.freeze({
  checked: false,
  indeterminate: true,
  title: "In progress",
})

export const vectorInputProductionStoryDefaultProps: VectorInputProps = Object.freeze({
  value: Object.freeze([1, 2, 3]),
  axes: Object.freeze(["X", "Y", "Z"]),
  title: "Vector",
})

export const matrixInputProductionStoryDefaultProps: MatrixInputProps = Object.freeze({
  value: Object.freeze([
    Object.freeze([1, 0, 0]),
    Object.freeze([0, 1, 0]),
    Object.freeze([0, 0, 1]),
  ]),
  title: "Matrix",
})

export const referenceInputProductionStoryDefaultProps: ReferenceInputProps = Object.freeze({
  value: Object.freeze({id: "output", label: "Output", kind: "view"}),
  placeholder: "Not selected",
  title: "Reference",
})

export const pathInputProductionStoryDefaultProps: PathInputProps = Object.freeze({
  value: "/project/output.exr",
  placeholder: "Choose file",
  title: "File path",
})

export const collectionInputProductionStoryDefaultProps: CollectionInputProps = Object.freeze({
  items: Object.freeze([
    Object.freeze({id: "input", label: "Input", description: "Input surface"}),
    Object.freeze({id: "output", label: "Output", description: "Output surface"}),
    Object.freeze({id: "viewport", label: "Viewport", description: "Viewport surface"}),
  ]),
  selectedId: "output",
  visibleRows: 3,
  density: "regular",
  title: "Collection",
})

export const colorInputProductionStoryDefaultProps: ColorInputProps = Object.freeze({
  value: Object.freeze({r: 0.2, g: 0.55, b: 0.8, a: 1}),
  label: "Color",
  presentation: "closed",
  title: "Color input",
})

export const listProductionStoryDefaultProps: ListProps = Object.freeze({
  items: Object.freeze([
    Object.freeze({key: "input", label: "Input", detail: "Source"}),
    Object.freeze({key: "output", label: "Output", detail: "Result"}),
    Object.freeze({key: "viewport", label: "Viewport", detail: "View"}),
  ]),
  selectedKey: "output",
  dense: true,
  title: "List",
})

export const tableProductionStoryDefaultProps: TableProps = Object.freeze({
  columns: Object.freeze([
    Object.freeze({key: "name", label: "Имя"}),
    Object.freeze({key: "type", label: "Type"}),
    Object.freeze({key: "status", label: "Состояние"}),
  ]),
  rows: Object.freeze([
    Object.freeze({key: "input", cells: Object.freeze({name: "Input", type: "Surface", status: "Ready"})}),
    Object.freeze({key: "output", cells: Object.freeze({name: "Output", type: "Surface", status: "Active"})}),
  ]),
  selectedKey: "output",
  title: "Table",
})

export function createButtonProductionStory(
  document: Document,
  props: ButtonProps = buttonProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledButtonProductionStory(document, props)
}

export function createTextFieldProductionStory(
  document: Document,
  props: TextFieldProps = textFieldProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledTextFieldProductionStory(document, props)
}

export function createPaneProductionStory(
  document: Document,
  props: PaneProps = {content: "Panel content", variant: "filled", title: "Pane"},
): RoutedProductionComponentStory {
  return createCompiledPaneProductionStory(document, props)
}

export function createBadgeProductionStory(
  document: Document,
  props: BadgeProps = {label: "Ready", tone: "neutral", title: "Status"},
): RoutedProductionComponentStory {
  return createCompiledBadgeProductionStory(document, props)
}

export function createTypographyProductionStory(
  document: Document,
  props: TypographyProps = {text: "Interface text", variant: "body", title: "Typography"},
): RoutedProductionComponentStory {
  return createCompiledTypographyProductionStory(document, props)
}

export function createDividerProductionStory(
  document: Document,
  props: DividerProps = {variant: "full-width", title: "Divider"},
): RoutedProductionComponentStory {
  return createCompiledDividerProductionStory(document, props)
}

export function createCheckboxProductionStory(
  document: Document,
  props: CheckboxProps = checkboxProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledCheckboxProductionStory(document, props)
}

export function createSwitcherProductionStory(
  document: Document,
  props: SwitcherProps = switcherProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledSwitcherProductionStory(document, props)
}

export function createControlGroupProductionStory(
  document: Document,
  props: ControlGroupProps = controlGroupProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledControlGroupProductionStory(document, props)
}

export function createNumberInputProductionStory(
  document: Document,
  props: NumberInputProps = numberInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledNumberInputProductionStory(document, props)
}

export function createIntegerInputProductionStory(
  document: Document,
  props: IntegerInputProps = integerInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledIntegerInputProductionStory(document, props)
}

export function createEnumInputProductionStory(
  document: Document,
  props: EnumInputProps = enumInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledEnumInputProductionStory(document, props)
}

export function createSliderControlProductionStory(
  document: Document,
  props: SliderControlProps = sliderControlProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledSliderControlProductionStory(document, props)
}

export function createProgressCheckboxProductionStory(
  document: Document,
  props: ProgressCheckboxProps = progressCheckboxProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledProgressCheckboxProductionStory(document, props)
}

export function createVectorInputProductionStory(
  document: Document,
  props: VectorInputProps = vectorInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledVectorInputProductionStory(document, props)
}

export function createMatrixInputProductionStory(
  document: Document,
  props: MatrixInputProps = matrixInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledMatrixInputProductionStory(document, props)
}

export function createReferenceInputProductionStory(
  document: Document,
  props: ReferenceInputProps = referenceInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledReferenceInputProductionStory(document, props)
}

export function createPathInputProductionStory(
  document: Document,
  props: PathInputProps = pathInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledPathInputProductionStory(document, props)
}

export function createCollectionInputProductionStory(
  document: Document,
  props: CollectionInputProps = collectionInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledCollectionInputProductionStory(document, props)
}

export function createColorInputProductionStory(
  document: Document,
  props: ColorInputProps = colorInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledColorInputProductionStory(document, props)
}

export function createListProductionStory(
  document: Document,
  props: ListProps = listProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledListProductionStory(document, props)
}

export function createTableProductionStory(
  document: Document,
  props: TableProps = tableProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledTableProductionStory(document, props)
}

export function createFieldProductionStory(
  document: Document,
  definition: FieldDefinition,
): RoutedProductionComponentStory {
  return createCompiledFieldProductionStory(document, definition)
}

export function createHudWindowProductionStory(
  document: Document,
  props: HudWindowProps = hudWindowDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledHudWindowProductionStory(document, props)
}

export function createHudFrameProductionStory(
  document: Document,
  props: HudFrameProps = hudFrameDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledHudFrameProductionStory(document, props)
}

export function createTimelineProductionStory(
  document: Document,
  props: TimelineProps = timelineDefaultProps,
): RoutedProductionComponentStory {
  return createCompiledTimelineProductionStory(document, props)
}

function routedStory(
  controller: Readonly<{element: HTMLElement; dispose(): void}>,
  css: string,
  typescript: readonly string[],
): RoutedProductionComponentStory {
  const story: ProductionComponentStory = Object.freeze({
    element: controller.element,
    get source() {
      return Object.freeze({
        html: serialize(controller.element),
        css,
        typescript: typescript.join("\n"),
      })
    },
    dispose: () => controller.dispose(),
  })
  return Object.freeze({story, css})
}

function exactOwnerStory(
  controller: Readonly<{element: HTMLElement; dispose(): void}>,
  css: string,
  owner: string,
  factory: string,
  variable: string,
  props: unknown,
): RoutedProductionComponentStory {
  return routedStory(controller, css, [
    `import {${factory}, ${cssExport(owner)}} from "@ui/components/${owner}"`,
    'import {createDocument} from "@zavx0z/dom"',
    "",
    "const document = createDocument()",
    `const ${variable} = ${factory}(document, ${literal(props)})`,
    `document.appendChild(${variable}.element)`,
    `void ${cssExport(owner)}`,
  ])
}

function cssExport(owner: string): string {
  return `${owner.replace(/-([a-z])/gu, (_match, letter: string) => letter.toUpperCase())}Css`
}

function literal(value: unknown): string {
  return JSON.stringify(value, (_key, candidate) => typeof candidate === "function" ? undefined : candidate, 2)
}

function serialize(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attributes = new Map(element.getAttributeNames().map((name) => [name, element.getAttribute(name) ?? ""]))
  const live = element as Element & Readonly<{
    value?: unknown
    checked?: unknown
    indeterminate?: unknown
  }>
  if (
    (element.localName === "input" || element.localName === "select" || element.localName === "textarea") &&
    typeof live.value === "string"
  ) attributes.set("value", live.value)
  if (live.checked === true) attributes.set("checked", "")
  if (live.indeterminate === true) attributes.set("aria-checked", "mixed")
  const attrs = [...attributes].sort(([left], [right]) => left.localeCompare(right)).map(([name, value]) =>
    ` ${name}="${escapeHtml(value)}"`
  ).join("")
  const children = [...element.childNodes]
  if (children.length === 0) return `${indent}<${element.localName}${attrs}></${element.localName}>`
  if (children.every((node) => node.nodeType === 3)) {
    return `${indent}<${element.localName}${attrs}>${escapeHtml(element.textContent ?? "")}</${element.localName}>`
  }
  const body = children.map((node: Node) => node.nodeType === 3
    ? `${"  ".repeat(depth + 1)}${escapeHtml(node.textContent ?? "")}`
    : serialize(node as Element, depth + 1)).join("\n")
  return `${indent}<${element.localName}${attrs}>\n${body}\n${indent}</${element.localName}>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
