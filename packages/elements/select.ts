import {Color} from "@engine/core"
import {
  rgba8ToColor,
  uiTheme,
  resolveWidgetColors,
  type WidgetState,
} from "./theme-reference.ts"
import {button, type ButtonElementLayout, type ButtonElementProps, type ButtonElementState} from "./button.ts"
import {buttonHitRect, type ButtonInternalProps} from "./button-internal.ts"
import {controlChromeRect} from "./control-shape.ts"
import {flexColumn, flexRow} from "@layout/core/flex"
import {drawIconCentered} from "./icon.ts"
import {uiIcons} from "./icons.ts"
import {popover, type PopoverContext, type PopoverProps} from "./popover.ts"
import {uiShapeMetrics} from "./shape.ts"
import {backgroundColor, boxPadding, cssColor, px, textMaterial, type StyleProps, type StyleStateTable} from "./style.ts"
import {type UiSurface, Z} from "@layout/core/surface"

export type SelectElementValue = string | number

export type SelectElementOption<Value extends SelectElementValue = SelectElementValue> = Readonly<{
  value: Value
  label: string
  description?: string
  disabled?: boolean
}>

export type SelectElementContentRect = Readonly<{x: number; y: number; w: number; h: number}>

export type SelectElementTriggerContentContext<Value extends SelectElementValue = SelectElementValue> = Readonly<{
  rect: SelectElementContentRect
  value: Value | null | undefined
  label: string
  placeholder: boolean
  state: ButtonElementState
}>

export type SelectElementOptionContentContext<Value extends SelectElementValue = SelectElementValue> = Readonly<{
  rect: SelectElementContentRect
  option: SelectElementOption<Value>
  selected: boolean
  disabled: boolean
  state: Readonly<{hovered: boolean; pressed: boolean}>
}>

export type SelectElementProps<Value extends SelectElementValue = SelectElementValue> = Omit<ButtonElementProps, "children" | "style"> & {
  value?: Value | null
  placeholder?: string
  options?: readonly SelectElementOption<Value>[]
  open?: boolean
  active?: boolean
  popupLabel?: string
  style?: StyleProps
  triggerStyle?: StyleProps
  triggerStyles?: StyleStateTable<ButtonElementState>
  popupStyle?: StyleProps
  optionStyle?: StyleProps
  optionStyles?: StyleStateTable<"idle" | "hover" | "active" | "selected" | "disabled">
  chevronSrc?: string
  renderTriggerContent?(context: SelectElementTriggerContentContext<Value>): void
  renderOptionContent?(context: SelectElementOptionContentContext<Value>): void
  onChange?(value: Value): void
  onOpenChange?(open: boolean): void
}

/** Draws one dense select on the common Elements popover lifecycle. */
export function select<Value extends SelectElementValue = SelectElementValue>(
  surface: UiSurface,
  x: number,
  y: number,
  width: number,
  height: number,
  props: SelectElementProps<Value> = {},
): void {
  const key = props.key ?? `select:${x}:${y}:${width}:${height}`
  const options = props.options ?? []
  const disabled = props.disabled === true
  const selected = options.find((option) => Object.is(option.value, props.value))
  const label = props.value === undefined || props.value === null || props.value === ""
    ? props.placeholder ?? ""
    : selected?.label ?? String(props.value)
  const placeholder = props.value === undefined || props.value === null || props.value === ""
  const triggerState: ButtonElementState = disabled ? "disabled" : props.active === true ? "active" : "idle"
  const triggerStyle = selectTriggerStyle(props, triggerState)
  const chrome = controlChromeRect(x, y, width, height, triggerStyle)
  if (disabled || options.length === 0) {
    drawSelectTrigger(surface, x, y, width, height, props, key, label, placeholder, false, undefined)
    return
  }
  const popupStyle = {...selectPopupDefaultStyle(), ...props.popupStyle}
  const optionStyle = {...selectOptionDefaultStyle("idle", false), ...props.optionStyle, ...props.optionStyles?.idle}
  const border = px(popupStyle.borderWidth, uiShapeMetrics.borderWidth)
  const optionHeight = px(optionStyle.height, uiShapeMetrics.controlHeight)
  const hasPopupLabel = (props.popupLabel?.length ?? 0) > 0
  const popupHeaderHeight = hasPopupLabel ? optionHeight + border : 0
  const menuHeight = options.length * optionHeight + popupHeaderHeight + border * 2
  const popoverProps: PopoverProps = {
    key,
    ...(props.open === undefined ? {} : {open: props.open}),
    contentSize: {width: chrome.width, height: menuHeight},
    onOpenChange: (open) => props.onOpenChange?.(open),
    trigger: (context) => {
      drawSelectTrigger(surface, x, y, width, height, props, key, label, placeholder, context.open, context)
    },
    content: (rect, context) => {
      drawSelectMenu(
        surface,
        rect,
        key,
        options,
        props.value,
        props.onChange,
        context,
        hasPopupLabel ? props.popupLabel : undefined,
        props.renderOptionContent,
        popupStyle,
        props.optionStyle,
        props.optionStyles,
      )
    },
  }
  popover(surface, chrome.x, chrome.y, chrome.width, chrome.height, popoverProps)
}

