# Contributing

> Visual UI is **[Built for MetaFor](https://github.com/zavx0z/metafor)** and welcomes changes that preserve reuse across WebGPU and immersive applications.

[Project overview](README.md) · [Architecture](ARCHITECTURE.md) · [Static Storybook](https://zavx0z.github.io/ui/)

## Set up the workspace

Use sibling `engine`, `layout`, `storybook`, and `ui` checkouts. Register `@engine/core`, `@layout/core`, and `@zavx0z/storybook` with `bun link` from their owners before installing UI. The UI manifests intentionally use exact global links; do not replace them with file paths, TypeScript aliases, or compatibility packages.

```bash
bun install
bun run check
```

Useful focused commands:

```bash
bun run typecheck
bun run test
```

Use `$storybook ensure @ui/storybook` and `$storybook check @ui/storybook`
for the private catalog.

## Choose the owning package

- Put runtime, surfaces, targets, FlexBox, popover ownership, text-input dispatch, virtual input, and generic geometry in [`zavx0z/layout`](https://github.com/zavx0z/layout), not this repository.
- Put HTML-like visual primitives, controlled edit behavior, theme roles, and universal icons in `packages/elements`.
- Put controlled fields and composed visual controls in `packages/components`.
- Put heads-up presentation in `packages/hud`, without product commands or state ownership.
- Keep Elements descriptors and previews in `packages/elements/storybook`.
- Keep Components descriptors and previews in `packages/components/storybook`.
- Put only the UI catalog, comparison evidence, dev lifecycle, and static-site code in `packages/storybook`.

Dependencies must continue to point upward from Engine to Layout to Elements, Components, and HUD. Production packages must not import Storybook.

## Naming and source evidence

Public identifiers, routes, package names, data attributes, and user-facing copy use neutral semantic names. A source product name belongs only in provenance, exact source paths, or owner-facing evidence. Do not add aliases or re-exports when renaming a public owner.

Use lowercase semantic directories recognized by the repository tooling: `packages`, `components`, `elements`, `storybook`, `assets`, `icons`, `scripts`, `tests`, and `.github/workflows`. Every TypeScript source and test filename is lowercase kebab-case; exported TypeScript symbols retain their semantic language casing.

## Add or update a story

Story descriptors own their route, searchable metadata, controls, source generator, production import, and lazy implementation loader. Keep the initial package page limited to metadata. If a story has external visual evidence, register a lazy reference loader and record:

- exact source version and revision;
- SHA-256 of the lossless asset;
- viewport, DPR, UI scale, crop, theme, locale, and story state;
- `compatible | changed | unverified`;
- `candidate | accepted | superseded`.

An automated capture starts as `candidate`. Only an explicit owner decision can make it `accepted`.

## Verification

Run the smallest relevant tests while editing, then finish with:

```bash
bun run check
```

The final check typechecks all packages, runs unit and Storybook tests, and builds the static `/ui/` site. Also inspect the rendered comparison at a common scale when the change is visual; passing unit tests alone is not visual acceptance.

Changes consumed by [`MetaFor`](https://github.com/zavx0z/metafor) should identify the exact UI revision so product integration remains reproducible while this repository stays independently reusable.
