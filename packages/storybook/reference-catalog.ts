export type StorybookReferenceCatalogEntry = Readonly<{
  id: string
  storyRoute: string
  asset: string
  sha256: string
  source: Readonly<{
    product: string
    version: string
    revision: string
  }>
  viewport: Readonly<{
    width: number
    height: number
    dpr: number
  }>
  compatibility: "compatible" | "changed" | "unverified"
  acceptance: "candidate" | "accepted" | "superseded"
}>

export type StorybookReferenceCatalog = Readonly<{
  schemaVersion: 1
  references: readonly StorybookReferenceCatalogEntry[]
}>

/** Loads reference metadata as a separate browser chunk only when comparison is requested. */
export async function loadStorybookReferenceCatalog(): Promise<StorybookReferenceCatalog> {
  const module = await import("./assets/references/catalog.json", {with: {type: "json"}})
  return validateCatalog(module.default)
}

function validateCatalog(value: unknown): StorybookReferenceCatalog {
  if (value === null || typeof value !== "object") throw new Error("Storybook reference catalog must be an object")
  const catalog = value as {schemaVersion?: unknown; references?: unknown}
  if (catalog.schemaVersion !== 1) throw new Error("Unsupported Storybook reference catalog schema")
  if (!Array.isArray(catalog.references)) throw new Error("Storybook reference catalog entries must be an array")
  return Object.freeze({
    schemaVersion: 1,
    references: Object.freeze(catalog.references as StorybookReferenceCatalogEntry[]),
  })
}
