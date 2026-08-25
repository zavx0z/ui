export type UiPackageStorybookId = "elements" | "components" | "hud"
export type UiStorybookPresentation = "dom" | "webgpu"

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
    summary: "WebGPU-примитивы, управляемый ввод, прокрутка, внешний вид виджетов и тема поверх Layout.",
    storybook: "Хранит все сценарии Elements и их точные импорты рабочего кода.",
    routePrefix: "/elements",
    defaultRoute: "/elements/",
    presentation: "webgpu",
  }),
  Object.freeze({
    id: "components",
    packageName: "@ui/components",
    title: "Компоненты UI",
    summary: "Универсальные элементы управления и Fields, собранные из Elements.",
    storybook: "Хранит полный каталог сценариев Components, параметры, исходник и сохранённое превью.",
    routePrefix: "/components",
    defaultRoute: "/components/",
    presentation: "webgpu",
  }),
  Object.freeze({
    id: "hud",
    packageName: "@ui/hud",
    title: "HUD",
    summary: "HUD-панели, визуальные элементы управления, рамка и временная шкала.",
    storybook: "Честная DOM-страница состава пакета: отдельной визуальной витрины пока нет.",
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
