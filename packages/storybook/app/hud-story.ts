import {Pane} from "@ui/components/pane"
import {Typography} from "@ui/components/typography"
import {defineStorybookStoryModule, type StorybookStoryModule} from "@zavx0z/storybook/stories"

export function createHudInventoryStory(input: Readonly<{
  title: string
  summary: string
}>): StorybookStoryModule {
  return defineStorybookStoryModule({
    defaultArgs: {},
    controls: [],
    render(surface, _args, frame) {
      const width = Math.min(frame.w, 720)
      const height = Math.min(frame.h, 180)
      Pane(surface, frame.x, frame.y, width, height, {variant: "outlined"})
      Typography(surface, frame.x + 14, frame.y + 12, width - 28, 26, {
        children: input.title,
        variant: "title",
      })
      Typography(surface, frame.x + 14, frame.y + 48, width - 28, 44, {
        children: input.summary,
        variant: "body",
      })
      Typography(surface, frame.x + 14, frame.y + 108, width - 28, 38, {
        children: "Визуальная витрина ещё не принята; этот раздел честно показывает состав пакета.",
        variant: "caption",
        color: "muted",
      })
    },
    source() {
      const typescript = [
        `export const owner = ${JSON.stringify(input.title)}`,
        `export const summary = ${JSON.stringify(input.summary)}`,
      ].join("\n")
      const html = [
        '<section class="hud-inventory">',
        `  <h1>${escapeHtml(input.title)}</h1>`,
        `  <p>${escapeHtml(input.summary)}</p>`,
        '  <output role="status">Визуальная витрина ещё не принята</output>',
        "</section>",
      ].join("\n")
      const css = [
        ".hud-inventory {",
        "  /* Задано в @ui/storybook/app/hud-story */",
        "  background: var(--ui-glass);",
        "  border: 1px solid var(--ui-border-dim);",
        "  border-radius: 4px;",
        "  color: var(--ui-text);",
        "  padding: 20px;",
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
