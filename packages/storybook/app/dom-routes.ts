export const DOM_INTERFACE_STORY_ROUTES = Object.freeze([
  "dom/interfaces/event-target/listeners/default",
  "dom/interfaces/node/hierarchy/default",
  "dom/interfaces/document/tree/default",
  "dom/interfaces/document-fragment/mutation/default",
  "dom/interfaces/character-data/data/default",
  "dom/interfaces/text/data/default",
  "dom/interfaces/comment/anchors/default",
  "dom/interfaces/node-list/snapshot/default",
  "dom/interfaces/dom-token-list/classes/default",
  "dom/interfaces/element/attributes/default",
  "dom/interfaces/html-element/title/default",
  "dom/interfaces/html-div-element/container/default",
  "dom/interfaces/html-span-element/inline/default",
  "dom/interfaces/html-button-element/activation/default",
  "dom/interfaces/html-input-element/value/default",
  "dom/interfaces/html-image-element/attributes/default",
  "dom/interfaces/html-select-element/selection/default",
  "dom/interfaces/html-option-element/selectedness/default",
  "dom/interfaces/html-progress-element/value/default",
  "dom/interfaces/html-meter-element/value/default",
  "dom/interfaces/html-text-area-element/value/default",
  "dom/interfaces/html-label-element/control/default",
  "dom/interfaces/html-field-set-element/disabled/default",
  "dom/interfaces/html-legend-element/caption/default",
  "dom/interfaces/html-u-list-element/list/default",
  "dom/interfaces/html-li-element/item/default",
  "dom/interfaces/html-heading-element/heading/default",
  "dom/interfaces/html-paragraph-element/text/default",
  "dom/interfaces/html-table-element/table/default",
  "dom/interfaces/html-table-section-element/section/default",
  "dom/interfaces/html-table-row-element/row/default",
  "dom/interfaces/html-table-cell-element/cell/default",
  "dom/interfaces/event/propagation/default",
  "dom/interfaces/custom-event/detail/default",
  "dom/interfaces/toggle-event/states/default",
  "dom/interfaces/ui-event/detail/default",
  "dom/interfaces/focus-event/related-target/default",
  "dom/interfaces/mouse-event/pointer/default",
  "dom/interfaces/pointer-event/samples/default",
  "dom/interfaces/wheel-event/delta/default",
  "dom/interfaces/keyboard-event/key/default",
  "dom/interfaces/input-event/data/default",
  "dom/interfaces/composition-event/data/default",
] as const)

export type DomInterfaceStoryRoute = typeof DOM_INTERFACE_STORY_ROUTES[number]

export const ELEMENT_DOM_STORY_ROUTES = Object.freeze([
  "elements/primitives/div/basic/background",
  "elements/primitives/div/basic/border",
  "elements/primitives/div/basic/padding",
  "elements/primitives/div/basic/z-index",
  "elements/primitives/div/overflow/nested",
  "elements/primitives/div/scroll/vertical",
  "elements/primitives/div/scroll/horizontal",
  "elements/primitives/div/scroll/both",
  "elements/primitives/span/content/left",
  "elements/primitives/span/content/center",
  "elements/primitives/span/content/right",
  "elements/primitives/button/state/default",
  "elements/primitives/button/state/disabled",
  "elements/primitives/button/state/clickable",
  "elements/primitives/input/state/inactive",
  "elements/primitives/input/state/active",
  "elements/primitives/input/state/disabled",
  "elements/primitives/select/state/inactive",
  "elements/primitives/select/state/active",
  "elements/primitives/select/state/disabled",
  "elements/primitives/list/mode/regular",
  "elements/primitives/list/mode/dense",
  "elements/primitives/list/mode/interactive",
  "elements/primitives/list/mode/scroll",
  "elements/primitives/status-bar/content/statistics",
  "elements/style/css/padding/default",
  "elements/style/css/flex/default",
  "elements/style/css/border/rounded",
  "elements/style/css/border/capsule",
  "elements/style/css/color/default",
  "elements/style/css/typography/default",
  "elements/style/theme/tone/cyan",
  "elements/style/theme/tone/green",
  "elements/style/theme/tone/orange",
  "elements/style/theme/tone/red",
  "elements/events/pointer/state/idle",
  "elements/events/pointer/state/hover",
  "elements/events/pointer/state/press",
  "elements/events/pointer/state/release",
  "elements/events/pointer/state/click",
  "elements/events/pointer/state/disabled",
  "components/data/scrollbar/vertical/default",
  "components/data/noti/status/unavailable",
] as const)

export type ElementDomStoryRoute = typeof ELEMENT_DOM_STORY_ROUTES[number]

export const ENUM_DOM_STORY_ROUTES = Object.freeze([
  "components/inputs/enum-input/presentation/expanded",
  "components/inputs/enum-input/value/selected-description",
  "components/inputs/enum-input/value/header-icons",
  "components/inputs/enum-input/value/mixed-icons",
  "components/inputs/enum-input/value/invalid-legacy",
  "components/inputs/enum-input/exception/no-items",
  "components/inputs/enum-input/exception/menu-undefined",
  "components/inputs/enum-input/exception/menu-error",
  "components/inputs/enum-input/state/disabled",
  "components/inputs/enum-input/state/readonly",
] as const)

export type EnumDomStoryRoute = typeof ENUM_DOM_STORY_ROUTES[number]

