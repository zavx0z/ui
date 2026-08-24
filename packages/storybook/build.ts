import {basename, dirname, join, resolve} from "node:path"
import {copyFile, cp, mkdir, rm, writeFile} from "node:fs/promises"
import {normalizeStorybookBasePath} from "./environment.ts"
import {engineFontPath} from "./engine-assets.ts"
import {
  createUiStorybookPages,
  uiStorybookPageFiles,
  type UiStorybookPageId,
} from "./app/server/page-registry.ts"

const outputRoot = resolve(import.meta.dir, "../../dist")
const publicBasePath = normalizeStorybookBasePath(Bun.env.UI_STORYBOOK_BASE_PATH ?? "/ui")
const engineFont = engineFontPath()

await rm(outputRoot, {recursive: true, force: true})
await mkdir(outputRoot, {recursive: true})

const pages = createUiStorybookPages({publicBasePath})
for (const page of pages) {
  const files = uiStorybookPageFiles(page.id as UiStorybookPageId)
  const assetDirectory = join(outputRoot, "@storybook-assets", page.id)
  await mkdir(assetDirectory, {recursive: true})
  await buildPage(files.entrypoint, assetDirectory)
  await copyFile(files.stylePath, join(assetDirectory, "style.css"))

  const html = await page.htmlResponse().then((response) => response.text())
  const htmlPath = page.mountPath === "/"
    ? join(outputRoot, "index.html")
    : join(outputRoot, page.mountPath.slice(1), "index.html")
  await mkdir(dirname(htmlPath), {recursive: true})
  await writeFile(htmlPath, html)
}

await mkdir(join(outputRoot, "fonts"), {recursive: true})
await copyFile(engineFont, join(outputRoot, "fonts/jetbrains-mono-bold.ttf"))
await cp(join(import.meta.dir, "assets/references"), join(outputRoot, "references"), {recursive: true})
await writeFile(join(outputRoot, ".nojekyll"), "")
await writeFile(join(outputRoot, "404.html"), notFoundRedirect(publicBasePath))
await writeFile(join(outputRoot, "storybook-manifest.json"), `${JSON.stringify({
  basePath: publicBasePath,
  pages: pages.map((page) => ({
    id: page.id,
    mountPath: page.mountPath,
    routes: page.routeTree?.nodes.map((node) => node.path) ?? [],
  })),
}, null, 2)}\n`)

console.log(`[UI Storybook] built ${pages.length} static pages in ${outputRoot} for ${publicBasePath}/`)

async function buildPage(entrypoint: string, outputDirectory: string): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entrypoint],
    loader: {".wgsl": "text"},
    target: "browser",
    format: "esm",
    splitting: true,
    sourcemap: "none",
    minify: true,
  })
  if (!result.success) throw new Error(result.logs.map((log) => String(log)).join("\n"))

  const names = new Set<string>()
  for (const output of result.outputs) {
    const name = output.kind === "entry-point" ? "entry.js" : basename(output.path)
    if (names.has(name)) throw new Error(`Static Storybook emitted duplicate asset: ${name}`)
    names.add(name)
    await Bun.write(join(outputDirectory, name), output)
  }
  if (!names.has("entry.js")) throw new Error(`Static Storybook entry was not emitted: ${entrypoint}`)
}

function notFoundRedirect(basePath: string): string {
  const encodedBase = JSON.stringify(basePath)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>UI Storybook</title>
    <script>
      (() => {
        const base = ${encodedBase}
        const pathname = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : "/"
        const mount = pathname.split("/").filter(Boolean)[0] ?? ""
        const known = new Set(["elements", "components", "storybook", "hud"])
        const target = known.has(mount) ? base + "/" + mount + "/" : base + "/"
        sessionStorage.setItem("ui-storybook-restore", location.pathname + location.search + location.hash)
        location.replace(target)
      })()
    </script>
  </head>
  <body></body>
</html>`
}
