import type {UiSurface} from "@layout/core/surface"
import type {UiSurfaceRect} from "@layout/core/runtime"
import {defineStorybookRoutes, type StorybookRouteDeclaration} from "./router.ts"
import {defineStorybookRouteTree, type StorybookRouteTree} from "./route-tree.ts"
import type {StorybookReferenceDescriptor, StorybookReferenceLoader} from "./reference.ts"

export type StorybookStoryArgs = Readonly<Record<string, unknown>>

export type StorybookStoryControlKind =
  | "boolean"
  | "number"
  | "text"
  | "select"
  | "color"
  | "custom"

export type StorybookStoryControlOption = Readonly<{
  value: string
  label: string
}>

export type StorybookStoryControl<Key extends string = string> = Readonly<{
  key: Key
  label: string
  group: string
  kind: StorybookStoryControlKind
  description?: string
  options?: readonly StorybookStoryControlOption[]
}>

export type StorybookStoryPlayContext<Args extends StorybookStoryArgs = StorybookStoryArgs> = Readonly<{
  surface: UiSurface
  args: Args
}>

export type StorybookStoryModuleInput<Args extends StorybookStoryArgs> = Readonly<{
  defaultArgs: Args
  controls?: readonly StorybookStoryControl<Extract<keyof Args, string>>[]
  render(surface: UiSurface, args: Args, frame: UiSurfaceRect): void
  source(args: Args): string
  play?(context: StorybookStoryPlayContext<Args>): void | Promise<void>
}>

export type StorybookStoryModule = Readonly<{
  defaultArgs: StorybookStoryArgs
  controls: readonly StorybookStoryControl[]
  render(surface: UiSurface, args: StorybookStoryArgs, frame: UiSurfaceRect): void
  source(args: StorybookStoryArgs): string
  play?(context: StorybookStoryPlayContext): void | Promise<void>
}>

export type StorybookStoryLoader = () => Promise<StorybookStoryModule>

export type StorybookStoryVariantInput = Readonly<{
  id: string
  label: string
  title: string
  tags?: readonly string[]
  load: StorybookStoryLoader
  loadReference?: StorybookReferenceLoader
}>

export type StorybookStorySectionInput = Readonly<{
  id: string
  label: string
  variants: readonly StorybookStoryVariantInput[]
}>

export type StorybookStoryComponentInput = Readonly<{
  id: string
  label: string
  apiName: string
  tags?: readonly string[]
  sections: readonly StorybookStorySectionInput[]
}>

export type StorybookStoryGroupInput = Readonly<{
  id: string
  label: string
  components: readonly StorybookStoryComponentInput[]
}>

export type StorybookStoryPath = Readonly<{
  component: string
  section: string
  variant: string
}>

export type StorybookStoryCatalogInput = Readonly<{
  groups: readonly StorybookStoryGroupInput[]
  fallback: StorybookStoryPath
}>

export type StorybookStoryIndexItem = Readonly<{
  route: string
  groupId: string
  groupLabel: string
  componentId: string
  componentLabel: string
  apiName: string
  sectionId: string
  sectionLabel: string
  variantId: string
  variantLabel: string
  title: string
  tags: readonly string[]
  searchText: string
  hasReference: boolean
}>

export type StorybookStoryRegistry = Readonly<{
  declaration: StorybookRouteDeclaration<string>
  routeTree: StorybookRouteTree<string>
  index: readonly StorybookStoryIndexItem[]
  fallback: string
  find(route: string): StorybookStoryIndexItem | undefined
  variants(route: string): readonly StorybookStoryIndexItem[]
  load(route: string): Promise<StorybookStoryModule>
  loadReference(route: string): Promise<StorybookReferenceDescriptor | null>
}>

type InternalStory = Readonly<{
  index: StorybookStoryIndexItem
  load: StorybookStoryLoader
  loadReference?: StorybookReferenceLoader
}>

export function defineStorybookStoryModule<const Args extends StorybookStoryArgs>(
  input: StorybookStoryModuleInput<Args>,
): StorybookStoryModule {
  const defaultArgs = Object.freeze({...input.defaultArgs})
  const controls = Object.freeze((input.controls ?? []).map((control) => normalizeControl(control)))
  const module: StorybookStoryModule = {
    defaultArgs,
    controls,
    render(surface, args, frame) {
      input.render(surface, args as Args, frame)
    },
    source(args) {
      const source = input.source(args as Args)
      if (source.trim().length === 0) throw new Error("Storybook story source must not be empty")
      return source
    },
    ...(input.play === undefined ? {} : {
      play: (context: StorybookStoryPlayContext) => input.play!({
        surface: context.surface,
        args: context.args as Args,
      }),
    }),
  }
  return Object.freeze(module)
}

