import type {Document, Element, HTMLElement, Node} from "@zavx0z/dom"
import {
  BUTTON_ICON_DOM_STORY_ROUTES,
  type ButtonIconDomStoryRoute,
} from "./dom-routes.ts"

export type ButtonIconDomStory = Readonly<{
  element: HTMLElement
  source: Readonly<{html: string; css: string; typescript: string}>
}>

export const buttonIconDomStoryCss = String.raw`
.button-icon-dom-story {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 34px;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid rgb(22, 22, 22);
  border-radius: 4px;
  background: rgb(71, 71, 71);
  color: rgb(224, 224, 224);
  font-size: 12px;
}

.button-icon-dom-story__icon {
  display: inline;
  width: 18px;
  color: rgb(126, 220, 236);
  font-size: 14px;
}

.button-icon-dom-story__label {
  display: inline;
  width: 74px;
  color: rgb(224, 224, 224);
  font-size: 12px;
}
`

export function createButtonIconDomStory(
  document: Document,
  route: ButtonIconDomStoryRoute,
): ButtonIconDomStory {
  const button = document.createElement("button")
  const icon = document.createElement("span")
  const label = document.createElement("span")
  button.className = "button-icon-dom-story"
  button.setAttribute("type", "button")
  button.title = route.endsWith("/left") ? "Icon left" : "Icon right"
  icon.className = "button-icon-dom-story__icon"
  icon.setAttribute("aria-hidden", "true")
  icon.appendChild(document.createTextNode("◆"))
  label.className = "button-icon-dom-story__label"
  label.appendChild(document.createTextNode("Output"))
  if (route.endsWith("/left")) button.append(icon, label)
  else button.append(label, icon)
  return Object.freeze({
    element: button,
    source: Object.freeze({
      html: serialize(button),
      css: buttonIconDomStoryCss,
      typescript: [
        'import {createDocument} from "@zavx0z/dom"',
        "",
        "const document = createDocument()",
        'const button = document.createElement("button")',
        'const icon = document.createElement("span")',
        'const label = document.createElement("span")',
        route.endsWith("/left")
          ? "button.append(icon, label)"
          : "button.append(label, icon)",
        "document.appendChild(button)",
      ].join("\n"),
    }),
  })
}

export function isButtonIconDomStoryRoute(route: string): route is ButtonIconDomStoryRoute {
  return (BUTTON_ICON_DOM_STORY_ROUTES as readonly string[]).includes(route)
}

function serialize(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attrs = element.getAttributeNames().sort().map((name) => {
    const value = element.getAttribute(name) ?? ""
    return ` ${name}="${escape(value)}"`
  }).join("")
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
