import {
  storybookRouteTreeUrl,
  resolveStorybookRouteTree,
  type StorybookRouteTree,
  type StorybookRouteTreeNode,
  type StorybookRouteTreeOptions,
} from "./route-tree.ts"

export type StorybookRouteDeclaration<Route extends string> = Readonly<{
  location: "pathname"
  routes: readonly Route[]
  fallback: Route
}>

export type StorybookRouteDeclarationInput<Routes extends readonly string[]> = Readonly<{
  routes: Routes
  fallback: Routes[number]
}>

export type StorybookRouteChange<Route extends string> = (route: Route, previous: Route) => void

export type StorybookRouterOptions = Readonly<{
  basePath?: string
}>

export type StorybookRouteTreeChange<Leaf extends string> = (
  node: StorybookRouteTreeNode<Leaf>,
  previous: StorybookRouteTreeNode<Leaf>,
) => void

export type StorybookRouteTreeRouterOptions = StorybookRouteTreeOptions & Readonly<{
  onNotFound?(error: StorybookRouteTreeNotFoundError): void
}>

export class StorybookRouteTreeNotFoundError extends Error {
  constructor(readonly pathname: string) {
    super(`Storybook route tree path is not registered: ${pathname}`)
    this.name = "StorybookRouteTreeNotFoundError"
  }
}

export function defineStorybookRoutes<const Routes extends readonly string[]>(
  input: StorybookRouteDeclarationInput<Routes>,
): StorybookRouteDeclaration<Routes[number]> {
  if (input.routes.length === 0) throw new Error("Storybook routes must not be empty")
  const routes = Object.freeze(input.routes.map((route) => validateRouteId(route)))
  if (new Set(routes).size !== routes.length) throw new Error("Storybook routes must be unique")
  if (!routes.includes(input.fallback)) {
    throw new Error(`Storybook fallback route is not registered: ${input.fallback}`)
  }
  return Object.freeze({location: "pathname" as const, routes, fallback: input.fallback})
}

export function resolveStorybookRoute<Route extends string>(
  declaration: StorybookRouteDeclaration<Route>,
  location: Readonly<{pathname: string}>,
  options: StorybookRouterOptions = {},
): Route {
  const route = routeWithinBasePath(location.pathname, normalizeBasePath(options.basePath))
  if (route === null) return declaration.fallback
  return declaration.routes.includes(route as Route) ? route as Route : declaration.fallback
}

export function storybookRouteUrl(route: string, options: StorybookRouterOptions = {}): string {
  const basePath = normalizeBasePath(options.basePath)
  return `${basePath}/${validateRouteId(route)}`
}

export class StorybookRouter<Route extends string> {
  readonly #declaration: StorybookRouteDeclaration<Route>
  readonly #basePath: string
  readonly #listeners = new Set<StorybookRouteChange<Route>>()
  #route: Route
  readonly #onLocationChange = (): void => this.#set(this.#read())

  constructor(
    declaration: StorybookRouteDeclaration<Route>,
    options: StorybookRouterOptions = {},
  ) {
    if (declaration.location !== "pathname") throw new Error("Storybook routes must use pathname")
    this.#declaration = declaration
    this.#basePath = normalizeBasePath(options.basePath)
    this.#route = this.#read()
    window.addEventListener("popstate", this.#onLocationChange)
  }

  get current(): Route {
    return this.#route
  }

  go(route: Route): void {
    if (!this.#declaration.routes.includes(route)) return
    const url = storybookRouteUrl(route, {basePath: this.#basePath})
    if (window.location.pathname !== url) history.pushState(null, "", url)
    this.#set(route)
  }

  subscribe(listener: StorybookRouteChange<Route>): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  dispose(): void {
    window.removeEventListener("popstate", this.#onLocationChange)
    this.#listeners.clear()
  }

  #read(): Route {
    return resolveStorybookRoute(this.#declaration, window.location, {basePath: this.#basePath})
  }

  #set(route: Route): void {
    if (route === this.#route) return
    const previous = this.#route
    this.#route = route
    for (const listener of this.#listeners) listener(route, previous)
  }
}

/** Browser history owner for overview and leaf nodes of one exact route-tree mount. */
export class StorybookRouteTreeRouter<Leaf extends string> {
  readonly #tree: StorybookRouteTree<Leaf>
  readonly #options: StorybookRouteTreeRouterOptions
  readonly #listeners = new Set<StorybookRouteTreeChange<Leaf>>()
  #node: StorybookRouteTreeNode<Leaf>
  readonly #onLocationChange = (): void => {
    const node = this.#read(false)
    if (node !== null) this.#set(node)
  }

  constructor(
    tree: StorybookRouteTree<Leaf>,
    options: StorybookRouteTreeRouterOptions = {},
  ) {
    this.#tree = tree
    this.#options = Object.freeze({...options})
    const node = this.#read(true)
    if (node === null) throw new StorybookRouteTreeNotFoundError(window.location.pathname)
    this.#node = node
    window.addEventListener("popstate", this.#onLocationChange)
  }

  get current(): StorybookRouteTreeNode<Leaf> {
    return this.#node
  }

  go(path: string): boolean {
    const node = this.#tree.find(path)
    if (node === undefined) return false
    const url = storybookRouteTreeUrl(this.#tree, node.path, this.#options)
    if (window.location.pathname !== url) history.pushState(null, "", url)
    this.#set(node)
    return true
  }

  subscribe(listener: StorybookRouteTreeChange<Leaf>): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  dispose(): void {
    window.removeEventListener("popstate", this.#onLocationChange)
    this.#listeners.clear()
  }

  #read(initial: boolean): StorybookRouteTreeNode<Leaf> | null {
    const resolution = resolveStorybookRouteTree(this.#tree, window.location, this.#options)
    if (resolution.kind === "not-found") {
      const error = new StorybookRouteTreeNotFoundError(window.location.pathname)
      if (initial || this.#options.onNotFound === undefined) throw error
      this.#options.onNotFound(error)
      return null
    }
    if (resolution.redirect) history.replaceState(null, "", resolution.canonicalPath)
    return resolution.node
  }

  #set(node: StorybookRouteTreeNode<Leaf>): void {
    if (node === this.#node) return
    const previous = this.#node
    this.#node = node
    for (const listener of [...this.#listeners]) listener(node, previous)
  }
}

function normalizeBasePath(basePath: string | undefined): string {
  if (basePath === undefined || basePath === "" || basePath === "/") return ""
  const route = basePath.replace(/^\/+|\/+$/g, "")
  if (route.length === 0) return ""
  try {
    return `/${validateRouteId(route)}`
  } catch {
    throw new Error(`Storybook basePath must be a normalized pathname mount: ${basePath}`)
  }
}

function routeWithinBasePath(pathname: string, basePath: string): string | null {
  if (basePath === "") return pathname.replace(/^\/+|\/+$/g, "")
  const path = pathname.replace(/\/+$/g, "") || "/"
  if (path === basePath) return ""
  const prefix = `${basePath}/`
  if (!path.startsWith(prefix)) return null
  const route = path.slice(prefix.length)
  if (route.startsWith("/")) return null
  return route
}

function validateRouteId(route: string): string {
  if (route.length === 0 || route.startsWith("/") || route.endsWith("/") || route.includes("//") || /[?#]/.test(route)) {
    throw new Error(`Storybook route must be a normalized pathname id: ${route}`)
  }
  return route
}
