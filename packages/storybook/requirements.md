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
5. Один `StorybookRouteTreeRouter` живёт вместе с Document. Navigation и
   scenario events вызывают только `router.go()`, а subscription с revision
   guard загружает следующий story/controller и обновляет addressed Workbench
   regions in place. `location.assign`, `location.href`, reload, новый canvas,
   Workbench либо renderer runtime при route change запрещены.
6. Runtime получает один полный immutable stylesheet для всех platform,
   production и aggregate routes. Смена route не требует пересоздания runtime
   или замены CSS owner; dispose применяется только к предыдущему story.

## `UI-STORYBOOK-ROUTES-001` — complete exact route tree

1. `dom-story-details.json` содержит 176 detail descriptors без loader
   functions. `dom-story-navigation.ts` выводит из них все owner/category/
   component/section overviews и exact shared route tree.
2. `dom-routes.ts` регистрирует все 391 допустимых overview/detail paths.
   Неизвестный path fail-closed на server/router boundary.
3. Каждый overview создаёт stable aggregate wrapper и отдельный production
   story/controller для каждого непосредственного ребёнка. Если ребёнок сам
   overview, aggregate явно выбирает один bounded representative detail этого
   ребёнка; он не превращает representative в route selection. URL list,
   labels-only cards и скрытый first-leaf fallback запрещены. Aggregate source
   сериализует фактические production roots и объединяет exact child sources.
4. Detail routes создают standard Node/Element/HTMLElement/HTML*Element trees.
   Product-specific compound stories также состоят только из одного DOM realm
   и flat executable CSS.

## `UI-STORYBOOK-WORKBENCH-001` — six addressed regions

Shared `@zavx0z/storybook/workbench` владеет одним stable semantic tree с
catalog, secondary navigation, preview, scenarios, owner Inspector host и status.
Каждый region меняется через addressed `update(address, value)` и сохраняет
неизменённые Node/Text identities. Active navigation может быть `null` на
настоящем overview; неизвестный non-null id запрещён.

Catalog является grouped navigation tree, а не flat listbox. UI передаёт shared
Workbench полные `group` и `searchText` из `uiPrimaryItems()` без промежуточной
потери metadata. Группы `DOM`, `Элементы`, `Компоненты` и `HUD` являются
раскрываемыми `treeitem`, но не routes; их leaves сохраняют exact category route.
Collapse state принадлежит Workbench, keyed по `group.id`, а toggle публикует
semantic event без route navigation. Поиск использует group label и полные
`label`/`title`/`route`/`searchText` leaf metadata. Обновление catalog сохраняет
DOM identities неизменившихся group и leaf nodes, active route и независимое
состояние остальных групп.

Эти шесть regions сохраняют историческую editor-композицию Workbench:
catalog, secondary navigation, preview, scenarios и UI-owned Props Inspector образуют
пять плотных рабочих панелей над отдельной full-width StatusBar. Workbench
занимает доступный canvas без oversized card, pill stack либо декоративной
пустой рамки. Panel/editor-region использует компактные headers, row navigation,
тонкие separators, low-radius contour и раздельные material roles для region
border, focus outline, panel header и panel body.

StatusBar имеет ровно `24px` logical height, `2px` top material band,
`12px` right inset и `11px` project font. Она не получает side/bottom window
chrome, rounded card contour либо интерактивное поведение. Status text остаётся
одной плотной строкой и не перекрывает рабочие regions.

Source inspector показывает три live documents:

- HTML сериализуется из фактического semantic tree;
- CSS является complete immutable stylesheet, переданным единственному
  renderer runtime, а detail source сохраняет exact production owner CSS;
- TypeScript для platform stories использует direct
  `createDocument`/`createElement`, properties и standard listeners;
- TypeScript для component stories импортирует exact production owner и
  вызывает его public factory. Private direct-element replica не может
  подменять production Component в preview либо source.

Три source documents имеют самостоятельные compact headers, scrollable body,
dark source material, gutter/text roles и thin outline. Они не превращаются в
oversized rounded islands и не используют preview-only CSS как будто это
production owner stylesheet.

