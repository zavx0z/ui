import {flexColumn, flexRow} from "@layout/core/flex"
import {Pane} from "@ui/components/pane"
import {Typography} from "@ui/components/typography"
import {defineStorybookStoryModule, type StorybookStoryModule} from "@zavx0z/storybook/stories"

export type UiOverviewItem = Readonly<{
  label: string
  route: string
}>

export function createUiOverviewStory(input: Readonly<{
  title: string
  summary: string
  items: readonly UiOverviewItem[]
}>): StorybookStoryModule {
  return defineStorybookStoryModule({
    defaultArgs: {},
    controls: [],
    render(surface, _args, frame) {
      const columns = frame.w < 620 ? 1 : frame.w < 1080 ? 2 : 3
      const rows = chunk(input.items, columns)
      const summaryH = 34
      Typography(surface, frame.x, frame.y, frame.w, 24, {
        children: input.summary,
        variant: "caption",
        color: "muted",
      })
      flexColumn({
        x: frame.x,
        y: frame.y + summaryH,
        w: frame.w,
        h: Math.max(0, frame.h - summaryH),
        gap: 10,
        items: rows.map((row) => ({
          height: "1fr" as const,
          draw: (rowX: number, rowY: number, rowW: number, rowH: number) => flexRow({
            x: rowX,
            y: rowY,
            w: rowW,
            h: rowH,
            gap: 10,
            items: Array.from({length: columns}, (_, column) => {
              const item = row[column]
              if (item === undefined) return {width: "1fr" as const, height: rowH, draw: () => {}}
              return {
                width: "1fr" as const,
                height: rowH,
                draw: (x: number, y: number, w: number, h: number) => {
                  Pane(surface, x, y, w, h, {variant: "outlined"})
                  Typography(surface, x + 12, y + 10, w - 24, 22, {
                    children: item.label,
                    variant: "title",
                  })
                  Typography(surface, x + 12, y + 38, w - 24, 18, {
                    children: `/${item.route}/`,
                    variant: "caption",
                    color: "muted",
                  })
                },
              }
            }),
          }),
        })),
      })
    },
    source() {
      const typescript = [
        `export const title = ${JSON.stringify(input.title)}`,
        "",
        "export const sections = [",
        ...input.items.map(({label, route}) => `  {label: ${JSON.stringify(label)}, route: ${JSON.stringify(route)}},`),
        "] as const",
      ].join("\n")
      const html = [
        `<nav class="overview" aria-label=${JSON.stringify(input.title)}>`,
        `  <h1>${escapeHtml(input.title)}</h1>`,
        `  <p>${escapeHtml(input.summary)}</p>`,
        "  <ul>",
        ...input.items.map(({label, route}) => `    <li><a href="/${escapeHtml(route)}/">${escapeHtml(label)}</a></li>`),
        "  </ul>",
        "</nav>",
      ].join("\n")
      const css = [
        ".overview {",
        "  /* Задано в @ui/storybook/app/overview */",
        "  display: flex;",
        "  flex-wrap: wrap;",
        "  gap: 10px;",
        "  padding: 0;",
        "  & a {",
        "    color: var(--ui-text);",
        "    text-decoration: none;",
        "  }",
        "  & a:hover {",
        "    color: var(--ui-cyan);",
        "  }",
        "}",
      ].join("\n")
      return Object.freeze({html, css, typescript})
    },
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function chunk<T>(values: readonly T[], size: number): readonly (readonly T[])[] {
  const rows: T[][] = []
  for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size))
  return rows
}
