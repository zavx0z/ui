import type {StorybookStoryArgs} from "@zavx0z/storybook/stories"

type CssDeclaration = readonly [property: string, value: string]

type StyleStateSource = Readonly<{
  name: string
  declarations: readonly CssDeclaration[]
}>

type StyleOwnerSource = Readonly<{
  owner: string
  declarations: readonly CssDeclaration[]
  states?: readonly StyleStateSource[]
}>

type StylePathSource = Readonly<{
  label: string
  selector?: `& .${string}`
  owners: readonly StyleOwnerSource[]
  activeState?: string
  storyStyle?: readonly CssDeclaration[]
  storyStates?: readonly StyleStateSource[]
}>

export type ElementStyleSourceOptions = Readonly<{
  component: string
  section: string
  variant: string
}>

const divOwner: StyleOwnerSource = {
  owner: "@ui/elements/div",
  declarations: [
    declaration("background", "transparent"),
    declaration("border-color", "transparent"),
    declaration("border-radius", "4px"),
    declaration("border-width", "1px"),
    declaration("padding", "0"),
    declaration("overflow", "visible"),
    declaration("opacity", "1"),
    declaration("z-index", "var(--ui-z-container)"),
  ],
}

const spanOwner: StyleOwnerSource = {
  owner: "@ui/elements/span",
  declarations: [
    declaration("color", "var(--ui-text)"),
    declaration("font-size", "12px"),
    declaration("text-align", "left"),
    declaration("opacity", "1"),
  ],
}

const imgOwner: StyleOwnerSource = {
  owner: "@ui/elements/img",
  declarations: [
    declaration("object-fit", "contain"),
    declaration("opacity", "1"),
  ],
}

const buttonOwner: StyleOwnerSource = {
  owner: "@ui/elements/button",
  declarations: [
    declaration("border-radius", "4px"),
    declaration("border-width", "1px"),
    declaration("font-size", "11px"),
    declaration("gap", "3px"),
    declaration("height", "22px"),
    declaration("padding-inline", "6px"),
    declaration("z-index", "var(--ui-z-element)"),
  ],
  states: [
    rgbaState("idle", [84, 84, 84, 255], [61, 61, 61, 255], [230, 230, 230, 255]),
    rgbaState("hover", [101, 101, 101, 255], [70, 70, 70, 255], [255, 255, 255, 255]),
    rgbaState("active", [71, 114, 179, 255], [61, 61, 61, 255], [255, 255, 255, 255]),
    rgbaState("disabled", [84, 84, 84, 127], [61, 61, 61, 127], [230, 230, 230, 127]),
  ],
}

const inputOwner: StyleOwnerSource = {
  owner: "@ui/elements/input",
  declarations: [
    declaration("border-radius", "4px"),
    declaration("border-width", "1px"),
    declaration("font-size", "11px"),
    declaration("text-align", "left"),
  ],
  states: [
    rgbaState("idle", [29, 29, 29, 255], [61, 61, 61, 255], [230, 230, 230, 255]),
    rgbaState("hover", [35, 35, 35, 255], [70, 70, 70, 255], [255, 255, 255, 255]),
    rgbaState("active", [24, 24, 24, 255], [61, 61, 61, 255], [255, 255, 255, 255]),
    rgbaState("disabled", [29, 29, 29, 127], [61, 61, 61, 127], [230, 230, 230, 127]),
  ],
}

const selectOwner: StyleOwnerSource = {
  owner: "@ui/elements/select",
  declarations: [
    declaration("border-radius", "4px"),
    declaration("border-width", "1px"),
    declaration("font-size", "11px"),
  ],
  states: [
    rgbaState("idle", [40, 40, 40, 255], [61, 61, 61, 255], [230, 230, 230, 255]),
    rgbaState("hover", [48, 48, 48, 255], [70, 70, 70, 255], [255, 255, 255, 255]),
    rgbaState("active", [71, 114, 179, 179], [61, 61, 61, 255], [255, 255, 255, 255]),
    rgbaState("open", [71, 114, 179, 179], [61, 61, 61, 255], [255, 255, 255, 255]),
    rgbaState("disabled", [40, 40, 40, 127], [61, 61, 61, 127], [230, 230, 230, 127]),
  ],
}

const ulOwner: StyleOwnerSource = {
  owner: "@ui/elements/list#ul",
  declarations: [
    declaration("background", "transparent"),
    declaration("border-color", "transparent"),
    declaration("border-radius", "0"),
    declaration("padding", "0"),
    declaration("overflow-y", "auto"),
    declaration("z-index", "var(--ui-z-container)"),
  ],
}

