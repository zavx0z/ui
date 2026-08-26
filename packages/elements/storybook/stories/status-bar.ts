import {
  statusBar,
  statusBarMetrics,
  type StatusBarItem,
} from "@ui/elements/status-bar"
import {
  defineStorybookStoryModule,
  type StorybookStoryArgs,
  type StorybookStoryModule,
} from "@zavx0z/storybook/stories"

type StatusBarStoryArgs = StorybookStoryArgs & Readonly<{
  "highlight-version": boolean
}>

export function createStatusBarStory(): StorybookStoryModule {
  return defineStorybookStoryModule<StatusBarStoryArgs>({
    defaultArgs: {
      "highlight-version": false,
    },
    controls: [
      {key: "highlight-version", label: "Выделить версию", group: "Содержимое", kind: "boolean"},
    ],
    render(surface, args, frame) {
      const width = Math.max(1, frame.w - 24)
      statusBar(surface, frame.x + 12, frame.y + (frame.h - statusBarMetrics.height) / 2, width, statusBarMetrics.height, {
        end: referenceItems(args["highlight-version"]),
      })
    },
    source(args) {
      return [
        'import {statusBar} from "@ui/elements/status-bar"',
        "",
        "const items = [",
        '  {id: "collection", text: "Collection"},',
        '  {id: "object", text: "Cube"},',
        '  {id: "vertices", text: "Verts:8"},',
        '  {id: "faces", text: "Faces:6"},',
        '  {id: "triangles", text: "Tris:12"},',
        '  {id: "objects", text: "Objects:1/3"},',
        `  {id: "version", text: "4.5.5", highlighted: ${args["highlight-version"]}},`,
        "] as const",
        "",
        "statusBar(surface, x, y, width, 24, {end: items})",
      ].join("\n")
    },
  })
}

function referenceItems(highlightVersion: boolean): readonly StatusBarItem[] {
  return Object.freeze([
    {id: "collection", text: "Collection"},
    {id: "object", text: "Cube"},
    {id: "vertices", text: "Verts:8"},
    {id: "faces", text: "Faces:6"},
    {id: "triangles", text: "Tris:12"},
    {id: "objects", text: "Objects:1/3"},
    {id: "version", text: "4.5.5", highlighted: highlightVersion},
  ])
}
