import {
  buttonCss,
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
  checkboxCss,
  type CheckboxProps,
} from "@ui/components/checkbox"
import {
  collectionInputCss,
  type CollectionInputProps,
} from "@ui/components/collection-input"
import {
  colorInputCss,
  type ColorInputProps,
} from "@ui/components/color-input"
import {
  controlGroupCss,
  type ControlGroupProps,
} from "@ui/components/control-group"
import {
  badgeCss,
  type BadgeProps,
} from "@ui/components/badge"
import {
  dividerCss,
  type DividerProps,
} from "@ui/components/divider"
import {
  fieldCss,
  type FieldDefinition,
} from "@ui/components/field"
import {
  enumInputCss,
  type EnumInputProps,
} from "@ui/components/enum-input"
import {
  hudCss,
  hudFrameDefaultProps,
  hudWindowDefaultProps,
  timelineDefaultProps,
  type HudFrameDefaultProps,
  type HudWindowDefaultProps,
  type TimelineProps,
} from "@ui/components/hud"
import {
  integerInputCss,
  type IntegerInputProps,
} from "@ui/components/integer-input"
import {
  listCss,
  type ListProps,
} from "@ui/components/list"
import {
  matrixInputCss,
  type MatrixInputProps,
} from "@ui/components/matrix-input"
import {
  numberInputCss,
  type NumberInputProps,
} from "@ui/components/number-input"
import {
  paneCss,
  type PaneProps,
} from "@ui/components/pane"
import {
  pathInputCss,
  type PathInputProps,
} from "@ui/components/path-input"
import {
  progressCheckboxCss,
  type ProgressCheckboxProps,
} from "@ui/components/progress-checkbox"
import {
  referenceInputCss,
  type ReferenceInputProps,
} from "@ui/components/reference-input"
import {
  sliderControlCss,
  type SliderControlProps,
} from "@ui/components/slider-control"
import {
  switcherCss,
  type SwitcherProps,
} from "@ui/components/switcher"
import {
  tableCss,
  type TableProps,
} from "@ui/components/table"
import {
  textFieldCss,
  type TextFieldProps,
} from "@ui/components/text-field"
import {
  typographyCss,
  type TypographyProps,
} from "@ui/components/typography"
import {
  vectorInputCss,
  type VectorInputProps,
} from "@ui/components/vector-input"
import type {Document, HTMLElement} from "@zavx0z/dom"

export type ProductionComponentStorySource = Readonly<{
  html: string
  css: string
  typescript: string
}>

export type ProductionComponentStory = Readonly<{
  element: HTMLElement
  source: ProductionComponentStorySource
  props?: Readonly<Record<string, unknown>>
  dispose(): void
}>

export type RoutedProductionComponentStory = Readonly<{
  story: ProductionComponentStory
  css: string
}>

/** One immutable sheet installed once by the persistent Storybook runtime. */
export const productionComponentStoryCss = [
  buttonCss,
  checkboxCss,
  collectionInputCss,
  colorInputCss,
  controlGroupCss,
  badgeCss,
  dividerCss,
  fieldCss,
  enumInputCss,
  hudCss,
  integerInputCss,
  listCss,
  matrixInputCss,
  numberInputCss,
  paneCss,
  pathInputCss,
  progressCheckboxCss,
  referenceInputCss,
  sliderControlCss,
  switcherCss,
  tableCss,
  textFieldCss,
  typographyCss,
  vectorInputCss,
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
  return withProps(createCompiledButtonProductionStory(document, props), props)
}

export function createTextFieldProductionStory(
  document: Document,
  props: TextFieldProps = textFieldProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledTextFieldProductionStory(document, props), props)
}

export function createPaneProductionStory(
  document: Document,
  props: PaneProps = {content: "Panel content", variant: "filled", title: "Pane"},
): RoutedProductionComponentStory {
  return withProps(createCompiledPaneProductionStory(document, props), props)
}

export function createBadgeProductionStory(
  document: Document,
  props: BadgeProps = {label: "Ready", tone: "neutral", title: "Status"},
): RoutedProductionComponentStory {
  return withProps(createCompiledBadgeProductionStory(document, props), props)
}

