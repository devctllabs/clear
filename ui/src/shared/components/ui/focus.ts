export const focusRingClassName =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const inputFocusRingClassName =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export type FocusSurface = 'background' | 'card' | 'muted' | 'popover'

export const cardFocusRingClassName = 'card-focus-ring focus-visible:outline-none'

export const mutedFocusRingClassName = 'muted-focus-ring focus-visible:outline-none'

export const popoverFocusRingClassName = 'popover-focus-ring focus-visible:outline-none'

export const cardInputFocusRingClassName =
  'card-input-focus-ring focus-visible:outline-none'

export const popoverInputFocusRingClassName =
  'popover-input-focus-ring focus-visible:outline-none'

export const keyboardFieldFocusClassName = 'keyboard-focus-field focus:outline-none'

export const keyboardInputFocusClassName = 'keyboard-input-focus focus:outline-none'

export const keyboardCardInputFocusClassName =
  'keyboard-card-input-focus focus:outline-none'

export const keyboardPopoverInputFocusClassName =
  'keyboard-popover-input-focus focus:outline-none'

export const keyboardEditorFocusClassName = 'keyboard-editor-focus focus:outline-none'

export const editorFieldFocusClassName = keyboardEditorFocusClassName

export const getFocusRingClassName = (surface: FocusSurface = 'background') => {
  if (surface === 'card') {
    return cardFocusRingClassName
  }

  if (surface === 'muted') {
    return mutedFocusRingClassName
  }

  if (surface === 'popover') {
    return popoverFocusRingClassName
  }

  return focusRingClassName
}
