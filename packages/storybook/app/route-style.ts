import {codeEditorComponentCss} from "@ui/components/code-editor"
import {inspectorComponentCss} from "@ui/components/inspector"
import {aggregateOverviewStoryCss} from "./aggregate-overview-story.ts"
import {domInterfaceStoryCss} from "./dom-interface-story.ts"
import {elementDomStoryCss} from "./element-dom-story.ts"
import {imageDomStoryCss} from "./image-dom-story.ts"
import {popoverDomStoryCss} from "./popover-dom-story.ts"
import {productionComponentStoryCss} from "./production-component-stories.ts"

/** Complete immutable route stylesheet installed by the one persistent runtime. */
export const uiRouteStoryCss = [
  productionComponentStoryCss,
  inspectorComponentCss,
  codeEditorComponentCss,
  domInterfaceStoryCss,
  elementDomStoryCss,
  imageDomStoryCss,
  popoverDomStoryCss,
  aggregateOverviewStoryCss,
].join("\n")
