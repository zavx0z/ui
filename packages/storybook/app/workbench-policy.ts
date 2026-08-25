import type {StorybookResponsivePolicy} from "@zavx0z/storybook/workbench"

/** Сохраняет принятую desktop-only геометрию UI Storybook при shared layout. */
export const UI_STORYBOOK_RESPONSIVE_POLICY = Object.freeze({
  compactBelow: null,
  compactPanels: Object.freeze([]),
}) satisfies StorybookResponsivePolicy
