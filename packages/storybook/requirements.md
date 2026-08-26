# Требования UI Storybook application

> **[Built for MetaFor](https://github.com/zavx0z/metafor)** as a reusable static WebGPU workbench.

Private `@ui/storybook` владеет единым dev-каталогом семейства UI, package
mounts, preview state, lifecycle, `/ui/` static output и acceptance.
Переиспользуемые route, Workbench, server и build contracts принадлежат
`@zavx0z/storybook`. Ни один из них не владеет production semantics UI
Components либо consumer.

## Законы

1. Pathname является иерархией каталогов. Mount пакета открывается как
   `/package/`, каждый непустой префикс story route является самостоятельным
   overview (`/package/component/`, затем `/package/component/section/`), а
   только полный путь фиксирует exact detail story в pathname. Overview показывает всех
   непосредственных детей текущего уровня в существующих catalog/sections/dock
   regions; выбор ребёнка углубляет тот же pathname на один уровень. Overview
   не заменяет historical five-panel Workbench отдельной пустой страницей:
   preview, source, controls и events остаются на месте и используют
   детерминированный первый detail descendant текущего префикса. Общая typed
   declaration строит root, все префиксы и leaves из одних package-owned
   descriptors; consumer не выбирает hash/path mode или параллельную схему
   адресов.
2. Общий shell состоит из catalog, sections, preview, dock и info. Он является
   desktop-only рабочей средой, сохраняет historical five-panel geometry и
   занимает весь доступный canvas с небольшим внешним отступом; искусственный
   `maxWidth`/`maxHeight` не оставляет вокруг панелей пустую рамку.
3. Shell layout исполняет
   [`UI-COMPOSITION-001..004`](../../ARCHITECTURE.md#ui-composition-law) и
   вычисляется прямым `@layout/core/flex-css` по `LAYOUT-SLOT-001` и
   `LAYOUT-FLEX-001`. CSS-style `%`/`fr`/`grow` является способом описания той
   же системы, а не отдельным layout.
4. Generic surfaces получают readonly descriptors и callbacks. Они не содержат
   Node/Field/Socket либо product switch.
5. Consumer preview является отдельной Surface; package не копирует и не
   адаптирует её renderer.
6. Shared server helper отключает HMR, собирает browser entry по запросу и не
   владеет persistent runtime process. UI app передаёт exact page title,
   capability, readiness и structured Russian shell strings одним typed app
   manifest.
7. Storybook package не входит production bundle consumer без его прямого
   import.
8. Navigation, dock и info используют один retained root `@layout/core/surface`
   и устойчивые exact engine parents, keyed generic descriptor-ами. Изменение размера либо списка
   повторяет локальный FlexBox plan и reconciliate-ит parents; active, disabled,
   title, line и status state материализуют только изменённый owner. Transform
   выше чистого retained root сохраняет plan/materialization counters, child и
   geometry identity.
9. Retained materialization одного storybook owner атомарна, а remove и
   dispose рекурсивно очищают его subtree. Диагностика dev-пакета хранит только
   текущие bounded owner keys и накопительные counters, не создаёт второй graph
   и не становится production dependency.
10. Статический backdrop остаётся осознанно flat: у него нет изменяемого
    descriptor state, независимого transform либо пользы от partial
    materialization. Consumer preview остаётся отдельной consumer-owned Surface
    и может иметь один retained parent без переноса consumer vocabulary в shell.
11. Navigation и dock хранят один детерминированный focus среди enabled item:
    pointer, Arrow Up/Down/Left/Right и Home/End меняют одно keyed состояние,
    Enter/Space вызывают текущий route callback. Видимое перемещение focus
    материализует только прежний и новый item owner; disabled item пропускается.
12. Масштабируемый catalog строится из package-owned typed story descriptors.
    Один descriptor связывает component identity, section, variant, args,
    production render, source generator и controls; route,
    поиск, preview, dock, копируемый код и render test не получают отдельных
    расходящихся описаний.
13. Catalog и sections поддерживают большой индекс через поиск, сворачиваемые
    группы и виртуализированное отображение. Initial bundle содержит metadata
    index; story implementation загружается lazy factory только после выбора.
    Точный production import contract принадлежит package owner, а не
    storybook.
14. Preview всегда использует production UI на текущем Engine/UiRuntime. Dock
    показывает variants выбранной story. Правая панель постоянно показывает
    сгенерированный TypeScript и действие копирования; ниже неё располагаются
    controls и события, не скрывая код. В V1 только `boolean` и `select`
    являются interactive; `number`, `text`, `color` и `custom` обязаны явно
    объявлять `interactive: false` и отображаются честно disabled.
    TypeScript отображается exact production `@ui/components/code-editor` в
    `readOnly: true`: Islands Dark syntax, фиксированный line-number gutter,
    обе оси scroll и single selection с `Cmd/Ctrl+C`. Верхняя Copy action
    продолжает копировать полный source независимо от selection.
15. Все обращённые к человеку строки Workbench пишутся по-русски: навигация и
    поиск, описания preview, демонстрационные подписи, controls, events,
    состояния и статусы. Public API identifiers, import specifiers, route IDs и
    TypeScript-код сохраняют точное исходное написание; имена Blender и API
    остаются точными только там, где являются именем reference либо
    контракта, а не обычной подписью. Внешний Blender catalog используется
    только как reference при выборе собственных Elements, Components и Node UI;
    его ноды, assets и примеры не импортируются в storybook.
16. Workbench сам следует глобальной Blender composition/form law: компактные
    editor headers, row navigation, thin separators и low-radius panels вместо
    oversized pill stacks и больших rounded islands. Five-panel semantic regions
    сохраняются, но их visible chrome не является исключением из UI shape law.
    Palette/material states следуют adopted 5.2 mapping. HTML shell один раз
    объявляет Engine-owned default font URL; package pages и stories не передают
    его в `UiRuntime`, а custom runtime font полностью обходит default request.
17. Preview выбирает available size, позволяющий equal-scale сравнение control с
    local Blender reference. Он не растягивает input на большую часть desktop
    только ради заполнения центральной панели; свободное место остаётся рабочей
    областью editor, а не причиной менять форму control.
18. Workbench различает outer editor region border и focus outline, а panel
    header/body получают отдельные raw ThemeSpace roles даже при совпадающих
    default bytes. Keyboard focus не заменяет route selection или disclosure;
    accordion header/body не схлопываются в один локальный fill alias.
19. Source box использует общий scrollable `Pane`, а не обрезает массив строк.
    При переполнении по соответствующей оси появляются независимые vertical и
    horizontal scrollbar; wheel axis-lock, track click и thumb drag принадлежат
    общему `div` scroll primitive. Source update сохраняет допустимую позицию и
    клампит её к новым bounds, а title, copy, tabs и detail owners не
    материализуются из-за прокрутки кода.
20. Канонический адрес package overview и любого prefix overview оканчивается
    `/`, а exact detail leaf — нет. Входной адрес в противоположной форме может
    быть только совместимым redirect на канонический адрес. Неизвестный suffix
    не выбирает случайный fallback story: server и browser tooling отклоняют
    его fail-closed.
21. Семейство UI запускается одним package-named Bun process на одном
    automatic origin. Главная `/` перечисляет только принадлежащие UI
    `@ui/elements`, `@ui/components` и `@ui/hud` и объясняет ответственность
    владельца каждой dev-страницы. Shared package документирует себя в
    собственном Storybook и не изображается UI package. Mounts —
    соответственно `/elements/`, `/components/` и `/hud/`; отдельные
    package-серверы и порты не являются вторым способом запуска.
22. Один browser target этого origin переходит между package mounts. Каждая
    страница остаётся отдельным browser bundle и загружает только свой
    production graph; DOM page не получает WebGPU runtime, а WebGPU page создаёт
    ровно один `UiRuntime`. Глобальный `$storybook` владеет exact
    `@ui/storybook` process и target, а UI package page выбирается exact route.
23. Каждая вложенная package, prefix-overview и detail page имеет общий
    видимый DOM-control `Главная`, ведущий на `/` текущего storybook origin. Он
    принадлежит server shell, находится поверх DOM/SVG/WebGPU page и не требует
    consumer renderer либо ручного изменения адресной строки. На самой главной
    `/` этот control отсутствует.
24. Static build материализует те же четыре page shells под public base `/ui/`,
    сохраняет отдельные browser graphs и lazy chunks, публикует `.nojekyll`,
    schema-version-1 manifest и fail-closed deep-link recovery. Manifest
    фиксирует source/dependency revisions и dirty state, page routes,
    capabilities/readiness, entry/chunks и SHA-256 emitted assets без local
    realpaths. Восстановление прямого detail URL
    происходит до чтения route package entry. Build копирует один точный Engine
    font asset в общий `/ui/fonts/`, а каждый shell только объявляет этот URL
    через inert meta без preload.
    Cold Pages workflow получает shared `@zavx0z/storybook` из точной immutable
    revision, проверяет его frozen install и регистрирует через `bun link` до
    frozen Layout/UI install/check, сохраняя отдельные exact pins Engine, Layout
    и Highlighter.
25. UI-owned reference catalog загружается отдельным lazy chunk. Shared V1
    предоставляет только immutable schema, validation и comparison planner; он
    не объявляет неисполняемый story-reference lifecycle. Descriptor хранит provenance,
    SHA-256, viewport/DPR, `compatible | changed | unverified` и
    `candidate | accepted | superseded`. Capture не становится accepted без
    решения владельца.
26. Comparison layout выбирает side-by-side либо top-to-bottom по максимальному
    общему scale subject/reference. Оба кадра используют один scale; wide и tall
    controls не получают один навязанный split.
27. Каждая public Storybook page показывает ненавязчивый structured footer
    `Создано для MetaFor · переиспользуемая WebGPU-инфраструктура UI`, не
    превращая MetaFor в runtime dependency reusable UI packages. HTML string
    replacement, дублирующий brand header и badge поверх рабочей области
    отсутствуют. На DOM page footer остаётся после content и не перекрывает его.
28. Canvas page ставит общий ready marker только после того, как её owner
    запланировал первый render и дождался общей frame boundary из
    `@zavx0z/storybook/environment`. Эта browser boundary не заменяет отдельную
    non-black GPU evidence. UI browser evidence читает сохранённый последний
    кадр через public Engine renderer capture, а не полагается на непостоянный
    WebGPU canvas backing buffer. Evidence сохраняет источник capture; если
    owner bridge существует, но кадр недоступен, проверка завершается ошибкой и
    не переходит на backing buffer молча. Background browser tooling включает
    focus emulation до navigation/readiness и обязательно снимает её после
    evidence, не меняя OS focus.

## Граница private application

Private `@ui/storybook` содержит только принадлежащие UI catalog, mounts,
preview state, reference catalog, lifecycle и static build.
У package нет public exports: переиспользуемые контракты импортируются напрямую
из точных subpaths `@zavx0z/storybook/*`, а production packages их не импортируют.
