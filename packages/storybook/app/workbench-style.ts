/**
 * UI-owned visual policy for the shared semantic Workbench.
 *
 * The shared package owns structure and addressed updates. UI owns the compact
 * editor composition, material roles and measured StatusBar presentation used
 * by its own catalog.
 */
export const uiStorybookWorkbenchCss = String.raw`
.storybook-dom-workbench {
  box-sizing: border-box;
  background: #1d1d1d;
  color: #d8d8d8;
  font-size: 11px;
  line-height: 16px;
}

.storybook-dom-workbench__body {
  box-sizing: border-box;
  gap: 4px;
  padding: 4px;
  overflow: hidden;
  background: #161616;
}

.storybook-dom-workbench__catalog,
.storybook-dom-workbench__secondary,
.storybook-dom-workbench__preview,
.storybook-dom-workbench__scenarios {
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #111111;
  border-radius: 6px;
  background: #303030;
}

.storybook-dom-workbench__catalog {
  flex: 0 0 196px;
  width: 196px;
  gap: 2px;
  padding: 4px;
}

.storybook-dom-workbench__secondary {
  flex: 0 0 152px;
  width: 152px;
  gap: 2px;
  padding: 4px;
  background: #292929;
}

.storybook-dom-workbench__center {
  gap: 4px;
  overflow: hidden;
}

.storybook-dom-workbench__preview {
  gap: 2px;
  padding: 4px;
  background: #1d1d1d;
}

.storybook-dom-workbench__preview-host {
  box-sizing: border-box;
  overflow: hidden;
}

.storybook-dom-workbench__scenarios {
  height: 28px;
  gap: 4px;
  padding: 2px 4px;
  background: #292929;
}

.storybook-dom-workbench__scenario-items {
  gap: 2px;
}

.storybook-dom-workbench__inspector-host {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 400px;
  width: 400px;
  min-height: 0;
  overflow: hidden;
}

.storybook-dom-workbench__search {
  box-sizing: border-box;
  height: 24px;
  padding: 2px 6px;
  border: 1px solid #151515;
  border-radius: 4px;
  background: #202020;
  color: #e0e0e0;
  font-size: 11px;
}

.storybook-dom-workbench__items {
  gap: 1px;
}

.storybook-dom-workbench__tree {
  gap: 0;
}

.storybook-dom-workbench__group {
  box-sizing: border-box;
  gap: 0;
  overflow: hidden;
  border: 0 solid transparent;
  border-radius: 4px;
  background: #242424;
}

.storybook-dom-workbench__group-toggle {
  box-sizing: border-box;
  height: 24px;
  min-height: 24px;
  gap: 4px;
  padding: 3px 6px;
  overflow: hidden;
  border: 1px solid #151515;
  border-radius: 2px;
  background: #292929;
  color: #d8d8d8;
  font-size: 11px;
  white-space: nowrap;
}

.storybook-dom-workbench__disclosure {
  box-sizing: border-box;
  flex: 0 0 12px;
  width: 12px;
  color: #878787;
}

.storybook-dom-workbench__group-items {
  gap: 0;
  padding: 0;
  background: #242424;
}

.storybook-dom-workbench__item {
  box-sizing: border-box;
  min-height: 24px;
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: #303030;
  color: #c8c8c8;
  font-size: 11px;
}

.storybook-dom-workbench__item--nested {
  padding: 3px 6px 3px 18px;
  border: 1px solid #242424;
  border-radius: 0;
  background: #303030;
}

.storybook-dom-workbench__item[data-active] {
  border-color: #47788f;
  background: #31566a;
  color: #f0f0f0;
}

.storybook-dom-workbench__item[disabled] {
  background: #292929;
  color: #707070;
  opacity: 0.55;
}

.storybook-dom-workbench__heading {
  box-sizing: border-box;
  min-height: 20px;
  margin: 0;
  padding: 2px 4px;
  color: #d8d8d8;
  font-size: 11px;
  line-height: 16px;
}

.storybook-dom-workbench__status {
  box-sizing: border-box;
  align-items: center;
  width: 100%;
  height: 24px;
  gap: 0;
  padding: 0 12px 0 8px;
  border-top: 2px solid #161616;
  background: #181818;
  color: #878787;
  font-size: 11px;
  line-height: 20px;
}

.storybook-dom-workbench__status-owner {
  color: #c8c8c8;
}
`.trim()
