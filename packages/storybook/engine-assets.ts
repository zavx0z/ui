import {fileURLToPath} from "node:url"

export function engineFontPath(): string {
  return fileURLToPath(import.meta.resolve("@engine/core/fonts/jetbrains-mono-bold.ttf"))
}
