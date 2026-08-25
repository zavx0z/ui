---
name: ui-dev
description: "Develop and verify the standalone Visual UI repository, its Elements, Components, HUD, and centralized static WebGPU Storybook. Use nodes-dev for node-specific UI and metafor-dev for product runtime."
---

# UI development

Use the exact UI checkout supplied for the task. Preserve its branch or detached HEAD, unrelated changes, listeners, and browser targets. `@ui/storybook` owns one no-HMR process, one origin, and one target; package isolation comes from routes and separate browser bundles rather than extra servers.

Before changing a contract, read the repository `ARCHITECTURE.md`, the affected package requirements, public types, and focused tests. A new law is written in the owning requirements before its implementation.

`@layout/core` owns runtime, surface, spatial targets, FlexBox, popover chains,
text-input dispatch, virtual input, and generic polyline geometry. Import its
exact public subpaths directly; `@ui/elements` must not duplicate, alias, or
re-export them. Elements owns HTML-like visual primitives, controlled editing,
widget appearance, theme, and icons. Every TypeScript source and test filename
is lowercase kebab-case even when its exported symbol uses PascalCase.

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
| `@ui/storybook` | `/storybook/` | diagnostic WebGPU fixture |
| `@ui/hud` | `/hud/` | honest DOM package inventory |

Every story prefix is an overview with trailing `/`; an exact story leaf has no trailing `/`. Every nested page exposes `Home` back to `/`. Unknown suffixes are rejected instead of opening a fallback story. Static Pages output uses the same routes below `/ui/`.

Read [references/storybook.md](references/storybook.md) before lifecycle, browser, interaction, static build, or source-freshness work. Read [references/profiling.md](references/profiling.md) only for CPU, frame, heap, or external WebGPU Inspector evidence.

## One lifecycle command

```bash
SKILL=.agents/skills/ui-dev
"$SKILL/scripts/ui-dev.sh" status  "$PWD"
"$SKILL/scripts/ui-dev.sh" ensure  "$PWD"
"$SKILL/scripts/ui-dev.sh" restart "$PWD"
```

Run read-only `status` first and `ensure` before the first lifecycle or browser operation. `ensure`, `start`, and `restart` may remain foreground owners of the exact Bun child, so retain their long-lived PTY. Foreign listeners are never adopted or stopped.

For an explicitly isolated request that must not inspect the real browser, run only tests, typechecks, the static build, and an ephemeral HTTP server. `UI_DEV_TEST_MODE` isolates the lifecycle port but does not isolate CDP: do not call `ui-browser.ts` unless `UI_DEV_CDP_PORT` names a separately owned test browser.

After an applicable source change, finish a stable source checkpoint, restart the running UI selector, and explicitly reload every route required for evidence. Route-only navigation on fresh source may reuse the same process and target.

## Route-aware browser evidence

```bash
bun "$SKILL/scripts/ui-browser.ts" targets "$PWD" ui
bun "$SKILL/scripts/ui-browser.ts" reload "$PWD" ui \
  --route /elements/div/ --target-id "$target_id"
bun "$SKILL/scripts/ui-browser.ts" canvas "$PWD" ui \
  --route /components/button/basic/contained --target-id "$target_id" \
  --output /tmp/ui-components.png
bun "$SKILL/scripts/ui-browser.ts" page "$PWD" ui \
  --route /hud/ --target-id "$target_id" --output /tmp/ui-hud.png
```

Run `targets` first. Open `/` only when the origin has no target; multiple targets are explicit ambiguity. Route operations navigate an existing target in place and never focus an OS window. DOM routes reject canvas, touch, and profile actions. `page` captures the complete rendered viewport without browser chrome or focus changes. The helper preflights the exact route, rejects noncanonical redirects and unknown paths, and selects the page-owned canvas descriptor.

Automated browser operations are background-only. They never call `Page.bringToFront`, focus or window endpoints, AI macOS, or OS screenshot services. Exact canvas evidence decodes the target canvas PNG and rejects starting or idle black pixels. Emulation is cleared before handoff.

## Static and reference evidence

`bun run build` must produce a self-contained `dist` for Pages base `/ui/`, including all five page shells, split lazy chunks, deep-link recovery, the font, and reference metadata. Story implementations and reference raster assets stay lazy. A reference records exact provenance, SHA-256, viewport, DPR, compatibility, and acceptance; automated captures remain candidates until the owner accepts them.

GitHub Pages deployment is manual and owner-gated. Never dispatch
`.github/workflows/pages.yml`, run `gh workflow run`, change repository Pages
settings, or deploy an artifact unless the owner explicitly requests deployment
in the current task. `bun run build` and checks verify `dist`; they do not
authorize publishing it.

Tests and typechecks prove contracts. DOM and console evidence prove one exact route and target. Page PNG proves the rendered viewport; Canvas PNG proves exact canvas pixels. Neither includes browser chrome. Synthetic interaction, emulation, profiling, and external GPU capture do not become physical-device proof or owner acceptance.

At handoff report checkout and commit, selector, process ownership and PID, exact route and target, checks, static build, console, visual evidence where applicable, restored native metrics, and every remaining integration or owner gate.
