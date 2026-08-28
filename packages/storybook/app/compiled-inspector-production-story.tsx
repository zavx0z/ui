import {
  Inspector,
  InspectorSections,
  InspectorTextSection,
  inspectorComponentCss,
  isInspectorSectionVisible,
  type InspectorCategory
} from "@ui/components/inspector"
import type {Document, Element, HTMLElement, Node} from "@zavx0z/dom"
import {createRoot, useState} from "@zavx0z/react"
import type {RoutedProductionComponentStory} from "./production-component-stories.ts"

const categories: readonly InspectorCategory[] = Object.freeze([
  Object.freeze({id: "source", label: "S", title: "Source documents", sectionIds: Object.freeze(["html", "css"])}),
  Object.freeze({id: "events", label: "E", title: "DOM events", groupStart: true, sectionIds: Object.freeze(["events"])})
])

type StorySection = Readonly<{
  id: string
  label: string
  title: string
  expanded: boolean
  content: string
}>

const initialSections: readonly StorySection[] = Object.freeze([
  Object.freeze({id: "html", label: "HTML", title: "Semantic HTML", expanded: true, content: "Semantic markup"}),
  Object.freeze({id: "css", label: "CSS", title: "Executable CSS", expanded: true, content: "Executable stylesheet"}),
  Object.freeze({id: "events", label: "Events", title: "DOM events", expanded: true, content: "Click and input events"})
])

function InspectorStoryComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("source")
  const [query, setQuery] = useState("")
  const [sections, setSections] = useState(initialSections)
  const onToggle = (id: string, expanded: boolean) => setSections(current => current.map(section =>
    section.id === id ? {...section, expanded} : section
  ))
  return <Inspector
    ariaLabel="Inspector story"
    categoriesLabel="Story categories"
    categories={categories}
    selectedCategoryId={selectedCategoryId}
    query={query}
    searchLabel="Search sections"
    searchPlaceholder="Search sections"
    context={{label: "Button", title: "Inspected element"}}
    onCategoryChange={setSelectedCategoryId}
    onQueryChange={setQuery}
  >
    <InspectorSections>
      {sections.map(section => <InspectorTextSection
        key={section.id}
        id={section.id}
        label={section.label}
        title={section.title}
        content={section.content}
        expanded={section.expanded}
        hidden={!isInspectorSectionVisible(categories, selectedCategoryId, query, section)}
        onToggle={onToggle}
      />)}
    </InspectorSections>
  </Inspector>
}

export function createCompiledInspectorProductionStory(document: Document): RoutedProductionComponentStory {
  const staging = document.createElement("div")
  const root = createRoot(staging)
  root.render(InspectorStoryComponent as any, {})
  const owner = staging.querySelector("aside") as HTMLElement | null
  if (!owner) {
    root.unmount()
    throw new Error("Compiled Inspector story mounted no owner")
  }
  staging.removeChild(owner)
  owner.setAttribute("data-story-component", "inspector")
  const story = Object.freeze({
    element: owner,
    get source() {
      return Object.freeze({html: serialize(owner), css: inspectorComponentCss, typescript: source()})
    },
    dispose() {
      root.unmount()
    }
  })
  return Object.freeze({story, css: inspectorComponentCss})
}

function source(): string {
  return [
    'import {Inspector, InspectorSections, InspectorTextSection, inspectorComponentCss, isInspectorSectionVisible} from "@ui/components/inspector"',
    'import {createRoot, useState} from "@zavx0z/react"',
    "",
    "type StorySection = Readonly<{id: string; label: string; title: string; expanded: boolean; content: string}>",
    `const categories = ${JSON.stringify(categories, null, 2)} as const`,
    `const initialSections = ${JSON.stringify(initialSections, null, 2)} as const`,
    "",
    "function Story() {",
    '  const [category, setCategory] = useState("source")',
    '  const [query, setQuery] = useState("")',
    "  const [sections, setSections] = useState<readonly StorySection[]>(initialSections)",
    "  const onToggle = (id: string, expanded: boolean) => setSections(current => current.map(section =>",
    "    section.id === id ? {...section, expanded} : section",
    "  ))",
    "  return <Inspector categories={categories} selectedCategoryId={category} query={query}",
    "    onCategoryChange={setCategory} onQueryChange={setQuery}>",
    "    <InspectorSections>{sections.map(section =>",
    "      <InspectorTextSection",
    "        key={section.id}",
    "        id={section.id}",
    "        label={section.label}",
    "        title={section.title}",
    "        content={section.content}",
    "        expanded={section.expanded}",
    "        hidden={!isInspectorSectionVisible(categories, category, query, section)}",
    "        onToggle={onToggle}",
    "      />",
    "    )}</InspectorSections>",
    "  </Inspector>",
    "}",
    "createRoot(container).render(<Story />)",
    "void inspectorComponentCss"
  ].join("\n")
}

function serialize(element: Element, depth = 0): string {
  const indent = "  ".repeat(depth)
  const attributes = element.getAttributeNames().sort().map(name =>
    ` ${name}="${escapeHtml(element.getAttribute(name) ?? "")}"`
  ).join("")
  const children = [...element.childNodes].filter(node => node.nodeType === 1 || node.nodeType === 3)
  if (children.length === 0) return `${indent}<${element.localName}${attributes}></${element.localName}>`
  const body = children.map((node: Node) => node.nodeType === 3
    ? `${"  ".repeat(depth + 1)}${escapeHtml(node.textContent ?? "")}`
    : serialize(node as HTMLElement, depth + 1)).join("\n")
  return `${indent}<${element.localName}${attributes}>\n${body}\n${indent}</${element.localName}>`
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}
