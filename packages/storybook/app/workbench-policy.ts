type UiStorybookResponsivePolicy = Readonly<{
  compactBelow: number | null
  compactPanels: readonly ("catalog" | "section" | "dock" | "info")[]
}>

/** Сохраняет принятую desktop-only геометрию UI Storybook при shared layout. */
export const UI_STORYBOOK_RESPONSIVE_POLICY = Object.freeze({
  compactBelow: null,
  compactPanels: Object.freeze([]),
}) satisfies UiStorybookResponsivePolicy
