import {describe, expect, test} from "bun:test"
import {
  StorybookRouter,
  StorybookRouteTreeNotFoundError,
  StorybookRouteTreeRouter,
  defineStorybookRoutes,
  storybookRouteUrl,
  resolveStorybookRoute,
} from "./router.ts"
import {defineStorybookRouteTree} from "./route-tree.ts"

const routes = ["editor/scene", "socket/types", "comparison/reference"] as const
const declaration = defineStorybookRoutes({routes, fallback: "editor/scene"})

describe("StorybookRouter pure routing", () => {
  test("keeps root-mounted pathname compatibility when options are omitted", () => {
    expect(declaration).toEqual({location: "pathname", routes, fallback: "editor/scene"})
    expect(Object.isFrozen(declaration)).toBeTrue()
    expect(Object.isFrozen(declaration.routes)).toBeTrue()
    expect(resolveStorybookRoute(declaration, {pathname: "/socket/types"})).toBe("socket/types")
    expect(resolveStorybookRoute(declaration, {pathname: "//socket/types/"})).toBe("socket/types")
    expect(storybookRouteUrl("comparison/reference")).toBe("/comparison/reference")
    expect(storybookRouteUrl("comparison/reference", {basePath: "/"})).toBe("/comparison/reference")
  })

  test("normalizes one exact mount while preserving package-owned story ids", () => {
    for (const basePath of ["ui", "/ui", "/ui/"]) {
      expect(resolveStorybookRoute(
        declaration,
        {pathname: "/ui/socket/types"},
        {basePath},
      )).toBe("socket/types")
      expect(storybookRouteUrl("comparison/reference", {basePath}))
        .toBe("/ui/comparison/reference")
    }
    expect(resolveStorybookRoute(
      declaration,
      {pathname: "/nodes/ui/comparison/reference/"},
      {basePath: "/nodes/ui"},
    )).toBe("comparison/reference")
  })

  test("falls back for the mount root, unknown suffixes and every other mount", () => {
    for (const pathname of [
      "/ui",
      "/ui/",
      "/ui/missing",
      "/ui//socket/types",
      "/ui-other/socket/types",
      "/other/socket/types",
      "/socket/types",
    ]) {
      expect(resolveStorybookRoute(declaration, {pathname}, {basePath: "/ui"}), pathname)
        .toBe("editor/scene")
    }
  })

  test("rejects malformed route declarations and base paths", () => {
    expect(resolveStorybookRoute(declaration, {pathname: "/missing"})).toBe("editor/scene")
    expect(() => defineStorybookRoutes({routes: ["#/socket/types"] as const, fallback: "#/socket/types"})).toThrow()
    expect(() => defineStorybookRoutes({routes: ["socket//types"] as const, fallback: "socket//types"})).toThrow()
    expect(() => defineStorybookRoutes({routes: ["editor/scene", "editor/scene"] as const, fallback: "editor/scene"})).toThrow()
    for (const basePath of ["/ui//catalog", "/ui?mode=all", "/ui#catalog"]) {
      expect(() => storybookRouteUrl("editor/scene", {basePath}), basePath)
        .toThrow("Storybook basePath must be a normalized pathname mount")
      expect(() => resolveStorybookRoute(declaration, {pathname: "/ui/editor/scene"}, {basePath}), basePath)
        .toThrow("Storybook basePath must be a normalized pathname mount")
    }
  })
})