export function defineStorybookStories(input: StorybookStoryCatalogInput): StorybookStoryRegistry {
  if (input.groups.length === 0) throw new Error("Storybook story catalog must contain at least one group")
  const stories: InternalStory[] = []
  const groupIds = new Set<string>()
  const componentIds = new Set<string>()

  for (const group of input.groups) {
    validateId("group", group.id)
    validateLabel("group", group.label)
    if (groupIds.has(group.id)) throw new Error(`Duplicate storybook story group: ${group.id}`)
    groupIds.add(group.id)
    if (group.components.length === 0) throw new Error(`Storybook story group has no components: ${group.id}`)

    for (const component of group.components) {
      validateId("component", component.id)
      validateLabel("component", component.label)
      validateLabel("component apiName", component.apiName)
      if (componentIds.has(component.id)) throw new Error(`Duplicate storybook story component: ${component.id}`)
      componentIds.add(component.id)
      if (component.sections.length === 0) throw new Error(`Storybook story component has no sections: ${component.id}`)
      const sectionIds = new Set<string>()

      for (const section of component.sections) {
        validateId("section", section.id)
        validateLabel("section", section.label)
        if (sectionIds.has(section.id)) throw new Error(`Duplicate storybook story section: ${component.id}/${section.id}`)
        sectionIds.add(section.id)
        if (section.variants.length === 0) throw new Error(`Storybook story section has no variants: ${component.id}/${section.id}`)
        const variantIds = new Set<string>()

        for (const variant of section.variants) {
          validateId("variant", variant.id)
          validateLabel("variant", variant.label)
          validateLabel("story title", variant.title)
          if (variantIds.has(variant.id)) {
            throw new Error(`Duplicate storybook story variant: ${component.id}/${section.id}/${variant.id}`)
          }
          variantIds.add(variant.id)
          if (typeof variant.load !== "function") throw new Error("Storybook story loader must be a function")
          const route = storyRoute({component: component.id, section: section.id, variant: variant.id})
          const tags = Object.freeze(uniqueStrings([...(component.tags ?? []), ...(variant.tags ?? [])]))
          const index: StorybookStoryIndexItem = Object.freeze({
            route,
            groupId: group.id,
            groupLabel: group.label,
            componentId: component.id,
            componentLabel: component.label,
            apiName: component.apiName,
            sectionId: section.id,
            sectionLabel: section.label,
            variantId: variant.id,
            variantLabel: variant.label,
            title: variant.title,
            tags,
            searchText: normalizeSearch([
              group.label,
              component.label,
              component.apiName,
              section.label,
              variant.label,
              variant.title,
              ...tags,
            ]),
            hasReference: variant.loadReference !== undefined,
          })
          stories.push(Object.freeze({
            index,
            load: variant.load,
            ...(variant.loadReference === undefined ? {} : {loadReference: variant.loadReference}),
          }))
        }
      }
    }
  }

  const routes = Object.freeze(stories.map(({index}) => index.route))
  const fallback = storyRoute(input.fallback)
  const declaration = defineStorybookRoutes({routes, fallback})
  const routeTree = defineStorybookRouteTree({leaves: routes})
  const byRoute = new Map(stories.map((story) => [story.index.route, story]))
  const loaded = new Map<string, Promise<StorybookStoryModule>>()
  const loadedReferences = new Map<string, Promise<StorybookReferenceDescriptor>>()
  const index = Object.freeze(stories.map((story) => story.index))

  return Object.freeze({
    declaration,
    routeTree,
    index,
    fallback,
    find(route: string) {
      return byRoute.get(route)?.index
    },
    variants(route: string) {
      const selected = byRoute.get(route)?.index
      if (selected === undefined) return Object.freeze([])
      return Object.freeze(index.filter((item) =>
        item.componentId === selected.componentId && item.sectionId === selected.sectionId))
    },
    load(route: string) {
      const story = byRoute.get(route)
      if (story === undefined) return Promise.reject(new Error(`Unknown storybook story route: ${route}`))
      const current = loaded.get(route)
      if (current !== undefined) return current
      const pending = story.load()
        .then((module) => validateLoadedStory(route, module))
        .catch((error) => {
          loaded.delete(route)
          throw error
        })
      loaded.set(route, pending)
      return pending
    },
    loadReference(route: string) {
      const story = byRoute.get(route)
      if (story === undefined) return Promise.reject(new Error(`Unknown storybook story route: ${route}`))
      if (story.loadReference === undefined) return Promise.resolve(null)
      const current = loadedReferences.get(route)
      if (current !== undefined) return current
      const pending = story.loadReference()
        .catch((error) => {
          loadedReferences.delete(route)
          throw error
        })
      loadedReferences.set(route, pending)
      return pending
    },
  })
}

export function storyRoute(path: StorybookStoryPath): string {
  validateId("component", path.component)
  validateId("section", path.section)
  validateId("variant", path.variant)
  return `${path.component}/${path.section}/${path.variant}`
}

function normalizeControl(control: StorybookStoryControl): StorybookStoryControl {
  validateId("control", control.key)
  validateLabel("control", control.label)
  validateLabel("control group", control.group)
  const options = control.options === undefined
    ? undefined
    : Object.freeze(control.options.map((option) => Object.freeze({
      value: option.value,
      label: option.label,
    })))
  return Object.freeze({...control, ...(options === undefined ? {} : {options})})
}

function validateLoadedStory(route: string, module: StorybookStoryModule): StorybookStoryModule {
  if (module === null || typeof module !== "object") throw new Error(`Storybook story did not load a module: ${route}`)
  if (module.defaultArgs === null || typeof module.defaultArgs !== "object" || Array.isArray(module.defaultArgs)) {
    throw new Error(`Storybook story defaultArgs must be an object: ${route}`)
  }
  if (!Array.isArray(module.controls)) throw new Error(`Storybook story controls must be an array: ${route}`)
  if (typeof module.render !== "function") throw new Error(`Storybook story render must be a function: ${route}`)
  if (typeof module.source !== "function") throw new Error(`Storybook story source must be a function: ${route}`)
  return module
}

function validateId(kind: string, value: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Invalid storybook story ${kind} id: ${value}`)
  }
}

function validateLabel(kind: string, value: string): void {
  if (value.trim().length === 0) throw new Error(`Storybook story ${kind} label must not be empty`)
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))]
}

function normalizeSearch(values: readonly string[]): string {
  return uniqueStrings(values).join(" ").toLocaleLowerCase("ru-RU")
}