const liOwner: StyleOwnerSource = {
  owner: "@ui/elements/list#li",
  declarations: [
    declaration("border-radius", "4px"),
    declaration("border-width", "1px"),
    declaration("padding", "0"),
    declaration("z-index", "var(--ui-z-element)"),
  ],
  states: [
    rgbaState("idle", [255, 255, 255, 0], [45, 45, 45, 255], [204, 204, 204, 255]),
    rgbaState("hover", [255, 255, 255, 0], [52, 52, 52, 255], [163, 163, 163, 255]),
    rgbaState("active", [71, 114, 179, 255], [45, 45, 45, 255], [255, 255, 255, 255]),
    rgbaState("selected", [71, 114, 179, 255], [45, 45, 45, 255], [255, 255, 255, 255]),
    rgbaState("disabled", [255, 255, 255, 0], [45, 45, 45, 127], [204, 204, 204, 127]),
  ],
}

const statusBarOwner: StyleOwnerSource = {
  owner: "@ui/elements/status-bar",
  declarations: [
    declaration("background", "rgba(24, 24, 24, 1)"),
    declaration("border-color", "rgba(22, 22, 22, 1)"),
    declaration("border-radius", "0"),
    declaration("border-width", "2px"),
    declaration("color", "rgba(135, 135, 135, 1)"),
    declaration("font-size", "11px"),
    declaration("padding-inline", "12px"),
    declaration("z-index", "var(--ui-z-container)"),
  ],
  states: [
    {name: "default", declarations: [declaration("color", "rgba(135, 135, 135, 1)")]},
    {name: "highlighted", declarations: [declaration("color", "rgba(255, 255, 255, 1)")]},
  ],
}

const textOwner = (name: "h1" | "h2" | "p"): StyleOwnerSource => ({
  owner: `@ui/elements/text#${name}`,
  declarations: name === "h1"
    ? [declaration("color", "var(--ui-cyan)"), declaration("font-size", "22px")]
    : name === "h2"
      ? [declaration("color", "var(--ui-cyan)"), declaration("font-size", "16px")]
      : [declaration("color", "var(--ui-text)"), declaration("font-size", "12px")],
})

/** Creates the three synchronized, copyable source documents for one Element story. */
export function elementStorySource(
  options: ElementStyleSourceOptions,
  args: StorybookStoryArgs,
  typescript: string,
) {
  return Object.freeze({
    html: elementHtml(options, args),
    css: renderStylePaths(rootSelector(options), elementStylePaths(options, args)),
    typescript,
  })
}

function elementHtml(options: ElementStyleSourceOptions, args: StorybookStoryArgs): string {
  const label = escapeHtml(stringArg(args, "label", "Элемент UI"))
  const disabled = booleanArg(args, "disabled") ? " disabled" : ""
  const state = escapeHtml(stringArg(args, "state", options.variant))
  if (options.component === "div") {
    return options.section === "overflow"
      ? '<div class="div"><div class="column">Левая область</div><div class="column">Правая область</div></div>'
      : `<div class="div">${options.section === "scroll" ? "Прокручиваемое содержимое" : label}</div>`
  }
  if (options.component === "span") return `<span class="span">${label}</span>`
  if (options.component === "button") return `<button class="button" type="button" data-state="${state}"${disabled}>${label}</button>`
  if (options.component === "input") return `<input class="input" type="text" value="${label}" data-state="${state}"${disabled}>`
  if (options.component === "select") return [
    `<select class="select" aria-expanded="${booleanArg(args, "open")}"${disabled}>`,
    '  <option>Сложение</option>',
    `  <option selected>${label}</option>`,
    '  <option>Вычитание</option>',
    '  <option disabled>Деление</option>',
    "</select>",
  ].join("\n")
  if (options.component === "img") return '<img class="img" src="artwork.svg" alt="Демонстрационное изображение">'
  if (options.component === "list") return [
    '<ul class="list">',
    '  <li class="item" aria-selected="false">UiRuntime</li>',
    '  <li class="item" aria-selected="true">UiSurface</li>',
    '  <li class="item" aria-disabled="true">FlexBox</li>',
    "</ul>",
  ].join("\n")
  if (options.component === "popover") return [
    '<div class="popover">',
    '  <button class="trigger" type="button" popovertarget="element-popover">Открыть</button>',
    `  <div class="content" id="element-popover" popover${booleanArg(args, "open") ? ' data-state="open"' : ""}>Popover</div>`,
    "</div>",
  ].join("\n")
  if (options.component === "status-bar") return [
    '<footer class="status-bar">',
    '  <span>Collection</span>',
    `  <span data-highlighted="${booleanArg(args, "highlight-version")}">4.5.5</span>`,
    "</footer>",
  ].join("\n")
  if (options.component === "css" && options.section === "typography") return [
    '<article class="style-example">',
    '  <h1>Главный заголовок</h1>',
    '  <h2>Заголовок раздела</h2>',
    '  <p>Основной текст</p>',
    "</article>",
  ].join("\n")
  if (options.component === "css") return options.section === "flex"
    ? '<div class="style-example"><span>Первый</span><span>Второй</span><span>Третий</span></div>'
    : '<div class="style-example">CSS style</div>'
  if (options.component === "theme") return `<div class="theme-swatch">${escapeHtml(stringArg(args, "tone", "cyan"))}</div>`
  return `<button class="event-button" type="button" data-state="${state}"${disabled}>${label}</button>`
}

