# Central UI Storybook workflow

Read this reference for lifecycle, static delivery, route-specific browser evidence, and source freshness of the standalone UI catalog. Node-specific lifecycle belongs to `$nodes-dev` in the Nodes repository.

## Maintained contour

The executable registry is `scripts/storybooks.json` and contains only selector `ui` at `http://127.0.0.1:4017`.

| Mount | Kind | Canvas |
| --- | --- | --- |
| `/` | DOM catalog | none |
| `/elements/` | WebGPU story tree | `#stage-canvas` |
| `/components/` | WebGPU story tree | `#stage-canvas` |
| `/storybook/` | diagnostic WebGPU tree | `#storybook-canvas` |
| `/hud/` | DOM package inventory | none |

## Lifecycle and source freshness

From the exact UI checkout root:

```bash
SKILL=packages/storybook/.agents/skills/ui-dev
"$SKILL/scripts/ui-dev.sh" status "$PWD"
"$SKILL/scripts/ui-dev.sh" ensure "$PWD"
```

The wrapper always selects `ui`; it does not accept a package selector. A healthy exact process is reused. A stopped contour is started only by `ensure`, `start`, or `restart` in a retained long-lived PTY. A foreign listener is reported and preserved.

`UI_DEV_TEST_MODE=1 UI_DEV_TEST_PORT=<ephemeral>` isolates lifecycle HTTP state only. It does not redirect CDP: without an explicitly separate `UI_DEV_CDP_PORT`, browser commands still inspect port `9222`. A no-real-browser audit uses app, tests, typechecks, and static build only.

The UI Storybook is no-HMR. After a stable checkpoint:

| Changed scope | Running contour that must restart |
| --- | --- |
| `packages/elements` production, stories, or exports | `ui`; separately verify Nodes only when that repository is in scope |
| `packages/components` production, stories, or exports | `ui`; separately verify Nodes only when required |
| `packages/hud` production or inventory | `ui` |
| shared `packages/storybook` router, shell, server, or catalog | `ui` |
| route-only navigation on fresh source | none |

Do not start an unrelated stopped repository only to satisfy this table. After a required restart, reload each exact route in the existing singleton target.

## Static Pages build

```bash
bun run build
```

The build emits `dist` for public base `/ui/`. Verify `index.html`, one shell for each mount, `404.html`, `.nojekyll`, `storybook-manifest.json`, the font, independently split browser assets, and `references/catalog.json`. The deep-link recovery page must restore an exact leaf before its package entry reads the route.

Reference catalog metadata may load as a separate chunk. Image loaders must not run until a selected story requests comparison. A build is not owner visual acceptance.

## One stable background target

```bash
bun "$SKILL/scripts/ui-browser.ts" open "$PWD" ui --route /
bun "$SKILL/scripts/ui-browser.ts" dom "$PWD" ui --route /elements/
bun "$SKILL/scripts/ui-browser.ts" canvas "$PWD" ui \
  --route /elements/div/basic/background --output /tmp/elements.png
bun "$SKILL/scripts/ui-browser.ts" canvas "$PWD" ui \
  --route /components/button/basic/contained --output /tmp/components.png
bun "$SKILL/scripts/ui-browser.ts" page "$PWD" ui \
  --route /hud/ --output /tmp/ui-hud.png
```

Every overview has trailing `/`; every exact leaf does not. The helper performs a no-redirect HTTP preflight. `308` reports the canonical address, `404` is rejected, and DOM routes reject canvas-only actions. One target is navigated in place. Multiple targets are explicit ambiguity; close only a duplicate proven to belong to the current task.

Each nested page must expose `data-storybook-home` with `href="/"` in local development. Static Pages shells resolve the same Home control to `/ui/`. Verify the link in DOM and use `page` when the full DOM, SVG, or WebGPU composition needs inspection.

## Interaction and viewport evidence

`interact` requires selector `ui`, an explicit canonical route, an explicit existing target ID, and a versioned JSON data plan. It never evaluates supplied JavaScript. Use pointer and key steps plus checkpoints exactly as described by the tests for `scripts/interaction-plan.ts`.

`viewports` and `profile` are available only on the current route's WebGPU canvas. Viewport emulation and background focus emulation are restored in `finally`. Canvas capture rejects two consecutive black snapshots and never writes a rejected artifact.

Automated DOM, canvas, input, profile, and static-build evidence remains route-specific and is not owner acceptance.
