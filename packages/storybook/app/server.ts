import {join} from "node:path"
import {engineFontPath} from "../engine-assets.ts"
import {startStorybookHubServer} from "@ui/storybook/server"
import {createUiStorybookPages} from "./server/page-registry.ts"

const server = startStorybookHubServer({
  pages: createUiStorybookPages(),
  hostname: Bun.env.UI_STORYBOOK_HOST ?? "127.0.0.1",
  port: Number(Bun.env.UI_STORYBOOK_PORT ?? 4017),
  staticFiles: {
    "/fonts/jetbrains-mono-bold.ttf": engineFontPath(),
  },
})

console.log(`[UI storybook catalog] ${server.url}`)
