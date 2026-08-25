export type UiPackageStorybookId = "elements" | "components" | "storybook" | "hud"
export type UiStorybookPresentation = "dom" | "webgpu" | "webgpu-diagnostic"

export type UiPackageCatalogEntry = Readonly<{
  id: UiPackageStorybookId
  packageName: `@ui/${string}` | "@zavx0z/storybook"
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
    packageName: "@zavx0z/storybook",
    title: "Интеграция общей Storybook-инфраструктуры",
    summary: "Типизированные маршруты, пятипанельный Workbench и no-HMR delivery подключены как private dev dependency.",
    storybook: "UI-owned diagnostic fixture проверяет интеграцию, не передавая shared package владение UI stories.",
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
