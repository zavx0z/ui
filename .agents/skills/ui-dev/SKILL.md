---
name: ui-dev
description: "Develop and verify the standalone Visual UI repository, its Elements, Components, HUD, visual references, and production contracts. Use the global storybook skill for @ui/storybook and nodes-dev for node-specific UI."
---

# UI development

Use the exact UI checkout supplied for the task. Preserve its branch or detached HEAD, unrelated changes, listeners, and browser targets. `@ui/storybook` owns the UI catalog and package pages; the global `$storybook` owns their package-named lifecycle and exact browser target.

Before changing a contract, read the repository `ARCHITECTURE.md`, the affected package requirements, public types, and focused tests. A new law is written in the owning requirements before its implementation.

`@layout/core` owns runtime, surface, spatial targets, FlexBox, popover chains,
text-input dispatch, virtual input, and generic polyline geometry. Import its
exact public subpaths directly; `@ui/elements` must not duplicate, alias, or
re-export them. Elements owns HTML-like visual primitives, controlled editing,
widget appearance, theme, and icons. Every TypeScript source and test filename
is lowercase kebab-case even when its exported symbol uses PascalCase.

The shared HTML shell declares one Engine-owned `engine-default-font` meta URL.
Package pages and stories call `UiRuntime.create()` without a default-font path;
a custom runtime font bypasses the meta request. The static build may copy the
exact Engine asset once into its application output, but production UI packages
never own or eagerly load it.

## UI reference and product vocabulary

The adopted Blender 5.2 LTS source and visual reference constrains the visible Elements, Components, Storybook workbench, and HUD presentations. Match composition, density, grouping, material states, and interaction before calling a visual slice complete. An older artifact is current evidence only after an exact scope-specific compatibility check; otherwise it is legacy navigation.

The reference product name is evidence vocabulary, not product vocabulary. It may appear in internal provenance, exact source paths, comparison artifacts, and owner-facing acceptance records, but not in new user-facing labels, public TypeScript identifiers, package names, production routes, story IDs, CSS/data identifiers, or copied source examples.

Name production APIs by their neutral role, for example `Timeline`, `Frame`, `NumberInput`, or `Theme`. The current UI public surface is neutral: any source-branded API, alias, or re-export is a regression.

Read [references/blender-reference.md](references/blender-reference.md) before changing or accepting visible semantics, naming, shape, density, or interaction. Pure server, router, and lifecycle work does not load unrelated visual reference sections.

## Central package catalog

| Package page | Overview route | Presentation |
| --- | --- | --- |
| catalog | `/` | DOM package catalog |
| `@ui/elements` | `/elements/` | WebGPU story catalog |
| `@ui/components` | `/components/` | WebGPU story catalog |
| `@ui/hud` | `/hud/` | honest DOM package inventory |

Every story prefix is an overview with trailing `/`; an exact story leaf has no trailing `/`. Every nested page exposes `Главная` back to `/`. Unknown suffixes are rejected instead of opening a fallback story. Static Pages output uses the same routes below `/ui/`.

## Storybook boundary

Use the single global `$storybook` with exact package `@ui/storybook` for
lifecycle, automatic origin, static build, exact-route browser evidence,
interaction and profiling. This skill contains no lifecycle/browser scripts,
selector, port, process state or copied Storybook rules.

UI remains the semantic owner of its package catalog, Blender-compatible visual
reference, preview behavior, accepted rasters and route-specific expectations.
Those laws stay in package requirements and `references/blender-reference.md`;
generic Storybook mechanics stay only in `$storybook`.

At handoff report affected UI owners, focused and repository checks, reference
compatibility where applicable, and every remaining product or owner gate.
