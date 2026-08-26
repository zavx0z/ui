import {join} from "node:path"
import {engineFontPath} from "../engine-assets.ts"
import {startStorybookPackageServer} from "@zavx0z/storybook/server"
import {createUiStorybookApp} from "./server/page-registry.ts"

startStorybookPackageServer({
  app: createUiStorybookApp(),
  staticFiles: [{
    publicPath: "/fonts/jetbrains-mono-bold.ttf",
    sourcePath: engineFontPath(),
  }],
})
