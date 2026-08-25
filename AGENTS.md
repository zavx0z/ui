# UI agent rules

- Use `$ui-dev` from `.agents/skills/ui-dev` for UI implementation, tests,
  lifecycle, static Pages builds, exact-route browser checks, and profiling.
- Before changing behavior, read `ARCHITECTURE.md`, the affected package
  `requirements.md`, public types, implementation, and focused tests.
- `@layout/core` owns generic runtime and layout mechanics. UI packages own
  visual primitives and components; node-specific composition belongs to the
  Node repository. Import exact owners directly without aliases or re-exports.
- Preserve the supplied checkout, unrelated changes, linked dependency
  identity, listeners, and browser targets. Use the skill-owned background
  browser path instead of focusing desktop browser windows.
