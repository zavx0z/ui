# Требования `@ui/storybook`

`@ui/storybook` — private catalog application для одного semantic
`@zavx0z/dom` Document, одного canvas и одного DOM→CPU renderer→WebGPU
presentation pipeline. Package не является production dependency UI и не
публикует exports.

## `UI-STORYBOOK-DOM-001` — one document pipeline

1. `app/bootstrap.ts` загружает только `app/dom-entry.ts`. Retained fallback,
   `UiRuntime`, `UiSurface`, `@layout/core` и `@ui/elements` отсутствуют в
   runtime source, build provenance, manifest и browser output. Navigation
   metadata использует только `@zavx0z/storybook/workbench`; desktop-only
   test policy является package-local structural data без legacy import.
2. `createDocumentCanvasRuntime()` является единственным browser host. Один
   `Document`, Workbench root, CPU renderer, retained WebGPU backend и Engine
   overlay живут до `pagehide`; cleanup идемпотентен.
3. DOM listeners являются единственным author-facing event API. Stories не
   регистрируют callbacks на boxes, surfaces или Engine objects.
4. Story factories являются repository-private modules и импортируются
   `app/dom-entry.ts` по relative paths. `@ui/components` публикует только
   natural production subpaths; `@ui/components/dom/*` и story exports
   запрещены.

## `UI-STORYBOOK-ROUTES-001` — complete exact route tree

1. `dom-story-details.json` содержит 176 detail descriptors без loader
   functions. `dom-story-navigation.ts` выводит из них все owner/category/
   component/section overviews и exact shared route tree.
2. `dom-routes.ts` регистрирует все 391 допустимых overview/detail paths.
   Неизвестный path fail-closed на server/router boundary.
3. Каждый overview является собственной semantic `section/h2/p/ul/li`
   presentation. Он не загружает первый detail descendant как скрытый fallback.
4. Detail routes создают standard Node/Element/HTMLElement/HTML*Element trees.
   Product-specific compound stories также состоят только из одного DOM realm
   и flat executable CSS.

## `UI-STORYBOOK-WORKBENCH-001` — six addressed regions

Shared `@zavx0z/storybook/workbench` владеет одним stable semantic tree с
catalog, secondary navigation, preview, scenarios, source inspector и status.
Каждый region меняется через addressed `update(address, value)` и сохраняет
неизменённые Node/Text identities. Active navigation может быть `null` на
настоящем overview; неизвестный non-null id запрещён.

Source inspector показывает три live documents:

- HTML сериализуется из фактического semantic tree;
- CSS является exact stylesheet, переданным renderer;
- TypeScript использует direct `createDocument`/`createElement`, properties и
  standard listeners без старых surface factories.

## `UI-STORYBOOK-PLATFORM-001` — supported HTML/CSS surface

Catalog документирует exact prototype hierarchy
`EventTarget → Node → Element → HTMLElement → HTML*Element`. `title` находится
на `HTMLElement` и advisory tooltip рисуется renderer-owned UA fragments.

Interface catalog содержит ровно 43 runtime interfaces, перечисленные как
implemented в canonical `@zavx0z/dom` `SUPPORT.md`: tree/data/collections,
Element/HTMLElement, все текущие exact HTML prototypes и Event families.
Каждый detail имеет отдельный `dom/interfaces/...` descriptor/route, exact
hierarchy и sample только на реализованных members. `Not implemented yet`
members не появляются как stubs, controls или обещания поддержки.

Поддержанные stories используют block/inline/Flex, box model, overflow/scroll,
scrollbar-width, text-align, flex-item z-index, standard form controls,
Popover top layer, gauges и `HTMLImageElement` с bounded cover/contain image
projection. Неподдержанная browser platform возможность не заменяется fake
callback или параллельным UI element contract.

## `UI-STORYBOOK-ACCEPTANCE-001` — package and browser evidence

После stable source checkpoint выполняются exact package `typecheck`, tests и
static build через `$storybook check @ui/storybook`. Route acceptance требует:

- readiness `uiStorybook=ready` и exact `uiStorybookRoute`;
- `uiStorybookPipeline=dom-webgpu`;
- console error count `0`;
- exact canvas PNG с non-black evidence;
- визуальное соответствие ожидаемому route state.

Server использует automatic port protocol shared Storybook. Build/lifecycle не
разрешают commit, push, Pages deploy или workflow dispatch.
