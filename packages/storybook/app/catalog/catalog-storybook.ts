import {UI_PACKAGE_CATALOG} from "./package-catalog.ts"
import {storybookPublicPath} from "@zavx0z/storybook/environment"
import {loadStorybookReferenceCatalog} from "../../reference-catalog.ts"

const cards = document.getElementById("ui-package-cards")
if (!(cards instanceof HTMLElement)) throw new Error("UI package catalog container is missing")

document.documentElement.dataset.uiStorybook = "starting"
document.documentElement.dataset.uiStorybookPage = "catalog"

for (const entry of UI_PACKAGE_CATALOG) {
  const article = document.createElement("article")
  article.className = "package-card"
  article.dataset.package = entry.id

  const heading = document.createElement("h2")
  heading.textContent = entry.packageName
  const title = document.createElement("p")
  title.className = "package-title"
  title.textContent = entry.title
  const summary = document.createElement("p")
  summary.textContent = entry.summary
  const storybook = document.createElement("p")
  storybook.className = "storybook-description"
  storybook.textContent = entry.storybook
  const meta = document.createElement("p")
  meta.className = "package-meta"
  meta.textContent = `${entry.presentation.toUpperCase()} · ${entry.defaultRoute}`
  const link = document.createElement("a")
  link.href = storybookPublicPath("ui", entry.defaultRoute)
  link.textContent = "Открыть страницу пакета"
  link.setAttribute("aria-label", `Открыть страницу ${entry.packageName}`)

  article.append(heading, title, summary, storybook, meta, link)
  cards.append(article)
}

document.documentElement.dataset.uiPackageCount = String(UI_PACKAGE_CATALOG.length)
document.documentElement.dataset.uiPackageIds = UI_PACKAGE_CATALOG.map(({id}) => id).join(",")
document.documentElement.dataset.uiStorybook = "ready"

const referenceButton = document.getElementById("load-reference-catalog")
const referenceStatus = document.getElementById("reference-library-status")
if (!(referenceButton instanceof HTMLButtonElement) || !(referenceStatus instanceof HTMLElement)) {
  throw new Error("Reference catalog controls are missing")
}
referenceButton.addEventListener("click", async () => {
  referenceButton.disabled = true
  referenceStatus.textContent = "Загрузка метаданных…"
  try {
    const catalog = await loadStorybookReferenceCatalog()
    referenceStatus.textContent = catalog.references.length === 0
      ? "Принятых эталонов пока нет. Новые снимки остаются кандидатами."
      : `Доступно сравнений: ${catalog.references.length}`
    document.documentElement.dataset.uiReferenceCount = String(catalog.references.length)
  } catch (error) {
    referenceStatus.textContent = "Не удалось загрузить каталог эталонов."
    document.documentElement.dataset.uiReferenceError = error instanceof Error ? error.message : String(error)
    referenceButton.disabled = false
  }
})
