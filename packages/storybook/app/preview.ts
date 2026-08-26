import {type Object3D} from "@engine/core"
import {UiSurface} from "@layout/core/surface"
import {clearReadOnlyTextParticipants} from "@ui/elements/input"
import {drawStorybookPreviewChrome} from "@zavx0z/storybook/workbench"
import type {StorybookStoryArgs} from "@zavx0z/storybook/stories"
import {isUiAggregateStoryModule} from "./aggregate.ts"
import type {
  UiStoryDescriptor,
  UiStoryModule,
} from "./stories.ts"

export class UiStoryPreviewSurface extends UiSurface {
  readonly #previewParent: Object3D
  #descriptor: UiStoryDescriptor | null = null
  #module: UiStoryModule | null = null
  #args: StorybookStoryArgs = Object.freeze({})
  #signature = ""

  constructor() {
    super({bgColor: null, borderColor: null})
    this.node.name = "UiStoryPreviewSurface"
    this.#previewParent = this.createRetainedParent()
    this.#previewParent.name = "UiStoryPreviewSurface.preview"
  }

  setStory(
    descriptor: UiStoryDescriptor,
    module: UiStoryModule,
    args: StorybookStoryArgs,
  ): void {
    if (this.#descriptor?.route !== descriptor.route) clearReadOnlyTextParticipants(this)
    this.#descriptor = descriptor
    this.#module = module
    this.#args = args
    this.#signature = ""
    this.requestRender()
  }

  setArgs(args: StorybookStoryArgs): void {
    this.#args = args
    this.requestRender()
  }

  protected override render(): void {
    const descriptor = this.#descriptor
    const module = this.#module
    if (descriptor === null || module === null) return
    const signature = `${descriptor.route}:${JSON.stringify(this.#args)}:${this.rectW}:${this.rectH}:${this.pixelScale}`
    if (signature === this.#signature) return
    this.materializeRetainedParent(this.#previewParent, () => {
      drawStorybookPreviewChrome(this, this.rectW, this.rectH, {
        title: descriptor.title,
        description: `${descriptor.component.label} · ${descriptor.apiName}`,
      })
      if (!isUiAggregateStoryModule(module)) {
        module.render(this, this.#args, {x: 0, y: 0, w: this.rectW, h: this.rectH})
      }
    })
    this.#signature = signature
  }
}