function drawSelectTrigger<Value extends SelectElementValue>(
  surface: UiSurface,
  x: number,
  y: number,
  width: number,
  height: number,
  props: SelectElementProps<Value>,
  key: string,
  label: string,
  placeholder: boolean,
  open: boolean,
  context: PopoverContext | undefined,
): void {
  const disabled = props.disabled === true
  const active = props.active === true || open
  const elementProps: ButtonElementProps & ButtonInternalProps = {
    key,
    [buttonHitRect]: {x, y, width, height},
    children: (state, layout) => {
      const resolvedState = resolvedSelectState(state, props.active === true || open)
      const triggerStyle = selectTriggerStyle(props, resolvedState)
      const callerStyle = selectTriggerCallerStyle(props, resolvedState)
      drawSelectContent(
        surface,
        label,
        placeholder,
        resolvedState,
        layout,
        props.chevronSrc ?? uiIcons.chevronDown,
        props.value,
        props.renderTriggerContent,
        triggerStyle,
        callerStyle,
      )
    },
    style: selectTriggerStyle(props, disabled ? "disabled" : active ? "active" : "idle"),
    stateStyles: selectTriggerStateStyles(props, active),
  }
  if (props.disabled !== undefined) elementProps.disabled = props.disabled
  if (!disabled && (context !== undefined || props.onClick !== undefined)) {
    elementProps.onClick = () => {
      context?.toggle()
      props.onClick?.()
    }
  }
  if (props.tooltip !== undefined) elementProps.tooltip = props.tooltip
  if (props.tooltipDelayMs !== undefined) elementProps.tooltipDelayMs = props.tooltipDelayMs
  if (!disabled) {
    if (props.onPointerEnter !== undefined) elementProps.onPointerEnter = props.onPointerEnter
    if (props.onPointerLeave !== undefined) elementProps.onPointerLeave = props.onPointerLeave
    if (props.onPointerDown !== undefined) elementProps.onPointerDown = props.onPointerDown
    if (props.onPointerMove !== undefined) elementProps.onPointerMove = props.onPointerMove
    if (props.onPointerUp !== undefined) elementProps.onPointerUp = props.onPointerUp
  }
  button(surface, x, y, width, height, elementProps)
}

function resolvedSelectState(state: ButtonElementState, active: boolean | undefined): ButtonElementState {
  if (state === "disabled") return state
  return active === true && state === "idle" ? "active" : state
}

function selectWidgetState(state: ButtonElementState): WidgetState {
  return {
    hovered: state === "hover",
    pressed: state === "active",
    disabled: state === "disabled",
  }
}

function selectTriggerDefaultStyle(state: ButtonElementState): StyleProps {
  return selectColorStyle(resolveWidgetColors("menu", selectWidgetState(state)))
}

function selectTriggerStyle<Value extends SelectElementValue>(
  props: SelectElementProps<Value>,
  state: ButtonElementState,
): StyleProps {
  return {...selectTriggerDefaultStyle(state), ...selectTriggerCallerStyle(props, state)}
}

function selectTriggerCallerStyle<Value extends SelectElementValue>(
  props: SelectElementProps<Value>,
  state: ButtonElementState,
): StyleProps {
  return {...props.style, ...props.triggerStyle, ...props.triggerStyles?.[state]}
}

function selectTriggerStateStyles<Value extends SelectElementValue>(
  props: SelectElementProps<Value>,
  active: boolean,
): StyleStateTable<ButtonElementState> {
  return {
    idle: selectTriggerStyle(props, active ? "active" : "idle"),
    hover: selectTriggerStyle(props, "hover"),
    active: selectTriggerStyle(props, "active"),
    disabled: selectTriggerStyle(props, "disabled"),
  }
}

function selectColorStyle(colors: ReturnType<typeof resolveWidgetColors>): StyleProps {
  return {
    background: rgba8ToColor(colors.inner),
    borderColor: rgba8ToColor(colors.outline),
    color: rgba8ToColor(colors.text),
  }
}

