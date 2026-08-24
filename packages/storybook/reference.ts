export type StorybookReferenceCompatibility = "compatible" | "changed" | "unverified"
export type StorybookReferenceAcceptance = "candidate" | "accepted" | "superseded"
export type StorybookComparisonOrientation = "horizontal" | "vertical"

export type StorybookReferenceAsset = Readonly<{
  url: string
  width: number
  height: number
  alt: string
}>

export type StorybookReferenceDescriptor = Readonly<{
  id: string
  label: string
  provenance: string
  compatibility: StorybookReferenceCompatibility
  acceptance: StorybookReferenceAcceptance
  load(): Promise<StorybookReferenceAsset>
}>

export type StorybookReferenceLoader = () => Promise<StorybookReferenceDescriptor>

export type StorybookComparisonRect = Readonly<{
  x: number
  y: number
  w: number
  h: number
}>

export type StorybookComparisonPlan = Readonly<{
  orientation: StorybookComparisonOrientation
  scale: number
  subject: StorybookComparisonRect
  reference: StorybookComparisonRect
}>

export function defineStorybookReference(input: Readonly<{
  id: string
  label: string
  provenance: string
  compatibility: StorybookReferenceCompatibility
  acceptance: StorybookReferenceAcceptance
  load(): Promise<StorybookReferenceAsset>
}>): StorybookReferenceDescriptor {
  validateReferenceText("id", input.id)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.id)) throw new Error(`Invalid Storybook reference id: ${input.id}`)
  validateReferenceText("label", input.label)
  validateReferenceText("provenance", input.provenance)
  let pending: Promise<StorybookReferenceAsset> | null = null

  return Object.freeze({
    id: input.id,
    label: input.label,
    provenance: input.provenance,
    compatibility: input.compatibility,
    acceptance: input.acceptance,
    load() {
      if (pending !== null) return pending
      pending = input.load()
        .then(validateReferenceAsset)
        .catch((error) => {
          pending = null
          throw error
        })
      return pending
    },
  })
}

/** Chooses the split with the largest equal scale for the subject and reference. */
export function planStorybookComparison(input: Readonly<{
  width: number
  height: number
  subject: Readonly<{width: number; height: number}>
  reference: Readonly<{width: number; height: number}>
  gap?: number
  prefer?: StorybookComparisonOrientation
}>): StorybookComparisonPlan {
  const width = positive("comparison width", input.width)
  const height = positive("comparison height", input.height)
  const subjectWidth = positive("subject width", input.subject.width)
  const subjectHeight = positive("subject height", input.subject.height)
  const referenceWidth = positive("reference width", input.reference.width)
  const referenceHeight = positive("reference height", input.reference.height)
  const gap = input.gap ?? 8
  if (!Number.isFinite(gap) || gap < 0 || gap >= Math.max(width, height)) {
    throw new Error(`Storybook comparison gap must fit the viewport: ${gap}`)
  }

  const horizontalScale = Math.min(
    Math.max(0, width - gap) / (subjectWidth + referenceWidth),
    height / Math.max(subjectHeight, referenceHeight),
  )
  const verticalScale = Math.min(
    width / Math.max(subjectWidth, referenceWidth),
    Math.max(0, height - gap) / (subjectHeight + referenceHeight),
  )
  const orientation = horizontalScale === verticalScale
    ? input.prefer ?? "horizontal"
    : horizontalScale > verticalScale ? "horizontal" : "vertical"
  const scale = orientation === "horizontal" ? horizontalScale : verticalScale

  if (orientation === "horizontal") {
    const subject = rect(subjectWidth * scale, subjectHeight * scale)
    const reference = rect(referenceWidth * scale, referenceHeight * scale)
    const totalWidth = subject.w + gap + reference.w
    const startX = (width - totalWidth) / 2
    return Object.freeze({
      orientation,
      scale,
      subject: Object.freeze({...subject, x: startX, y: (height - subject.h) / 2}),
      reference: Object.freeze({...reference, x: startX + subject.w + gap, y: (height - reference.h) / 2}),
    })
  }

  const subject = rect(subjectWidth * scale, subjectHeight * scale)
  const reference = rect(referenceWidth * scale, referenceHeight * scale)
  const totalHeight = subject.h + gap + reference.h
  const startY = (height - totalHeight) / 2
  return Object.freeze({
    orientation,
    scale,
    subject: Object.freeze({...subject, x: (width - subject.w) / 2, y: startY}),
    reference: Object.freeze({...reference, x: (width - reference.w) / 2, y: startY + subject.h + gap}),
  })
}

function validateReferenceAsset(asset: StorybookReferenceAsset): StorybookReferenceAsset {
  if (!asset.url.startsWith("/") && !/^https?:\/\//.test(asset.url)) {
    throw new Error(`Storybook reference URL must be absolute: ${asset.url}`)
  }
  validateReferenceText("alt", asset.alt)
  return Object.freeze({
    url: asset.url,
    width: positive("reference asset width", asset.width),
    height: positive("reference asset height", asset.height),
    alt: asset.alt,
  })
}

function validateReferenceText(kind: string, value: string): void {
  if (value.trim().length === 0) throw new Error(`Storybook reference ${kind} must not be empty`)
}

function positive(kind: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Storybook ${kind} must be positive: ${value}`)
  return value
}

function rect(w: number, h: number): StorybookComparisonRect {
  return Object.freeze({x: 0, y: 0, w, h})
}
