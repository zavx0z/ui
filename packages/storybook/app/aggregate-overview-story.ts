import type {
  Document,
  Element,
  HTMLElement,
  Node,
} from "@zavx0z/dom"

export type AggregateChildStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
  dispose?(): void
}>

export type AggregateOverviewItem = Readonly<{
  label: string
  route: string
  representativeRoute: string
}>

export type AggregateOverviewStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
  children: readonly AggregateChildStory[]
  dispose(): void
}>

export const aggregateOverviewStoryCss = String.raw`
.ui-aggregate-overview {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  flex-grow: 1;
  gap: 4px;
  padding: 4px;
  overflow: auto;
  background: #1d1d1d;
}
.ui-aggregate-overview__heading {
  box-sizing: border-box;
  display: block;
  min-height: 24px;
  margin: 0;
  padding: 4px 7px;
  border-bottom: 1px solid #111111;
  color: #d8d8d8;
  font-size: 12px;
}
.ui-aggregate-overview__items {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
}
.ui-aggregate-overview__item {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 160px;
  overflow: hidden;
  border: 1px solid #111111;
  border-radius: 4px;
  background: #242424;
}
.ui-aggregate-overview__label {
  box-sizing: border-box;
  display: block;
  height: 24px;
  margin: 0;
  padding: 4px 7px;
  border-bottom: 1px solid #111111;
  background: #303030;
  color: #c8c8c8;
  font-size: 11px;
}
.ui-aggregate-overview__preview {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  flex-grow: 1;
  overflow: hidden;
  padding: 4px;
}
`

export async function createAggregateOverviewStory(
  document: Document,
  options: Readonly<{
    title: string
    route: string
    items: readonly AggregateOverviewItem[]
    css: string
    load(route: string): Promise<AggregateChildStory>
  }>,
): Promise<AggregateOverviewStory> {
  const root = document.createElement("section")
  const heading = document.createElement("h2")
  const items = document.createElement("div")
  root.className = "ui-aggregate-overview"
  root.setAttribute("data-overview-route", options.route)
  root.setAttribute("aria-label", `Обзор компонентов: ${options.title}`)
  heading.className = "ui-aggregate-overview__heading"
  heading.textContent = options.title
  items.className = "ui-aggregate-overview__items"
  root.append(heading, items)

  const children: AggregateChildStory[] = []
  try {
    for (const item of options.items) {
      const child = await options.load(item.representativeRoute)
      const owner = document.createElement("article")
      const label = document.createElement("h3")
      const preview = document.createElement("section")
      owner.className = "ui-aggregate-overview__item"
      owner.setAttribute("data-child-route", item.route)
      owner.setAttribute("data-representative-route", item.representativeRoute)
      label.className = "ui-aggregate-overview__label"
      label.textContent = item.label
      preview.className = "ui-aggregate-overview__preview"
      preview.appendChild(child.element)
      owner.append(label, preview)
      items.appendChild(owner)
      children.push(child)
    }
  } catch (error) {
    for (const child of children) child.dispose?.()
    throw error
  }

  let disposed = false
  return Object.freeze({
    element: root,
    get source() {
      return Object.freeze({
        html: serialize(root),
        css: options.css,
        typescript: children.map((child, index) => [
          `// ${options.items[index]?.label ?? "Preview"}`,
          child.source.typescript,
        ].join("\n")).join("\n\n"),
      })
    },
    children: Object.freeze(children),
    dispose() {
      if (disposed) return
      disposed = true
      for (const child of children) child.dispose?.()
    },
  })
}

function serialize(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attrs = element.getAttributeNames().sort().map((name) => {
    const value = element.getAttribute(name) ?? ""
    return ` ${name}="${escapeHtml(value)}"`
  }).join("")
  const children = [...element.childNodes].filter(node => node.nodeType === 1 || node.nodeType === 3)
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
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}