function selectOptionDefaultStyle(
  state: "idle" | "hover" | "active" | "selected" | "disabled",
  selected: boolean,
): StyleProps {
  const colors = resolveWidgetColors("menuItem", {
    disabled: state === "disabled",
    hovered: state === "hover" || state === "active",
    selectedDraw: state === "selected" || selected,
  })
  return {
    borderColor: null,
    borderRadius: 0,
    borderWidth: 0,
    fontSize: uiShapeMetrics.compactFontPx,
    height: uiShapeMetrics.controlHeight,
    paddingX: uiShapeMetrics.tightGap * 2,
    zIndex: Z.ELEMENT + 0.22,
    background: rgba8ToColor(colors.inner),
    color: rgba8ToColor(colors.text),
  }
}

function selectPopupDefaultStyle(): StyleProps {
  const popup = resolveWidgetColors("menuBack")
  return {
    background: rgba8ToColor(popup.inner),
    borderColor: rgba8ToColor(popup.outline),
    borderRadius: 4,
    borderWidth: uiShapeMetrics.borderWidth,
    color: rgba8ToColor(popup.text),
    fontSize: uiShapeMetrics.compactFontPx,
    height: uiShapeMetrics.controlHeight,
    paddingX: uiShapeMetrics.tightGap * 2,
    zIndex: Z.ELEMENT + 0.2,
  }
}

function drawSelectMenu<Value extends SelectElementValue>(
  surface: UiSurface,
  rect: Readonly<{x: number; y: number; w: number; h: number}>,
  key: string,
  options: readonly SelectElementOption<Value>[],
  value: Value | null | undefined,
  onChange: ((value: Value) => void) | undefined,
  context: PopoverContext,
  popupLabel: string | undefined,
  renderOptionContent: SelectElementProps<Value>["renderOptionContent"],
  popupStyle: StyleProps,
  callerOptionStyle: StyleProps | undefined,
  callerOptionStyles: StyleStateTable<"idle" | "hover" | "active" | "selected" | "disabled"> | undefined,
): void {
  const border = px(popupStyle.borderWidth, uiShapeMetrics.borderWidth)
  const popupRadius = px(popupStyle.borderRadius, 4)
  const popupZ = popupStyle.zIndex ?? Z.ELEMENT + 0.2
  surface.drawRoundedShadow(rect.x, rect.y, rect.w, rect.h, {
    radius: popupRadius,
    blur: uiTheme.material.menuShadowWidth,
    spread: 0,
    color: new Color(0, 0, 0, 1),
    opacity: uiTheme.material.menuShadowFactor,
    z: popupZ - 0.01,
  })
  surface.drawRoundedRect(rect.x, rect.y, rect.w, rect.h, {
    radius: popupRadius,
    fill: backgroundColor(popupStyle),
    border: popupStyle.borderColor === null ? null : cssColor(popupStyle.borderColor ?? "transparent"),
    borderWidth: border,
    opacity: popupStyle.opacity ?? 1,
    z: popupZ,
  })

  const optionItems = options.map((option) => ({
    height: px(callerOptionStyle?.height, uiShapeMetrics.controlHeight),
    draw: (rowX: number, rowY: number, rowWidth: number, rowHeight: number) => {
      const rowKey = `${key}:option:${String(option.value)}`
      const state = surface.hitState(rowX, rowY, rowWidth, rowHeight, rowKey)
      const selected = Object.is(option.value, value)
      const disabled = option.disabled === true
      const optionState = disabled
        ? "disabled"
        : state.pressed
          ? "active"
          : state.hovered
            ? "hover"
            : selected
              ? "selected"
              : "idle"
      const optionStyle = {
        ...selectOptionDefaultStyle(optionState, selected),
        ...callerOptionStyle,
        ...callerOptionStyles?.[optionState],
      }
      surface.drawRoundedRect(rowX, rowY, rowWidth, rowHeight, {
        radius: px(optionStyle.borderRadius, 0),
        fill: backgroundColor(optionStyle),
        border: optionStyle.borderColor === null ? null : cssColor(optionStyle.borderColor ?? "transparent"),
        borderWidth: px(optionStyle.borderWidth, 0),
        opacity: optionStyle.opacity ?? 1,
        z: optionStyle.zIndex ?? Z.ELEMENT + 0.22,
      })
      const padding = boxPadding(optionStyle)
      const contentRect = Object.freeze({
        x: rowX + padding.left,
        y: rowY,
        w: Math.max(0, rowWidth - padding.left - padding.right),
        h: rowHeight,
      })
      if (renderOptionContent === undefined) {
        const fontPx = px(optionStyle.fontSize, uiShapeMetrics.compactFontPx)
        surface.drawText(option.label, contentRect.x, contentRect.y + (contentRect.h - fontPx) / 2, {
          fontPx,
          material: textMaterial(surface, optionStyle.color),
          maxWidthPx: Math.max(1, contentRect.w),
          z: (optionStyle.zIndex ?? Z.ELEMENT + 0.22) + 0.1,
        })
      } else {
        renderOptionContent(Object.freeze({rect: contentRect, option, selected, disabled, state: Object.freeze({...state})}))
      }
      const tooltip = option.description === undefined ? undefined : {label: option.description, delayMs: 450}
      surface.hit(rowX, rowY, rowWidth, rowHeight, () => {
        if (disabled) return
        onChange?.(option.value)
        context.close()
      }, {
        key: rowKey,
        cursor: disabled ? "default" : "pointer",
        ...(tooltip === undefined ? {} : {tooltip}),
        onPointerEnter: () => surface.requestKeyedRender(key),
        onPointerLeave: () => surface.requestKeyedRender(key),
      })
      if (option.description !== undefined) {
        surface.drawTooltipForHit(rowX, rowY, rowWidth, rowHeight, option.description, {delayMs: 450})
      }
    },
  }))
  const headerItems = popupLabel === undefined ? [] : [
    {
      height: px(popupStyle.height, uiShapeMetrics.controlHeight),
      draw: (headerX: number, headerY: number, headerWidth: number, headerHeight: number) => {
        const padding = boxPadding(popupStyle)
        const fontPx = px(popupStyle.fontSize, uiShapeMetrics.compactFontPx)
        surface.drawText(popupLabel, headerX + padding.left, headerY + (headerHeight - fontPx) / 2, {
          fontPx,
          material: textMaterial(surface, popupStyle.color),
          maxWidthPx: Math.max(1, headerWidth - padding.left - padding.right),
          z: popupZ + 0.1,
        })
      },
    },
    {
      height: border,
      draw: (separatorX: number, separatorY: number, separatorWidth: number, separatorHeight: number) => {
        const separatorColor = popupStyle.borderColor === null ? null : cssColor(popupStyle.borderColor ?? "transparent")
        if (separatorColor !== null) surface.drawRect(separatorX, separatorY, separatorWidth, separatorHeight, separatorColor, Z.ELEMENT_RULE + 0.22)
      },
    },
  ]
  flexColumn({
    x: rect.x + border,
    y: rect.y + border,
    w: Math.max(0, rect.w - border * 2),
    h: Math.max(0, rect.h - border * 2),
    gap: 0,
    items: [...headerItems, ...optionItems],
  })
}

