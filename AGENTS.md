# UI agent rules

- Use `$ui-dev` from `.agents/skills/ui-dev` for UI implementation, tests and
  visual-reference semantics. External Storybook attaches
  `.storybook/manifest.json`; UI owns no Storybook process, port or package.
- Before changing behavior, read `ARCHITECTURE.md`, the affected package
  `requirements.md`, public types, implementation, and focused tests.
- `@zavx0z/dom` owns the semantic tree and standard events;
  `@zavx0z/renderer` owns cascade, layout, display and hit mechanics. UI owns
  only DOM/CSS components and assets; node-specific composition belongs to the
  Node repository. Import exact owners directly without aliases or re-exports.
- Preserve the supplied checkout, unrelated changes, linked dependency
  identity, listeners, and browser targets. Use the skill-owned background
  browser path instead of focusing desktop browser windows.
- Accessibility is not a default product priority or an independent acceptance
  gate. Preserve native HTML semantics that already follow from the chosen
  elements, but do not expand public props, add ARIA abstractions, keyboard
  behavior, stories, tests, or bundle work solely for accessibility unless
  zavx0z explicitly scopes that work.
- In `packages/components`, an exported Component remains the real readable
  TSX owner at its public path, outside `src/`; it may import package-private
  mechanics from `src/` but must not re-export or facade an owner implemented
  there. Put domain-specific internals in `src/<domain>/` and code genuinely
  reused by at least two independent owners in `src/shared/`. Never export
  `src/**`, add a `src` barrel, or let consumers import it.
- Classify data meaning, interaction mechanism and current state independently.
  Add a public owner only for its own invariants, behavior or lifecycle; naming,
  configuration, constraints, styling and state do not justify another owner.
  A concrete Field owns one interaction mechanism plus an optional label. It
  does not dispatch another Field by data kind or presentation variant.
