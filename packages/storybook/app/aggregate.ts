import type {
  StorybookStoryArgs,
  StorybookStoryControl,
  StorybookStoryModule,
  StorybookStorySource,
} from "@zavx0z/storybook/stories"

export type UiAggregateStoryEntry = Readonly<{
  id: string
  label: string
  route: string
  module: StorybookStoryModule
}>

export type UiAggregateStoryModule = Readonly<{
  kind: "ui-aggregate"
  defaultArgs: StorybookStoryArgs
  controls: readonly StorybookStoryControl[]
  entries: readonly UiAggregateStoryEntry[]
  render: StorybookStoryModule["render"]
  source: StorybookStoryModule["source"]
}>

export function createUiAggregateStory(input: Readonly<{
  title: string
  entries: readonly UiAggregateStoryEntry[]
}>): UiAggregateStoryModule {
  const entries = Object.freeze([...input.entries])
  return Object.freeze({
    kind: "ui-aggregate",
    defaultArgs: Object.freeze({}),
    controls: Object.freeze([]),
    entries,
    render() {},
    source() {
      return Object.freeze({
        html: aggregateSource(entries, "html", (label, route) => `<!-- ${label} · /${route} -->`),
        css: aggregateSource(entries, "css", (label, route) => `/* ${label} · /${route} */`),
        typescript: aggregateSource(entries, "typescript", (label, route) => `// ${label} · /${route}`),
      })
    },
  })
}

function aggregateSource(
  entries: readonly UiAggregateStoryEntry[],
  kind: keyof StorybookStorySource,
  heading: (label: string, route: string) => string,
): string {
  return entries.flatMap(({label, route, module}) => [
    heading(label, route),
    module.source(module.defaultArgs)[kind],
    "",
  ]).join("\n").trimEnd()
}

export function isUiAggregateStoryModule(
  module: StorybookStoryModule | UiAggregateStoryModule,
): module is UiAggregateStoryModule {
  return "kind" in module && module.kind === "ui-aggregate"
}
