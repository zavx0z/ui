# Blender 5.2 LTS UI reference routing

Read this reference when visible UI semantics or visual parity are in scope. It is a routing and comparison guide, not copied source or a second production vocabulary.

## Adopted version and evidence

- Normative visual target: Blender `5.2.0 LTS`, released `2026-07-14`, official tag `v5.2.0`, revision `fbe6228777e7d9afefcd61a413844e790ae75db7`.
- Current GUI/API reference contour: `ai-srv`, official Linux binary `5.2.0 LTS` (`fbe6228777e7`), archive SHA-256 `96f6c181a30f4950607839dc84d42a354b250d8a0231b098b59b7bc69c351c48`, isolated display `:52`.
- When Codex has the configured `blender_reference` MCP server, use the read-only `capture_ui_reference` tool for exact `CURRENT` or `TIMELINE` evidence. It restores the temporarily changed editor area.
- Owner-only optional mirror: `/Users/zavx0z/repozitarium/blender-reference-source` contains legacy 4.5 evidence at revision `84afd5f785f7569b97cf3257000403e7847120a8`; public contributors do not need this path.
- Owner-only optional mirror: `/Users/zavx0z/repozitarium/blender-reference-manual` contains legacy 4.5 evidence at revision `48f79b7e9246f670283b043da8c6f4240e547241`; public contributors do not need this path.
- Portable routing uses the official `v5.2.0` source tag, rendered Manual/API URLs below, or the configured read-only MCP. Never make an owner-local mirror a build, test, or acceptance prerequisite.

No owner-accepted 5.2 UI raster is currently registered in `packages/storybook/assets/references/catalog.json`. A live MCP capture is current evidence but begins as `candidate`, never as owner acceptance.

Do not invalidate every 4.5 artifact mechanically. Classify its exact scope as `compatible`, `changed`, or `unverified`. A compatible artifact may remain only after a bounded 5.2 source, API, and visual check records why the relevant law did not change. Changed scopes require 5.2 evidence; unverified scopes cannot claim parity.

Known cross-version changes prevent a blanket compatibility claim:

- 5.0 reorganized theme roles and several drawing semantics;
- 5.1 reduced the Timeline marker region;
- 5.2 added multiline text, link controls, popover panning, numeric unit hints, and new playback behavior.

If the MCP server is unavailable, do not silently substitute a 4.5 capture. Its upstream arbitrary-code tool remains outside the reference allowlist.

## Vocabulary boundary

The source product name is allowed in provenance, exact source paths, comparison evidence, and owner-facing acceptance records. User-facing copy, package and subpath names, public TypeScript identifiers, production routes and story IDs, and CSS/data identifiers use neutral semantic vocabulary.

The production theme API is therefore `UiTheme`, `WidgetClass`, `WidgetState`, `Rgba8`, and `rgba8ToColor`. `theme-reference.ts` may retain exact provenance comments, but public aliases that restore source-branded names are prohibited.

## Authoritative routes

| Question | Authoritative route |
| --- | --- |
| Theme bytes and material roles | `release/datafiles/userdef/userdef_default_theme.c` |
| Widget state transitions | `source/blender/editors/interface/interface_widgets.cc` |
| Numeric pointer and text behavior | `source/blender/editors/interface/interface_handlers.cc` |
| Buttons, fields, lists, menus, and controls | Official Manual `interface/controls/` |
| Timeline anatomy and interaction | Manual `editors/timeline.md`; `scripts/startup/bl_ui/space_time.py` |
| Timeline implementation | `source/blender/editors/space_action/space_action.cc`; `source/blender/makesdna/DNA_action_types.h` |
| Timeline public editor API | `source/blender/makesrna/intern/rna_space.cc`: `SpaceDopeSheetEditor.mode = TIMELINE` |
| Current frame, ranges, and markers | `source/blender/makesrna/intern/rna_scene.cc`; `source/blender/makesrna/intern/rna_timeline.cc` |

Official rendered entrypoints:

- <https://docs.blender.org/manual/en/5.2/interface/controls/buttons/fields.html>
- <https://docs.blender.org/manual/en/5.2/interface/controls/buttons/menus.html>
- <https://docs.blender.org/manual/en/5.2/interface/controls/templates/list_presets.html>
- <https://docs.blender.org/manual/en/5.2/editors/timeline.html>
- <https://docs.blender.org/api/5.2/bpy.types.SpaceDopeSheetEditor.html>
- <https://docs.blender.org/api/5.2/bpy.types.TimelineMarker.html>
- <https://docs.blender.org/api/5.2/bpy.types.Scene.html>

The sparse source and Manual mirrors are read-only navigation. Inspect absent authoritative paths with `git ls-tree` and `git show HEAD:<path>` instead of widening or rewriting those checkouts.

## Timeline distinctions

- `Timeline` is the user-visible name, but the source implements it as `TIMELINE` mode of shared `SpaceAction` and `SpaceDopeSheetEditor`.
- Timeline mode uses a shared summary projection. Multiple independently labelled rows require a separate multi-channel contract.
- Horizontal coordinates are frames. `frame_current` owns the playhead, `frame_start` and `frame_end` own playback range, and an optional preview range is distinct from both playback and visible ranges.
- Diamonds in channel rows are keyframes. A `TimelineMarker` is a named scene entity in a separate marker row; do not call every plotted point a marker.
- Header, transport and frame controls, and the time view are distinct regions. Product commands stay outside the universal Timeline component.
- `show_seconds` changes formatting, not stored frame coordinates.
- Version 5.2 pause, preroll, and loop behavior belongs to a playback controller rather than the Timeline point model.

## Comparison record

Compare at one recorded viewport and common scale. Each reference entry records source version and revision, lossless asset SHA-256, viewport and DPR, crop, theme and locale, story state, compatibility, acceptance, and remaining owner decision.

The Storybook comparison planner chooses side-by-side or top-to-bottom placement by whichever yields the larger equal scale for subject and reference. Raster loading begins only after the selected story requests comparison. Unit tests, build output, and automated captures cannot mark owner acceptance.
