import type {Document, Element, HTMLElement, Node} from "@zavx0z/dom"

export type DomOverviewItem = Readonly<{
  label: string
  route: string
}>

export type DomOverviewStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
}>

export const domOverviewStoryCss = String.raw`
.dom-overview-story {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 680px;
  min-height: 320px;
  gap: 12px;
  padding: 20px;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 6px;
  background: rgb(48, 48, 48);
  color: rgb(224, 224, 224);
}

.dom-overview-story__title {
  display: block;
  min-height: 28px;
  color: rgb(126, 220, 236);
  font-size: 16px;
}

.dom-overview-story__summary {
  display: block;
  min-height: 20px;
  color: rgb(176, 176, 176);
  font-size: 12px;
}

.dom-overview-story__list {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 638px;
  max-height: 230px;
  gap: 5px;
  padding: 6px;
  overflow-y: auto;
  scrollbar-width: thin;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 4px;
  background: rgb(36, 36, 36);
}

.dom-overview-story__item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 30px;
  gap: 8px;
  padding: 5px 9px;
  border: 1px solid rgb(72, 72, 72);
  border-radius: 3px;
  background: rgb(48, 48, 48);
  color: rgb(224, 224, 224);
  font-size: 12px;
}

.dom-overview-story__label {
  display: inline;
  width: 220px;
  color: rgb(224, 224, 224);
  font-size: 12px;
}

.dom-overview-story__route {
  display: inline;
  width: 370px;
  color: rgb(160, 160, 160);
  font-size: 10px;
}
`

export function createDomOverviewStory(
  document: Document,
  input: Readonly<{
    title: string
    route: string
    items: readonly DomOverviewItem[]
  }>,
): DomOverviewStory {
  const root = document.createElement("section")
  const title = document.createElement("h2")
  const summary = document.createElement("p")
  const list = document.createElement("ul")
  root.className = "dom-overview-story"
  root.setAttribute("data-overview-route", input.route)
  title.className = "dom-overview-story__title"
  title.appendChild(document.createTextNode(input.title))
  summary.className = "dom-overview-story__summary"
  summary.appendChild(document.createTextNode(
    `Семантических DOM-разделов: ${input.items.length}`,
  ))
  list.className = "dom-overview-story__list"
  for (const item of input.items) {
    const row = document.createElement("li")
    const label = document.createElement("span")
    const route = document.createElement("code")
    row.className = "dom-overview-story__item"
    row.setAttribute("data-route", item.route)
    label.className = "dom-overview-story__label"
    label.appendChild(document.createTextNode(item.label))
    route.className = "dom-overview-story__route"
    route.appendChild(document.createTextNode(`/${item.route}`))
    row.append(label, route)
    list.appendChild(row)
  }
  root.append(title, summary, list)
  return Object.freeze({
    element: root,
    source: Object.freeze({
      html: serialize(root),
      css: domOverviewStoryCss,
      typescript: [
        'import {createDocument} from "@zavx0z/dom"',
        "",
        "const document = createDocument()",
        'const overview = document.createElement("section")',
        `overview.setAttribute("data-overview-route", ${JSON.stringify(input.route)})`,
        `const items = ${JSON.stringify(input.items, null, 2)}`,
        "// Append one semantic list item per exact child route.",
        "document.appendChild(overview)",
      ].join("\n"),
    }),
  })
}

function serialize(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attrs = element.getAttributeNames().sort().map((name) =>
    ` ${name}="${escape(element.getAttribute(name) ?? "")}"`).join("")
  const children = [...element.childNodes]
  if (children.length === 0) return `${indent}<${element.localName}${attrs}></${element.localName}>`
  if (children.every((node) => node.nodeType === 3)) {
    return `${indent}<${element.localName}${attrs}>${escape(element.textContent ?? "")}</${element.localName}>`
  }
  const body = children.map((node: Node) => node.nodeType === 3
    ? `${"  ".repeat(depth + 1)}${escape(node.textContent ?? "")}`
    : serialize(node as Element, depth + 1)).join("\n")
  return `${indent}<${element.localName}${attrs}>\n${body}\n${indent}</${element.localName}>`
}

function escape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}