export const BUTTON_ICON_DOM_STORY_ROUTES = Object.freeze([
  "components/foundation/button/icon-label/left",
  "components/foundation/button/icon-label/right",
] as const)

export type ButtonIconDomStoryRoute = typeof BUTTON_ICON_DOM_STORY_ROUTES[number]

export const POPOVER_DOM_STORY_ROUTES = Object.freeze([
  "elements/primitives/popover/state/closed",
  "elements/primitives/popover/state/open",
  "elements/primitives/select/state/open",
  "elements/primitives/select/state/header",
  "elements/primitives/select/state/flipped",
] as const)

export type PopoverDomStoryRoute = typeof POPOVER_DOM_STORY_ROUTES[number]

export const IMAGE_DOM_STORY_ROUTES = Object.freeze([
  "elements/primitives/img/fit/cover",
  "elements/primitives/img/fit/contain",
  "components/foundation/button/icon/svg",
] as const)

export type ImageDomStoryRoute = typeof IMAGE_DOM_STORY_ROUTES[number]

const UI_DOM_DECLARED_STORY_ROUTES = Object.freeze([
  ...ELEMENT_DOM_STORY_ROUTES,
  ...ENUM_DOM_STORY_ROUTES,
  ...BUTTON_ICON_DOM_STORY_ROUTES,
  ...POPOVER_DOM_STORY_ROUTES,
  ...IMAGE_DOM_STORY_ROUTES,
  ...DOM_INTERFACE_STORY_ROUTES,
  "components/data/inspector/basic/default",
  "components/data/code-editor/state/read-only",
  "components/data/list/basic/default",
  "components/data/table/basic/default",
  "components/foundation/badge/basic/default",
  "components/foundation/button/basic/contained",
  "components/foundation/button/basic/text",
  "components/foundation/button/basic/outlined",
  "components/foundation/button/sizes/small",
  "components/foundation/button/sizes/medium",
  "components/foundation/button/sizes/large",
  "components/foundation/button/color/primary",
  "components/foundation/button/color/success",
  "components/foundation/button/color/warning",
  "components/foundation/button/color/error",
  "components/foundation/button/color/neutral",
  "components/foundation/divider/variants/full-width",
  "components/foundation/divider/variants/inset",
  "components/foundation/divider/variants/middle",
  "components/foundation/pane/variants/filled",
  "components/foundation/pane/variants/glass",
  "components/foundation/pane/variants/outlined",
  "components/foundation/typography/variants/default",
  "components/inputs/control-group/basic/default",
  "components/inputs/collection-input/value/selected",
  "components/inputs/collection-input/value/empty",
  "components/inputs/collection-input/state/disabled",
  "components/inputs/collection-input/state/readonly",
  "components/inputs/collection-input/density/compact",
  "components/inputs/color-input/basic/color-input",
  "components/inputs/color-input/state/open",
  "components/inputs/color-input/presentation/expanded",
  "components/inputs/enum-input/presentation/cycle",
  "components/inputs/field/text/default",
  "components/inputs/field/number/input",
  "components/inputs/field/number/slider",
  "components/inputs/field/integer/input",
  "components/inputs/field/boolean/switch",
  "components/inputs/field/enum/default",
  "components/inputs/field/vector/default",
  "components/inputs/field/rotation/default",
  "components/inputs/field/matrix/default",
  "components/inputs/field/reference/default",
  "components/inputs/field/collection/default",
  "components/inputs/field/path/default",
  "components/inputs/field/color/input",
  "components/inputs/field/readonly/default",
  "components/inputs/text-field/basic/default",
  "components/inputs/number-input/basic/default",
  "components/inputs/integer-input/basic/value",
  "components/inputs/integer-input/basic/labeled",
  "components/inputs/integer-input/state/disabled",
  "components/inputs/integer-input/state/readonly",
  "components/inputs/progress-checkbox/progress/default",
  "components/inputs/slider-control/basic/default",
  "components/inputs/vector-input/basic/default",
  "components/inputs/matrix-input/basic/default",
  "components/inputs/path-input/value/path",
  "components/inputs/path-input/value/empty",
  "components/inputs/path-input/state/disabled",
  "components/inputs/path-input/state/readonly",
  "components/inputs/path-input/density/compact",
  "components/inputs/reference-input/basic/default",
  "components/inputs/checkbox/state/checked",
  "components/inputs/checkbox/state/unchecked",
  "components/inputs/switcher/state/on",
  "components/inputs/switcher/state/off",
  "hud/foundation/window/inventory/default",
  "hud/foundation/frame/inventory/default",
  "hud/foundation/timeline/inventory/default",
] as const)

export const UI_DOM_STORY_ROUTES: readonly string[] = Object.freeze([...new Set([
  ...collectOverviewRoutes(UI_DOM_DECLARED_STORY_ROUTES),
  ...UI_DOM_DECLARED_STORY_ROUTES,
])])

export type UiDomStoryRoute = string

export function isUiDomStoryRoute(route: string): route is UiDomStoryRoute {
  return UI_DOM_STORY_ROUTES.includes(route)
}

function collectOverviewRoutes(routes: readonly string[]): readonly string[] {
  const overviews = new Set<string>([""])
  for (const route of routes) {
    const parts = route.split("/")
    for (let length = 1; length < parts.length; length++) {
      overviews.add(parts.slice(0, length).join("/"))
    }
  }
  return Object.freeze([...overviews])
}
