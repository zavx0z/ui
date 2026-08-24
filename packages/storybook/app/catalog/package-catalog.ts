export type UiPackageStorybookId = "elements" | "components" | "storybook" | "hud"
export type UiStorybookPresentation = "dom" | "webgpu" | "webgpu-diagnostic"

export type UiPackageCatalogEntry = Readonly<{
  id: UiPackageStorybookId
  packageName: `@ui/${string}`
  title: string
  summary: string
  storybook: string
  routePrefix: `/${string}`
  defaultRoute: `/${string}`
  presentation: UiStorybookPresentation
}>

export const UI_PACKAGE_CATALOG: readonly UiPackageCatalogEntry[] = Object.freeze([
  Object.freeze({
    id: "elements",
    packageName: "@ui/elements",
    title: "Элементы UI",
    summary: "WebGPU-примитивы, controlled input, прокрутка, widget appearance и тема поверх Layout.",
    storybook: "Сохраняет все принадлежащие Elements сценарии и их точные production imports.",
    routePrefix: "/elements",
    defaultRoute: "/elements/",
    presentation: "webgpu",
  }),
  Object.freeze({
    id: "components",
    packageName: "@ui/components",
    title: "Компоненты UI",
    summary: "Универсальные controls и Fields, составленные из Elements.",
    storybook: "Сохраняет полный каталог сценариев Components, controls, исходник и retained preview.",
    routePrefix: "/components",
    defaultRoute: "/components/",
    presentation: "webgpu",
  }),
  Object.freeze({
    id: "storybook",
    packageName: "@ui/storybook",
    title: "Инфраструктура Workbench",
    summary: "Типизированное дерево маршрутов, registry сценариев, пятипанельный shell и no-HMR server.",
    storybook: "Показывает существующий диагностический fixture общей инфраструктуры.",
    routePrefix: "/storybook",
    defaultRoute: "/storybook/",
    presentation: "webgpu-diagnostic",
  }),
  Object.freeze({
    id: "hud",
    packageName: "@ui/hud",
    title: "HUD",
    summary: "HUD-панели, визуальные controls, взаимодействие с рамкой и timeline.",
    storybook: "Честная DOM-страница состава package: отдельного visual stand сейчас нет.",
    routePrefix: "/hud",
    defaultRoute: "/hud/",
    presentation: "dom",
  }),
])

const CATALOG_BY_ID = new Map(UI_PACKAGE_CATALOG.map((entry) => [entry.id, entry]))

export function uiPackageCatalogEntry(id: UiPackageStorybookId): UiPackageCatalogEntry {
  const entry = CATALOG_BY_ID.get(id)
  if (entry === undefined) throw new Error(`Unknown UI package storybook: ${id}`)
  return entry
}