describe("StorybookRouter mounted browser lifecycle", () => {
  test("reads and pushes prefixed URLs without capturing sibling mounts", () => {
    withBrowser("/ui/socket/types", ({pushed, navigate}) => {
      const router = new StorybookRouter(declaration, {basePath: "/ui/"})
      const changes: string[] = []
      router.subscribe((route, previous) => changes.push(`${previous}->${route}`))

      expect(router.current).toBe("socket/types")
      router.go("comparison/reference")
      expect(pushed).toEqual(["/ui/comparison/reference"])
      expect(router.current).toBe("comparison/reference")

      router.go("missing" as never)
      expect(pushed).toHaveLength(1)
      expect(router.current).toBe("comparison/reference")

      navigate("/ui/socket/types/")
      expect(router.current).toBe("socket/types")
      navigate("/other/comparison/reference")
      expect(router.current).toBe("editor/scene")
      navigate("/ui-other/socket/types")
      expect(router.current).toBe("editor/scene")

      expect(changes).toEqual([
        "socket/types->comparison/reference",
        "comparison/reference->socket/types",
        "socket/types->editor/scene",
      ])

      router.dispose()
      navigate("/ui/comparison/reference")
      expect(router.current).toBe("editor/scene")
    })
  })

  test("navigates registered route-tree nodes, canonicalizes history and fails closed", () => {
    const tree = defineStorybookRouteTree({
      leaves: ["button/basic/contained", "button/basic/text"] as const,
    })
    withBrowser("/ui/button", ({pushed, replaced, navigate}) => {
      const notFound: string[] = []
      const router = new StorybookRouteTreeRouter(tree, {
        basePath: "/ui",
        onNotFound: (error) => notFound.push(error.pathname),
      })
      const changes: string[] = []
      router.subscribe((node, previous) => changes.push(`${previous.path}->${node.path}`))

      expect(router.current).toMatchObject({kind: "overview", path: "button"})
      expect(replaced).toEqual(["/ui/button/"])
      expect(router.go("button/basic/contained")).toBeTrue()
      expect(pushed).toEqual(["/ui/button/basic/contained"])
      expect(router.current).toMatchObject({kind: "leaf", path: "button/basic/contained"})
      expect(router.go("missing")).toBeFalse()
      expect(pushed).toHaveLength(1)

      navigate("/ui/button/basic/text/")
      expect(replaced.at(-1)).toBe("/ui/button/basic/text")
      expect(router.current).toMatchObject({kind: "leaf", path: "button/basic/text"})
      navigate("/ui/missing")
      navigate("/other/button/basic/text")
      expect(notFound).toEqual(["/ui/missing", "/other/button/basic/text"])
      expect(router.current).toMatchObject({kind: "leaf", path: "button/basic/text"})
      expect(changes).toEqual([
        "button->button/basic/contained",
        "button/basic/contained->button/basic/text",
      ])

      router.dispose()
      navigate("/ui/")
      expect(router.current).toMatchObject({kind: "leaf", path: "button/basic/text"})
    })

    withBrowser("/ui/missing", () => {
      expect(() => new StorybookRouteTreeRouter(tree, {basePath: "/ui"}))
        .toThrow(StorybookRouteTreeNotFoundError)
    })
  })
})

type BrowserHarness = Readonly<{
  pushed: string[]
  replaced: string[]
  navigate(pathname: string): void
}>

function withBrowser(pathname: string, run: (harness: BrowserHarness) => void): void {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
  const historyDescriptor = Object.getOwnPropertyDescriptor(globalThis, "history")
  const listeners = new Set<() => void>()
  const location = {pathname}
  const pushed: string[] = []
  const replaced: string[] = []
  const browserWindow = {
    location,
    addEventListener(type: string, listener: () => void) {
      if (type === "popstate") listeners.add(listener)
    },
    removeEventListener(type: string, listener: () => void) {
      if (type === "popstate") listeners.delete(listener)
    },
  }
  const browserHistory = {
    pushState(_data: unknown, _unused: string, url: string | URL | null) {
      if (url === null) return
      const next = String(url)
      pushed.push(next)
      location.pathname = next
    },
    replaceState(_data: unknown, _unused: string, url: string | URL | null) {
      if (url === null) return
      const next = String(url)
      replaced.push(next)
      location.pathname = next
    },
  }

  Object.defineProperty(globalThis, "window", {configurable: true, value: browserWindow})
  Object.defineProperty(globalThis, "history", {configurable: true, value: browserHistory})
  try {
    run({
      pushed,
      replaced,
      navigate(nextPathname) {
        location.pathname = nextPathname
        for (const listener of [...listeners]) listener()
      },
    })
  } finally {
    restoreGlobal("window", windowDescriptor)
    restoreGlobal("history", historyDescriptor)
  }
}

function restoreGlobal(name: "window" | "history", descriptor: PropertyDescriptor | undefined): void {
  if (descriptor === undefined) delete (globalThis as unknown as Record<string, unknown>)[name]
  else Object.defineProperty(globalThis, name, descriptor)
}
