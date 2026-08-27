import {button} from "@ui/elements/button"
import {div} from "@ui/elements/div"
import {popover} from "@ui/elements/popover"
import {span} from "@ui/elements/span"
import {uiShapeMetrics} from "../../shape.ts"
import {
  defineStorybookStoryModule,
  type StorybookStoryArgs,
  type StorybookStoryModule,
} from "@zavx0z/storybook/stories"
import {elementStorySource} from "../style-source.ts"

type PopoverStoryArgs = StorybookStoryArgs & Readonly<{
  open: boolean
  event: string
}>

declare global {
  var __elementsStoryControlBridge: ((key: string, value: unknown) => void) | undefined
}

export function createPopoverStory(variant: "closed" | "open"): StorybookStoryModule {
  return defineStorybookStoryModule<PopoverStoryArgs>({
    defaultArgs: {open: variant === "open", event: "Ожидание"},
    controls: [
      {key: "open", label: "Открыт", group: "Состояние", kind: "boolean"},
      {key: "event", label: "Последнее событие", group: "События", kind: "custom", interactive: false},
    ],
    render(surface, args, frame) {
      const width = 146
      const x = frame.x + (frame.w - width) / 2
      const y = frame.y + frame.h * 0.42
      popover(surface, x, y, width, uiShapeMetrics.controlHeight, {
        key: "elements-story-popover",
        open: args.open,
        contentSize: {width: 180, height: 72},
        onOpenChange(open) {
          globalThis.__elementsStoryControlBridge?.("open", open)
          globalThis.__elementsStoryControlBridge?.("event", `onOpenChange: ${open}`)
        },
        trigger(context) {
          button(surface, x, y, width, uiShapeMetrics.controlHeight, {
            key: "elements-story-popover-trigger",
            children: context.open ? "Закрыть" : "Открыть",
            onClick: context.toggle,
          })
        },
        content(rect) {
          div(surface, rect.x, rect.y, rect.w, rect.h, {
            style: {background: "bgPanel", borderColor: "borderRule", borderRadius: 4},
          })
          span(surface, rect.x + 10, rect.y + 24, rect.w - 20, 24, {
            children: `Popover · ${rect.side}`,
            style: {color: "text", textAlign: "center"},
          })
        },
      })
    },
    source(args) {
      const typescript = [
        'import {button} from "@ui/elements/button"',
        'import {div} from "@ui/elements/div"',
        'import {popover} from "@ui/elements/popover"',
        "",
        `let open = ${args.open}`,
        "popover(surface, x, y, width, height, {",
        '  key: "details",',
        "  open,",
        "  contentSize: {width: 180, height: 72},",
        "  onOpenChange: setOpen,",
        "  trigger: ({toggle}) => button(surface, x, y, width, height, {children: \"Открыть\", onClick: toggle, style: style[\"& .trigger\"]}),",
        "  content: (rect) => div(surface, rect.x, rect.y, rect.w, rect.h, {style: style[\"& .content\"]}),",
        "})",
      ].join("\n")
      return elementStorySource({component: "popover", section: "state", variant}, args, typescript)
    },
  })
}
