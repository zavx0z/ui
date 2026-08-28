# Contributing

> Visual UI is **[Built for MetaFor](https://github.com/zavx0z/metafor)** and welcomes changes that preserve reuse across WebGPU and immersive applications.

[Project overview](README.md) · [Architecture](ARCHITECTURE.md) · [Static Storybook](https://zavx0z.github.io/ui/)

## Set up the workspace

Use sibling `renderer`, `engine`, `highlighter`, `storybook`, and `ui`
checkouts. Register their exact package owners before installing UI. Do not
replace them with file paths, TypeScript aliases, barrels or compatibility
packages.

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

- Put DOM interfaces and state in [`zavx0z/renderer`](https://github.com/zavx0z/renderer)'s `@zavx0z/dom` package.
- Put cascade, layout, display lists, hit projection and renderer adapters in
  [`zavx0z/renderer`](https://github.com/zavx0z/renderer), not this repository.
- Put reusable controls, Field, Inspector, CodeEditor and HUD compositions,
  CSS, source-backed theme and icons in `packages/components`.
- Put private story modules, the one root Workbench, comparison evidence,
  lifecycle and static-site code in `packages/storybook`.

Production Components depend only on DOM and explicit semantic helpers.
Production packages must not import Storybook, Engine, Layout, WebGPU or the
retired Elements/HUD packages.

Removing a runtime-wrapper package never removes its visible or interaction
contract. Port that contract to the natural DOM/CSS owner, verify it against
the recorded Blender reference at a common scale, and only then retire the old
implementation.

## Naming and source evidence

Public identifiers, routes, package names, data attributes, and user-facing copy use neutral semantic names. A source product name belongs only in provenance, exact source paths, or owner-facing evidence. Do not add aliases or re-exports when renaming a public owner.

Use lowercase semantic directories recognized by the repository tooling:
`packages`, `components`, `storybook`, `assets`, `icons`, `scripts`, and
`tests`. Every TypeScript source and test filename is lowercase kebab-case;
exported TypeScript symbols retain their semantic language casing.

## Add or update a story

Private story modules own their route presentation, controls, source generator
and exact natural production import. They are imported by `@ui/storybook`
through repository-private relative paths and are never package exports. If a
story has external visual evidence, register a lazy reference loader and record:

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