function elementStylePaths(options: ElementStyleSourceOptions, args: StorybookStoryArgs): readonly StylePathSource[] {
  if (options.component === "div") return [{label: "div target", owners: [divOwner], storyStyle: divStoryStyle(options, args)}]
  if (options.component === "span") return [{
    label: "span target",
    owners: [spanOwner],
    storyStyle: [
      declaration("font-size", "20px"),
      declaration("color", cssColor(args.tone, "cyan")),
      declaration("text-align", stringArg(args, "align", "center")),
    ],
  }]
  if (options.component === "button") return [{label: "button target", owners: [divOwner, buttonOwner], activeState: booleanArg(args, "disabled") ? "disabled" : "idle"}]
  if (options.component === "input") return [{
    label: "input target",
    owners: [divOwner, inputOwner],
    activeState: booleanArg(args, "disabled") ? "disabled" : booleanArg(args, "active") ? "active" : "idle",
  }]
  if (options.component === "select") return [{
    label: "select trigger target",
    owners: [divOwner, buttonOwner, selectOwner],
    activeState: booleanArg(args, "disabled") ? "disabled" : booleanArg(args, "open") || booleanArg(args, "active") ? "open" : "idle",
  }]
  if (options.component === "img") return [{label: "img target", owners: [imgOwner], storyStyle: [declaration("opacity", "0.94")]}]
  if (options.component === "list") return [
    {
      label: "ul container target",
      owners: [divOwner, ulOwner],
      storyStyle: [
        declaration("background", "rgba(4, 8, 14, 0.38)"),
        declaration("border-color", cssColor(args.tone, "cyan")),
        declaration("overflow-y", stringArg(args, "mode", "regular") === "scroll" ? "auto" : "hidden"),
      ],
    },
    {
      label: "li row target",
      selector: "& .item",
      owners: [divOwner, liOwner],
      activeState: stringArg(args, "mode", "regular") === "interactive" ? "hover" : "idle",
      storyStates: [
        {name: "idle", declarations: [declaration("background", "transparent"), declaration("border-color", "transparent"), declaration("border-radius", "4px")]},
        {name: "hover", declarations: [declaration("background", toneFill(args, 0.1)), declaration("border-color", "transparent"), declaration("border-radius", "4px")]},
        {name: "active", declarations: [declaration("background", "transparent"), declaration("border-color", cssColor(args.tone, "cyan")), declaration("border-radius", "4px")]},
      ],
    },
  ]
  if (options.component === "popover") return [
    {label: "popover trigger target", selector: "& .trigger", owners: [divOwner, buttonOwner], activeState: booleanArg(args, "open") ? "active" : "idle"},
    {
      label: "popover content target",
      selector: "& .content",
      owners: [divOwner],
      storyStyle: [declaration("background", "var(--ui-bg-panel)"), declaration("border-color", "var(--ui-border-rule)"), declaration("border-radius", "4px")],
    },
  ]
  if (options.component === "status-bar") return [{label: "status bar target", owners: [statusBarOwner], activeState: booleanArg(args, "highlight-version") ? "highlighted" : "default"}]
  if (options.component === "css") return cssStylePaths(options, args)
  if (options.component === "theme") return [{
    label: "theme swatch target",
    owners: [divOwner],
    storyStyle: [
      declaration("background", cssColor(args.tone, "cyan")),
      declaration("border-radius", px(numberArg(args, "radius", 28))),
      declaration("opacity", String(numberArg(args, "opacity", 0.84))),
    ],
  }]
  return [{label: "pointer event button target", owners: [divOwner, buttonOwner], activeState: eventButtonState(args), storyStates: eventStoryStates()}]
}