export function createTypographyProductionStory(
  document: Document,
  props: TypographyProps = {text: "Interface text", variant: "body", title: "Typography"},
): RoutedProductionComponentStory {
  return withProps(createCompiledTypographyProductionStory(document, props), props)
}

export function createDividerProductionStory(
  document: Document,
  props: DividerProps = {variant: "full-width", title: "Divider"},
): RoutedProductionComponentStory {
  return withProps(createCompiledDividerProductionStory(document, props), props)
}

export function createCheckboxProductionStory(
  document: Document,
  props: CheckboxProps = checkboxProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledCheckboxProductionStory(document, props), props)
}

export function createSwitcherProductionStory(
  document: Document,
  props: SwitcherProps = switcherProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledSwitcherProductionStory(document, props), props)
}

export function createControlGroupProductionStory(
  document: Document,
  props: ControlGroupProps = controlGroupProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledControlGroupProductionStory(document, props), props)
}

export function createNumberInputProductionStory(
  document: Document,
  props: NumberInputProps = numberInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledNumberInputProductionStory(document, props), props)
}

export function createIntegerInputProductionStory(
  document: Document,
  props: IntegerInputProps = integerInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledIntegerInputProductionStory(document, props), props)
}

export function createEnumInputProductionStory(
  document: Document,
  props: EnumInputProps = enumInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledEnumInputProductionStory(document, props), props)
}

export function createSliderControlProductionStory(
  document: Document,
  props: SliderControlProps = sliderControlProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledSliderControlProductionStory(document, props), props)
}

export function createProgressCheckboxProductionStory(
  document: Document,
  props: ProgressCheckboxProps = progressCheckboxProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledProgressCheckboxProductionStory(document, props), props)
}

export function createVectorInputProductionStory(
  document: Document,
  props: VectorInputProps = vectorInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledVectorInputProductionStory(document, props), props)
}

export function createMatrixInputProductionStory(
  document: Document,
  props: MatrixInputProps = matrixInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledMatrixInputProductionStory(document, props), props)
}

export function createReferenceInputProductionStory(
  document: Document,
  props: ReferenceInputProps = referenceInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledReferenceInputProductionStory(document, props), props)
}

export function createPathInputProductionStory(
  document: Document,
  props: PathInputProps = pathInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledPathInputProductionStory(document, props), props)
}

export function createCollectionInputProductionStory(
  document: Document,
  props: CollectionInputProps = collectionInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledCollectionInputProductionStory(document, props), props)
}

export function createColorInputProductionStory(
  document: Document,
  props: ColorInputProps = colorInputProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledColorInputProductionStory(document, props), props)
}

export function createListProductionStory(
  document: Document,
  props: ListProps = listProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledListProductionStory(document, props), props)
}

export function createTableProductionStory(
  document: Document,
  props: TableProps = tableProductionStoryDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledTableProductionStory(document, props), props)
}

export function createFieldProductionStory(
  document: Document,
  definition: FieldDefinition,
): RoutedProductionComponentStory {
  return withProps(createCompiledFieldProductionStory(document, definition), {definition})
}

export function createHudWindowProductionStory(
  document: Document,
  props: HudWindowDefaultProps = hudWindowDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledHudWindowProductionStory(document, props), props)
}

export function createHudFrameProductionStory(
  document: Document,
  props: HudFrameDefaultProps = hudFrameDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledHudFrameProductionStory(document, props), props)
}

export function createTimelineProductionStory(
  document: Document,
  props: TimelineProps = timelineDefaultProps,
): RoutedProductionComponentStory {
  return withProps(createCompiledTimelineProductionStory(document, props), props)
}

function withProps<Props extends Readonly<object>>(
  routed: RoutedProductionComponentStory,
  props: Props,
): RoutedProductionComponentStory {
  const source = routed.story
  const snapshot = Object.freeze({...props}) as Readonly<Record<string, unknown>>
  const story: ProductionComponentStory = Object.freeze({
    element: source.element,
    get source() {
      return source.source
    },
    props: snapshot,
    dispose: () => source.dispose(),
  })
  return Object.freeze({story, css: routed.css})
}