## `UI-STORYBOOK-VISUAL-001` — Blender 5.2 composition and materials

1. Blender `5.2.0 LTS` является нормативным reference для visible composition,
   density, grouping, proportions, palette/material states и interaction
   Workbench, Components и HUD presentations. Это owner-facing evidence law,
   а не user-facing product vocabulary либо public API naming.
2. Visible controls по умолчанию являются compact rectangular low-radius
   elements в плотных rows/groups с thin borders и separators. Pill
   silhouettes, oversized cards, большие пустые intervals и растягивание
   control на весь preview запрещены без exact reference evidence.
3. Preview выделяет production control сопоставимый available size и сохраняет
   свободное пространство как editor workspace. Workbench framing не меняет
   production control height, radius, gap, icon либо text rhythm.
4. Panel header/body, editor background/border/focus outline, input, menu,
   selected, hover, active и disabled остаются отдельными material roles даже
   при совпадающих default color bytes. Совпадающие radius либо color values не
   создают общий theme/config owner.

## `UI-STORYBOOK-PRODUCTION-001` — stories use exact production owners

1. Component detail route импортирует exact natural `@ui/components/*` leaf,
   создаёт preview его public factory и передаёт renderer exact exported CSS
   этого owner. Storybook-only direct `document.createElement` replica
   production control запрещена.
2. Standard DOM interface/element routes остаются прямыми platform proofs:
   они документируют `@zavx0z/dom` и не фабрикуют отсутствующий Component.
3. Field, Inspector, CodeEditor и HUD продолжают использовать действующие
   production factories. Button, TextField, Pane, Badge, Typography, Divider,
   NumberInput, Checkbox, Switcher, ControlGroup, SliderControl,
   ProgressCheckbox, VectorInput, MatrixInput, ReferenceInput,
   CollectionInput, PathInput, ColorInput, List и Table получают собственные
   production owners до visual acceptance соответствующих routes.
4. Adapter может хранить Storybook args, controls, events и source
   serialization, но не копирует DOM composition, interaction state machine,
   CSS либо visual defaults production owner.

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

## `UI-STORYBOOK-REFERENCE-001` — equal-scale evidence and owner acceptance

1. Visual slice сравнивается с exact Blender `5.2.0 LTS` reference при одном
   recorded viewport/DPR и одном common scale. Reference entry хранит version,
   revision, lossless asset SHA-256, crop, theme/locale, exact story state,
   compatibility и acceptance state.
2. Comparison planner выбирает side-by-side либо top-to-bottom по варианту с
   большим равным scale subject/reference. Subject и reference не получают
   разные scales, а wide/tall control не втискивается в фиксированный split.
3. Raster загружается lazy только после запроса сравнения выбранной story.
   Metadata index может оставаться eager; image bytes не входят в initial
   catalog bundle.
4. Unit tests, typecheck, build, readiness, console-zero и automated canvas
   capture являются evidence gates, но не visual acceptance. Новый либо
   переклассифицированный capture начинается как `candidate`; только явное
   решение владельца переводит его в `accepted`.
5. Legacy reference не становится совместимым автоматически. Его bounded scope
   классифицируется как `compatible`, `changed` либо `unverified` относительно
   5.2; unverified evidence не подтверждает visual parity.

## `UI-STORYBOOK-ACCEPTANCE-001` — package and browser evidence

После stable source checkpoint выполняются exact package `typecheck`, tests и
static build через `$storybook check @ui/storybook`. Route acceptance требует:

- readiness `uiStorybook=ready` и exact `uiStorybookRoute`;
- `uiStorybookPipeline=dom-webgpu`;
- console error count `0`;
- exact canvas PNG с non-black evidence;
- визуальное соответствие ожидаемому route state;
- production-owner identity для Component routes;
- recorded equal-scale comparison там, где route заявляет visual parity;
- отдельное явное owner acceptance для accepted reference state.

Server использует automatic port protocol shared Storybook. Build/lifecycle не
разрешают commit, push, Pages deploy или workflow dispatch.
