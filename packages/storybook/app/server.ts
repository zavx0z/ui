import {join} from "node:path"
import {engineFontPath} from "../engine-assets.ts"
import {startStorybookHubServer} from "@zavx0z/storybook/server"
import {createUiStorybookApp} from "./server/page-registry.ts"

const server = startStorybookHubServer({
  app: createUiStorybookApp(),
  hostname: Bun.env.UI_STORYBOOK_HOST ?? "127.0.0.1",
  port: Number(Bun.env.UI_STORYBOOK_PORT ?? 4017),
  staticFiles: [{
    publicPath: "/fonts/jetbrains-mono-bold.ttf",
    sourcePath: engineFontPath(),
  }],
})

console.log(`[UI storybook catalog] ${server.url}`)
