# UI agent rules

- Use `$ui-dev` from `.agents/skills/ui-dev` for UI implementation, tests and
  visual-reference semantics. Use the single global `$storybook` for
  `@ui/storybook` lifecycle, static build, exact-route browser checks and
  profiling.
- Before changing behavior, read `ARCHITECTURE.md`, the affected package
  `requirements.md`, public types, implementation, and focused tests.
- `@zavx0z/dom` owns the semantic tree and standard events;
  `@zavx0z/renderer` owns cascade, layout, display and hit mechanics. UI owns
  only DOM/CSS components and assets; node-specific composition belongs to the
  Node repository. Import exact owners directly without aliases or re-exports.
- Preserve the supplied checkout, unrelated changes, linked dependency
  identity, listeners, and browser targets. Use the skill-owned background
  browser path instead of focusing desktop browser windows.