function cssStylePaths(options: ElementStyleSourceOptions, args: StorybookStoryArgs): readonly StylePathSource[] {
  if (options.section === "typography") return [{
    label: "h1 target",
    owners: [spanOwner, textOwner("h1")],
    storyStyle: [declaration("font-size", "26px"), declaration("text-align", "center")],
  }]
  const storyStyle: CssDeclaration[] = [
    declaration("background", cssColor(args.tone, "cyan")),
    declaration("opacity", String(numberArg(args, "opacity", 0.84))),
  ]
  if (options.section === "padding") storyStyle.push(declaration("padding", px(numberArg(args, "padding", 28))))
  if (options.section === "flex") storyStyle.push(
    declaration("display", "flex"),
    declaration("gap", "16px"),
    declaration("align-items", "center"),
    declaration("justify-content", "space-between"),
  )
  if (options.section === "border") storyStyle.push(
    declaration("border-radius", px(numberArg(args, "radius", 28))),
    declaration("border-color", cssColor(args.tone, "cyan")),
    declaration("border-width", "2px"),
  )
  return [{label: "StyleProps div target", owners: [divOwner], storyStyle}]
}

function divStoryStyle(options: ElementStyleSourceOptions, args: StorybookStoryArgs): readonly CssDeclaration[] {
  if (options.section === "overflow") return [
    declaration("overflow", "hidden"),
    declaration("background", toneFill(args, 0.08)),
    declaration("border-color", cssColor(args.tone, "cyan")),
    declaration("border-width", "6px"),
  ]
  if (options.section === "scroll") return [
    declaration(options.variant === "both" ? "overflow" : options.variant === "horizontal" ? "overflow-x" : "overflow-y", "auto"),
    declaration("background", toneFill(args, 0.06)),
    declaration("border-color", cssColor(args.tone, "cyan")),
    declaration("border-width", "2px"),
    declaration("padding", px(stringArg(args, "density", "regular") === "compact" ? 16 : 24)),
    declaration("color", "var(--ui-muted)"),
    declaration("font-size", "12px"),
    declaration("line-height", "1.55"),
  ]
  const result: CssDeclaration[] = [
    declaration("background", toneFill(args, options.variant === "background" ? 0.18 : 0.08)),
    declaration("border-color", options.variant === "border" ? cssColor(args.tone, "cyan") : "rgba(214, 231, 255, 0.18)"),
    declaration("border-width", options.variant === "border" ? "2px" : "1px"),
    declaration("padding", px(options.variant === "padding" ? stringArg(args, "density", "regular") === "compact" ? 18 : 34 : 18)),
  ]
  if (options.variant === "z-index") result.push(declaration("z-index", "1"))
  return result
}

function renderStylePaths(selector: string, paths: readonly StylePathSource[]): string {
  const root = paths.find((path) => path.selector === undefined)
  const parts = paths.filter((path) => path.selector !== undefined)
  const lines = [`${selector} {`]
  if (root !== undefined) lines.push(...renderStyleLayer(root, 2))
  for (const part of parts) lines.push(`  ${part.selector} {`, ...renderStyleLayer(part, 4), "  }")
  lines.push("}")
  return lines.join("\n")
}

function renderStyleLayer(path: StylePathSource, spaces: number): string[] {
  const lines = [`${" ".repeat(spaces)}/* Полная CSS-цепочка: ${path.label} */`]
  lines.push(...renderDeclarationChain(path.owners.map((owner) => ({owner: owner.owner, declarations: owner.declarations})), path.storyStyle ?? [], spaces))
  const stateNames = new Set<string>()
  for (const owner of path.owners) for (const branch of owner.states ?? []) stateNames.add(branch.name)
  for (const branch of path.storyStates ?? []) stateNames.add(branch.name)
  for (const stateName of stateNames) {
    const stateOwners = path.owners.flatMap((owner) => {
      const branch = owner.states?.find(({name}) => name === stateName)
      return branch === undefined ? [] : [{owner: owner.owner, declarations: branch.declarations}]
    })
    const storyState = path.storyStates?.find(({name}) => name === stateName)?.declarations ?? []
    lines.push(
      `${" ".repeat(spaces)}&${stateSelector(stateName)} {${path.activeState === stateName ? " /* Текущее состояние сценария */" : ""}`,
      ...renderDeclarationChain(stateOwners, storyState, spaces + 2),
      `${" ".repeat(spaces)}}`,
    )
  }
  return lines
}

