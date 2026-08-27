import type {
  Document,
  Element,
  HTMLElement,
  Node,
} from "@zavx0z/dom"
import {
  ENUM_DOM_STORY_ROUTES,
  type EnumDomStoryRoute,
} from "./dom-routes.ts"

export type EnumDomStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
}>

export const enumDomStoryCss = String.raw`
.enum-dom-story {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 380px;
  min-height: 170px;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 5px;
  background: rgb(48, 48, 48);
  color: rgb(224, 224, 224);
}

.enum-dom-story__header,
.enum-dom-story__description,
.enum-dom-story__status {
  box-sizing: border-box;
  display: block;
  min-height: 24px;
  padding: 4px 6px;
  color: rgb(176, 176, 176);
  font-size: 12px;
}

.enum-dom-story__header {
  color: rgb(126, 220, 236);
}

.enum-dom-story__select,
.enum-dom-story__readonly {
  box-sizing: border-box;
  display: block;
  width: 348px;
  height: 32px;
  padding: 5px 10px;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 4px;
  background: rgb(36, 36, 36);
  color: rgb(224, 224, 224);
  font-size: 12px;
}

.enum-dom-story__select[disabled] { opacity: 0.5; }

.enum-dom-story__expanded {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  width: 348px;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 4px;
}

.enum-dom-story__choice {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 104px;
  height: 28px;
  gap: 6px;
  color: rgb(224, 224, 224);
  font-size: 11px;
}

.enum-dom-story__choice-input {
  box-sizing: border-box;
  display: block;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 1px solid rgb(72, 72, 72);
  border-radius: 8px;
}

.enum-dom-story__status[data-tone="error"] { color: rgb(240, 120, 120); }
.enum-dom-story__status[data-tone="warning"] { color: rgb(240, 188, 96); }
`

export function createEnumDomStory(
  document: Document,
  route: EnumDomStoryRoute,
): EnumDomStory {
  const root = document.createElement("section")
  root.className = "enum-dom-story"

  if (route.endsWith("/expanded")) {
    root.appendChild(createExpanded(document))
  } else if (route.endsWith("/readonly")) {
    const output = document.createElement("div")
    output.className = "enum-dom-story__readonly"
    output.setAttribute("role", "textbox")
    output.setAttribute("aria-readonly", "true")
    output.appendChild(document.createTextNode("Output"))
    root.appendChild(output)
  } else if (route.endsWith("/menu-undefined") || route.endsWith("/menu-error")) {
    root.appendChild(status(document, route.endsWith("/menu-error")
      ? "Menu provider returned an error"
      : "Menu is not defined", route.endsWith("/menu-error") ? "error" : "warning"))
  } else {
    if (route.endsWith("/header-icons") || route.endsWith("/mixed-icons")) {
      const header = document.createElement("div")
      header.className = "enum-dom-story__header"
      header.appendChild(document.createTextNode(route.endsWith("/header-icons")
        ? "● Render mode"
        : "■ Mixed option icons"))
      root.appendChild(header)
    }
    const select = createSelect(document, route)
    root.appendChild(select)
    if (route.endsWith("/selected-description")) {
      const description = document.createElement("p")
      description.className = "enum-dom-story__description"
      description.appendChild(document.createTextNode("Output renders the final WebGPU presentation."))
      root.appendChild(description)
    }
    if (route.endsWith("/invalid-legacy")) {
      root.appendChild(status(document, "Unknown legacy value: raster", "warning"))
    }
    if (route.endsWith("/no-items")) {
      root.appendChild(status(document, "No items", "warning"))
    }
  }

  return Object.freeze({
    element: root,
    source: Object.freeze({
      html: serializeElement(root),
      css: enumDomStoryCss,
      typescript: renderTypeScript(route),
    }),
  })
}

export function isEnumDomStoryRoute(route: string): route is EnumDomStoryRoute {
  return (ENUM_DOM_STORY_ROUTES as readonly string[]).includes(route)
}

function createSelect(document: Document, route: EnumDomStoryRoute): HTMLElement {
  const select = document.createElement("select")
  select.className = "enum-dom-story__select"
  const noItems = route.endsWith("/no-items")
  if (!noItems) {
    for (const [value, label] of [["preview", "Preview"], ["output", "Output"], ["capture", "Capture"]] as const) {
      const option = document.createElement("option")
      option.value = value
      option.appendChild(document.createTextNode(label))
      select.appendChild(option)
    }
    select.value = "output"
  }
  select.disabled = noItems || route.endsWith("/disabled")
  select.title = noItems ? "No items" : "Render mode"
  return select
}

function createExpanded(document: Document): HTMLElement {
  const group = document.createElement("fieldset")
  group.className = "enum-dom-story__expanded"
  for (const [value, checked] of [["Preview", false], ["Output", true], ["Capture", false]] as const) {
    const label = document.createElement("label")
    const input = document.createElement("input")
    label.className = "enum-dom-story__choice"
    input.className = "enum-dom-story__choice-input"
    input.type = "radio"
    input.setAttribute("name", "render-mode")
    input.checked = checked
    label.append(input, value)
    group.appendChild(label)
  }
  return group
}

function status(document: Document, text: string, tone: "warning" | "error"): HTMLElement {
  const element = document.createElement("div")
  element.className = "enum-dom-story__status"
  element.setAttribute("role", tone === "error" ? "alert" : "status")
  element.setAttribute("data-tone", tone)
  element.appendChild(document.createTextNode(text))
  return element
}

function renderTypeScript(route: EnumDomStoryRoute): string {
  return [
    'import {createDocument} from "@zavx0z/dom"',
    "",
    "const document = createDocument()",
    route.endsWith("/expanded")
      ? 'const control = document.createElement("fieldset")'
      : route.endsWith("/readonly")
        ? 'const control = document.createElement("div")'
        : 'const control = document.createElement("select")',
    `control.setAttribute("data-story-route", ${JSON.stringify(route)})`,
    "document.appendChild(control)",
  ].join("\n")
}

function serializeElement(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attributes = element.getAttributeNames().sort().map((name) => {
    const value = element.getAttribute(name) ?? ""
    if ((name === "disabled" || name === "checked") && value === "") return ` ${name}`
    return ` ${name}="${escapeAttribute(value)}"`
  }).join("")
  const children = [...element.childNodes]
  if (children.length === 0) return `${indent}<${element.localName}${attributes}></${element.localName}>`
  if (children.every((node) => node.nodeType === 3)) {
    return `${indent}<${element.localName}${attributes}>${escapeText(element.textContent ?? "")}</${element.localName}>`
  }
  const body = children.map((node: Node) => node.nodeType === 3
    ? `${"  ".repeat(depth + 1)}${escapeText(node.textContent ?? "")}`
    : serializeElement(node as Element, depth + 1)).join("\n")
  return `${indent}<${element.localName}${attributes}>\n${body}\n${indent}</${element.localName}>`
}

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;")
}
