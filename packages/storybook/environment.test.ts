import {describe, expect, test} from "bun:test"
import {normalizeStorybookBasePath, storybookBasePath, storybookPublicPath} from "./environment.ts"

function documentWithBase(value: string): Document {
  return {
    querySelector(selector: string) {
      return selector === 'meta[name="ui-storybook-base"]' ? {content: value} : null
    },
  } as unknown as Document
}

describe("Storybook public environment", () => {
  test("keeps local development at the origin root", () => {
    const documentRef = documentWithBase("")
    expect(storybookBasePath(documentRef)).toBe("")
    expect(storybookPublicPath("/elements/", documentRef)).toBe("/elements/")
  })

  test("mounts every public route below the Pages repository base", () => {
    const documentRef = documentWithBase("/ui")
    expect(storybookBasePath(documentRef)).toBe("/ui")
    expect(storybookPublicPath("/", documentRef)).toBe("/ui/")
    expect(storybookPublicPath("/components/", documentRef)).toBe("/ui/components/")
    expect(storybookPublicPath("/fonts/jetbrains-mono-bold.ttf", documentRef)).toBe("/ui/fonts/jetbrains-mono-bold.ttf")
  })

  test("rejects ambiguous mounts and paths", () => {
    for (const value of ["ui", "/ui/", "/ui//docs", "/ui?mode=test"]) {
      expect(() => normalizeStorybookBasePath(value)).toThrow()
    }
    expect(() => storybookPublicPath("components", documentWithBase("/ui"))).toThrow()
  })
})
