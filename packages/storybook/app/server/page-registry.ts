import {join, resolve} from "node:path"
import {defineStorybookApp, type StorybookAppManifest} from "@zavx0z/storybook/app"
import {createTemplateJsxBunPlugin} from "@zavx0z/template/bun"
import {UI_STORY_ROUTE_TREE} from "../dom-story-navigation.ts"

export type UiStorybookAppOptions = Readonly<{
  publicBasePath?: string
}>

/** One root Workbench containing every package-owned UI story. */
export function createUiStorybookApp(options: UiStorybookAppOptions = {}): StorybookAppManifest {
  const packagesRoot = resolve(import.meta.dir, "../../..")
  return defineStorybookApp({
    id: "ui",
    title: "UI storybook",
    basePath: options.publicBasePath ?? "",
    home: {path: "/", label: "Главная", ariaLabel: "На главную UI Storybook"},
    footer: {
      lead: "Создано для",
      owner: {label: "MetaFor", href: "https://github.com/zavx0z/metafor"},
      detail: "переиспользуемая WebGPU-инфраструктура UI",
    },
    head: {meta: [{
      kind: "public-path",
      name: "engine-default-font",
      path: "/fonts/jetbrains-mono-bold.ttf",
    }]},
    pages: [{
      id: "workbench",
      title: "UI storybook",
      mountPath: "/",
      entrypoint: join(import.meta.dir, "../bootstrap.ts"),
      browserBuild: {
        plugins: () => [createTemplateJsxBunPlugin({
          sourceRoots: [
            join(packagesRoot, "components"),
            join(packagesRoot, "storybook")
          ]
        })]
      },
      stylePath: join(import.meta.dir, "../style.css"),
      body: {kind: "canvas", canvasId: "ui-storybook-canvas"},
      capability: "webgpu",
      touch: true,
      readiness: {dataset: "uiStorybook", value: "ready"},
      canvas: {id: "ui-storybook-canvas", evidence: "non-black"},
      routeTree: UI_STORY_ROUTE_TREE,
    }],
  })
}