function renderDeclarationChain(
  owners: readonly Readonly<{owner: string; declarations: readonly CssDeclaration[]}>[],
  storyDeclarations: readonly CssDeclaration[],
  spaces: number,
): string[] {
  const indent = " ".repeat(spaces)
  const lines: string[] = []
  for (const [index, owner] of owners.entries()) {
    lines.push(`${indent}/* ${index < owners.length - 1 ? "Унаследовано от" : "Задано в"} ${owner.owner} */`)
    for (const [property, value] of owner.declarations) lines.push(`${indent}${property}: ${value};`)
  }
  if (storyDeclarations.length > 0) {
    const previousOwner = owners[owners.length - 1]?.owner ?? "owner defaults"
    lines.push(`${indent}/* Переопределено относительно ${previousOwner} в текущем сценарии */`)
    for (const [property, value] of storyDeclarations) lines.push(`${indent}${property}: ${value};`)
  }
  return lines
}

function rootSelector(options: ElementStyleSourceOptions): string {
  if (options.component === "pointer") return ".event-button"
  if (options.component === "css") return ".style-example"
  if (options.component === "theme") return ".theme-swatch"
  return `.${options.component}`
}

function stateSelector(name: string): string {
  if (name === "hover") return ":hover"
  if (name === "active") return ":active"
  if (name === "disabled") return ':disabled, &[aria-disabled="true"]'
  if (name === "open") return '[aria-expanded="true"], &[data-state="open"]'
  if (name === "selected") return '[aria-selected="true"]'
  if (name === "highlighted") return '[data-highlighted="true"]'
  return `[data-state="${name}"]`
}

function eventStoryStates(): readonly StyleStateSource[] {
  return [
    {name: "idle", declarations: [declaration("border-color", "var(--ui-cyan)")]},
    {name: "hover", declarations: [declaration("border-color", "var(--ui-cyan)")]},
    {name: "active", declarations: [declaration("border-color", "var(--ui-orange)")]},
    {name: "release", declarations: [declaration("border-color", "var(--ui-red)")]},
    {name: "click", declarations: [declaration("border-color", "var(--ui-green)")]},
    {name: "disabled", declarations: [declaration("border-color", "var(--ui-muted)")]},
  ]
}

function rgbaState(
  name: string,
  background: readonly [number, number, number, number],
  border: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
): StyleStateSource {
  return {
    name,
    declarations: [
      declaration("background", rgba(background)),
      declaration("border-color", rgba(border)),
      declaration("color", rgba(color)),
    ],
  }
}

function eventButtonState(args: StorybookStoryArgs): string {
  const value = stringArg(args, "state", "idle")
  return value === "press" ? "active" : value
}

function toneFill(args: StorybookStoryArgs, alpha: number): string {
  const tone = stringArg(args, "tone", "cyan")
  if (tone === "green") return `rgba(82, 196, 123, ${alpha})`
  if (tone === "orange") return `rgba(255, 190, 111, ${alpha})`
  if (tone === "red") return `rgba(255, 127, 111, ${alpha})`
  return `rgba(111, 211, 255, ${alpha})`
}

function cssColor(value: unknown, fallback: string): string {
  const color = typeof value === "string" ? value : fallback
  return color.startsWith("rgba(") || color.startsWith("#") ? color : `var(--ui-${color})`
}

function rgba(value: readonly [number, number, number, number]): string {
  return `rgba(${value[0]}, ${value[1]}, ${value[2]}, ${value[3] / 255})`
}

function declaration(property: string, value: string): CssDeclaration {
  return [property, value]
}

function px(value: number): string {
  return value === 0 ? "0" : `${value}px`
}

function stringArg(args: StorybookStoryArgs, key: string, fallback: string): string {
  const value = args[key]
  return typeof value === "string" ? value : fallback
}

function numberArg(args: StorybookStoryArgs, key: string, fallback: number): number {
  const value = args[key]
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function booleanArg(args: StorybookStoryArgs, key: string): boolean {
  return args[key] === true
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}