function drawSelectContent<Value extends SelectElementValue>(
  surface: UiSurface,
  label: string,
  placeholder: boolean,
  state: ButtonElementState,
  layout: ButtonElementLayout,
  chevronSrc: string,
  value: Value | null | undefined,
  renderTriggerContent: SelectElementProps<Value>["renderTriggerContent"],
  style: StyleProps,
  callerStyle: StyleProps,
): void {
  const content = layout.content
  const colors = resolveWidgetColors("menu", selectWidgetState(state))
  const text = callerStyle.color ?? rgba8ToColor(placeholder ? resolveWidgetColors("menu", {inactive: true}).text : colors.text)
  flexRow({
    x: content.x,
    y: content.y,
    w: content.width,
    h: content.height,
    gap: layout.gap,
    alignItems: "center",
    items: [
      {width: "grow", height: content.height, draw: (x, y, width, height) => {
        const rect = Object.freeze({x, y, w: width, h: height})
        if (renderTriggerContent === undefined) {
          surface.drawText(label, x, y + (height - layout.fontPx) / 2, {
            fontPx: layout.fontPx,
            material: textMaterial(surface, text),
            maxWidthPx: Math.max(1, width),
            z: Z.TEXT,
          })
        } else {
          renderTriggerContent(Object.freeze({rect, value, label, placeholder, state}))
        }
      }},
      {width: layout.iconPx, height: layout.iconPx, draw: (x, y, width, height) => {
        drawIconCentered(surface, chevronSrc, x + width / 2, y + height / 2, layout.iconPx, {
          style: {
            color: callerStyle.color ?? rgba8ToColor(colors.item),
            opacity: style.opacity ?? 1,
            zIndex: style.zIndex === undefined ? Z.TEXT : style.zIndex + 0.1,
          },
        })
      }},
    ],
  })
}
