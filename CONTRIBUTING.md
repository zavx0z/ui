# Contributing

> Visual UI is **[Built for MetaFor](https://github.com/zavx0z/metafor)** and welcomes changes that preserve reuse across WebGPU and immersive applications.

[Project overview](README.md) · [Architecture](ARCHITECTURE.md)

## Set up the workspace

Use sibling `renderer`, `engine`, `highlighter`, and `ui` owner checkouts.
External Storybook is attached separately and is not installed by UI. Do not
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

Attach `.storybook/manifest.json` to the external Storybook server and open
the exact `@ui/components` package tab for catalog evidence.

## Choose the owning package

- Put DOM interfaces and state in [`zavx0z/renderer`](https://github.com/zavx0z/renderer)'s `@zavx0z/dom` package.
- Put cascade, layout, display lists, hit projection and renderer adapters in
  [`zavx0z/renderer`](https://github.com/zavx0z/renderer), not this repository.
- Put reusable controls, Field, Inspector, CodeEditor and HUD compositions,
  CSS, source-backed theme and icons in `packages/components`.
- Put private owner stories and comparison resources under
  `packages/components/.storybook`; Workbench and lifecycle remain external.

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
`packages`, `components`, `.storybook`, `assets`, `icons`, `scripts`, and
`tests`. Every TypeScript source and test filename is lowercase kebab-case;
exported TypeScript symbols retain their semantic language casing.

## Add or update a story

Private story modules own their route presentation, props/source projection
and exact natural production import. External generated loaders address one
static module/export from JSON; stories are never production package exports. If a
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

The final check typechecks all packages and runs unit tests. External
PackageSession checks compile the declaration catalog independently. Also
inspect the rendered comparison at a common scale when the change is visual;
passing unit tests alone is not visual acceptance.

Changes consumed by [`MetaFor`](https://github.com/zavx0z/metafor) should identify the exact UI revision so product integration remains reproducible while this repository stays independently reusable.
