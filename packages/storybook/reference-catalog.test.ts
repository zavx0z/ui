import {describe, expect, test} from "bun:test"
import {
  loadStorybookReferenceCatalog,
  planUiStorybookComparison,
  validateStorybookReferenceCatalog,
} from "./reference-catalog.ts"

const sha256 = "a".repeat(64)
const candidate = Object.freeze({
  id: "number-input-default",
  label: "NumberInput default",
  storyRoute: "components/inputs/number-input/basic/default",
  source: {
    product: "Blender",
    version: "5.2.0 LTS",
    revision: "fbe6228777e7d9afefcd61a413844e790ae75db7",
  },
  viewport: {width: 1440, height: 900, devicePixelRatio: 1},
  asset: {
    url: "/ui/references/number-input-default.png",
    width: 320,
    height: 96,
    alt: "Number input visual reference",
    sha256,
  },
  crop: {x: 20, y: 24, width: 320, height: 96},
  theme: "Blender Dark",
  locale: "en_US",
  storyState: "default",
  compatibility: "unverified",
  acceptance: "candidate",
})

describe("UI Storybook visual reference catalog", () => {
  test("loads the empty metadata index lazily", async () => {
    const catalog = await loadStorybookReferenceCatalog()
    expect(catalog).toEqual({schemaVersion: 1, references: []})
    expect(Object.isFrozen(catalog)).toBeTrue()
    expect(Object.isFrozen(catalog.references)).toBeTrue()
  })

  test("validates and freezes candidate evidence without accepting it", () => {
    const catalog = validateStorybookReferenceCatalog({
      schemaVersion: 1,
      references: [candidate],
    })
    const reference = catalog.references[0]!

    expect(reference.acceptance).toBe("candidate")
    expect(reference.compatibility).toBe("unverified")
    expect(reference.source).toEqual(candidate.source)
    expect("ownerDecision" in reference).toBeFalse()
    expect(Object.isFrozen(reference)).toBeTrue()
    expect(Object.isFrozen(reference.asset)).toBeTrue()
    expect(Object.isFrozen(reference.source)).toBeTrue()
    expect(Object.isFrozen(reference.crop)).toBeTrue()
  })

  test("requires a separate explicit decision for accepted evidence", () => {
    expect(() => validateStorybookReferenceCatalog({
      schemaVersion: 1,
      references: [{...candidate, acceptance: "accepted"}],
    })).toThrow("requires an explicit owner decision")

    const catalog = validateStorybookReferenceCatalog({
      schemaVersion: 1,
      references: [{
        ...candidate,
        acceptance: "accepted",
        ownerDecision: {decidedAt: "2026-08-28", note: "Owner accepted exact comparison"},
      }],
    })
    expect(catalog.references[0]?.acceptance).toBe("accepted")
    expect(catalog.references[0]?.ownerDecision?.note).toContain("Owner accepted")
  })

  test("uses one common scale and chooses the larger-fit split", () => {
    const wide = planUiStorybookComparison({
      width: 1200,
      height: 420,
      subject: {width: 420, height: 80},
      reference: {width: 420, height: 80},
      gap: 20,
    })
    expect(wide.orientation).toBe("vertical")
    expect(wide.subject.w / 420).toBeCloseTo(wide.scale)
    expect(wide.reference.w / 420).toBeCloseTo(wide.scale)

    const tall = planUiStorybookComparison({
      width: 500,
      height: 1000,
      subject: {width: 180, height: 480},
      reference: {width: 180, height: 480},
      gap: 20,
    })
    expect(tall.orientation).toBe("horizontal")
    expect(tall.subject.h / 480).toBeCloseTo(tall.reference.h / 480)
  })
})
