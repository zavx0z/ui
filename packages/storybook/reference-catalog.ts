import {
  defineStorybookReference,
  planStorybookComparison,
  type StorybookComparisonPlan,
  type StorybookReferenceAcceptance,
  type StorybookReferenceCompatibility,
  type StorybookReferenceDescriptor,
} from "@zavx0z/storybook/references"

export type StorybookReferenceCrop = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>

export type StorybookReferenceOwnerDecision = Readonly<{
  decidedAt: string
  note: string
}>

export type StorybookReferenceSource = Readonly<{
  product: string
  version: string
  revision: string
}>

export type StorybookReferenceCatalogEntry = StorybookReferenceDescriptor & Readonly<{
  storyRoute: string
  source: StorybookReferenceSource
  crop?: StorybookReferenceCrop
  theme: string
  locale: string
  storyState: string
  ownerDecision?: StorybookReferenceOwnerDecision
}>

export type StorybookReferenceCatalog = Readonly<{
  schemaVersion: 1
  references: readonly StorybookReferenceCatalogEntry[]
}>

/** Loads metadata as a separate browser chunk only when comparison is requested. */
export async function loadStorybookReferenceCatalog(): Promise<StorybookReferenceCatalog> {
  const module = await import("./assets/references/catalog.json", {with: {type: "json"}})
  return validateStorybookReferenceCatalog(module.default)
}

/**
 * Validates owner evidence without changing compatibility or acceptance state.
 *
 * An accepted raster must carry a separate explicit owner decision. Candidate
 * captures therefore cannot become accepted as a side effect of loading them.
 */
export function validateStorybookReferenceCatalog(value: unknown): StorybookReferenceCatalog {
  const catalog = record("Storybook reference catalog", value)
  if (catalog.schemaVersion !== 1) throw new Error("Unsupported Storybook reference catalog schema")
  if (!Array.isArray(catalog.references)) {
    throw new Error("Storybook reference catalog entries must be an array")
  }

  const ids = new Set<string>()
  const routes = new Set<string>()
  const references = catalog.references.map((candidate, index) => {
    const entry = validateEntry(candidate, index)
    if (ids.has(entry.id)) throw new Error(`Duplicate Storybook reference id: ${entry.id}`)
    if (routes.has(entry.storyRoute)) {
      throw new Error(`Duplicate Storybook reference route: ${entry.storyRoute}`)
    }
    ids.add(entry.id)
    routes.add(entry.storyRoute)
    return entry
  })

  return Object.freeze({schemaVersion: 1, references: Object.freeze(references)})
}

/** Chooses the split with the largest common subject/reference scale. */
export function planUiStorybookComparison(input: Parameters<typeof planStorybookComparison>[0]): StorybookComparisonPlan {
  return planStorybookComparison(input)
}

function validateEntry(value: unknown, index: number): StorybookReferenceCatalogEntry {
  const entry = record(`Storybook reference ${index}`, value)
  const source = record(`Storybook reference ${index} source`, entry.source)
  const viewport = record(`Storybook reference ${index} viewport`, entry.viewport)
  const asset = record(`Storybook reference ${index} asset`, entry.asset)
  const compatibility = exactCompatibility(entry.compatibility)
  const acceptance = exactAcceptance(entry.acceptance)
  const ownerDecision = optionalOwnerDecision(entry.ownerDecision, acceptance)
  const normalizedSource = Object.freeze({
    product: requiredText("source product", source.product),
    version: requiredText("source version", source.version),
    revision: requiredText("source revision", source.revision),
  })
  const reference = defineStorybookReference({
    id: requiredText("reference id", entry.id),
    label: requiredText("reference label", entry.label),
    provenance: [normalizedSource.product, normalizedSource.version, normalizedSource.revision].join(" · "),
    compatibility,
    acceptance,
    viewport: {
      width: finiteNumber("viewport width", viewport.width),
      height: finiteNumber("viewport height", viewport.height),
      devicePixelRatio: finiteNumber("viewport DPR", viewport.devicePixelRatio),
    },
    asset: {
      url: requiredText("asset URL", asset.url),
      width: finiteNumber("asset width", asset.width),
      height: finiteNumber("asset height", asset.height),
      alt: requiredText("asset alt", asset.alt),
      sha256: requiredText("asset SHA-256", asset.sha256),
    },
  })
  const crop = optionalCrop(entry.crop)

  return Object.freeze({
    ...reference,
    storyRoute: storyRoute(entry.storyRoute),
    source: normalizedSource,
    ...(crop === undefined ? {} : {crop}),
    theme: requiredText("reference theme", entry.theme),
    locale: requiredText("reference locale", entry.locale),
    storyState: requiredText("reference story state", entry.storyState),
    ...(ownerDecision === undefined ? {} : {ownerDecision}),
  })
}

function optionalOwnerDecision(
  value: unknown,
  acceptance: StorybookReferenceAcceptance,
): StorybookReferenceOwnerDecision | undefined {
  if (value === undefined) {
    if (acceptance === "accepted") {
      throw new Error("Accepted Storybook reference requires an explicit owner decision")
    }
    return undefined
  }
  const decision = record("Storybook reference owner decision", value)
  const result = Object.freeze({
    decidedAt: requiredText("owner decision date", decision.decidedAt),
    note: requiredText("owner decision note", decision.note),
  })
  if (acceptance !== "accepted") {
    throw new Error("Only an accepted Storybook reference may carry an owner decision")
  }
  return result
}

function optionalCrop(value: unknown): StorybookReferenceCrop | undefined {
  if (value === undefined) return undefined
  const crop = record("Storybook reference crop", value)
  const result = Object.freeze({
    x: finiteNumber("crop x", crop.x),
    y: finiteNumber("crop y", crop.y),
    width: finiteNumber("crop width", crop.width),
    height: finiteNumber("crop height", crop.height),
  })
  if (result.x < 0 || result.y < 0 || result.width <= 0 || result.height <= 0) {
    throw new Error("Storybook reference crop must be positive and in image coordinates")
  }
  return result
}

function exactCompatibility(value: unknown): StorybookReferenceCompatibility {
  if (value === "compatible" || value === "changed" || value === "unverified") return value
  throw new Error(`Invalid Storybook reference compatibility: ${String(value)}`)
}

function exactAcceptance(value: unknown): StorybookReferenceAcceptance {
  if (value === "candidate" || value === "accepted" || value === "superseded") return value
  throw new Error(`Invalid Storybook reference acceptance: ${String(value)}`)
}

function storyRoute(value: unknown): string {
  const route = requiredText("reference story route", value)
  if (route.startsWith("/") || route.endsWith("/")) {
    throw new Error(`Storybook reference route must be an exact leaf: ${route}`)
  }
  return route
}

function requiredText(label: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Storybook ${label} must not be empty`)
  }
  return value
}

function finiteNumber(label: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Storybook ${label} must be finite`)
  }
  return value
}

function record(label: string, value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}
