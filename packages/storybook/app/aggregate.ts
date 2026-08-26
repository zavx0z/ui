import type {
  StorybookStoryArgs,
  StorybookStoryControl,
  StorybookStoryModule,
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
      return entries.flatMap(({label, route, module}) => [
        `// ${label} · /${route}`,
        module.source(module.defaultArgs),
        "",
      ]).join("\n").trimEnd()
    },
  })
}

export function isUiAggregateStoryModule(
  module: StorybookStoryModule | UiAggregateStoryModule,
): module is UiAggregateStoryModule {
  return "kind" in module && module.kind === "ui-aggregate"
}
