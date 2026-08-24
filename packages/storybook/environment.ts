const BASE_META_NAME = "ui-storybook-base"

/** Returns the normalized public mount injected by the dev or static shell. */
export function storybookBasePath(documentRef: Document = document): string {
  const value = documentRef.querySelector<HTMLMetaElement>(`meta[name="${BASE_META_NAME}"]`)?.content ?? ""
  return normalizeStorybookBasePath(value)
}

/** Resolves one absolute Storybook-local path below the injected public mount. */
export function storybookPublicPath(pathname: string, documentRef: Document = document): string {
  if (!pathname.startsWith("/") || pathname.includes("//") || /[?#]/.test(pathname)) {
    throw new Error(`Storybook public path must be normalized and absolute: ${pathname}`)
  }
  const basePath = storybookBasePath(documentRef)
  return pathname === "/" ? `${basePath}/` || "/" : `${basePath}${pathname}`
}

export function normalizeStorybookBasePath(value: string): string {
  if (value === "" || value === "/") return ""
  if (!value.startsWith("/") || value.endsWith("/") || value.includes("//") || /[?#]/.test(value)) {
    throw new Error(`Storybook base path must be a normalized absolute mount: ${value}`)
  }
  return value
}
