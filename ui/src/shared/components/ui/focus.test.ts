import { describe, expect, it } from 'vitest'

import {
  cardFocusRingClassName,
  cardInputFocusRingClassName,
  editorFieldFocusClassName,
  keyboardEditorFocusClassName,
  keyboardFieldFocusClassName,
  keyboardPopoverInputFocusClassName,
  mutedFocusRingClassName,
  popoverFocusRingClassName,
  popoverInputFocusRingClassName,
} from './focus'

describe('focus class tokens', () => {
  it('keeps editor focus separate from the quiet field focus token', () => {
    expect(editorFieldFocusClassName).toBe(keyboardEditorFocusClassName)
    expect(editorFieldFocusClassName).toContain('keyboard-editor-focus')
    expect(editorFieldFocusClassName).not.toBe(keyboardFieldFocusClassName)
  })

  it('keeps card and popover focus tokens surface-specific', () => {
    expect(cardFocusRingClassName).toContain('card-focus-ring')
    expect(mutedFocusRingClassName).toContain('muted-focus-ring')
    expect(popoverFocusRingClassName).toContain('popover-focus-ring')
    expect(cardInputFocusRingClassName).toContain('card-input-focus-ring')
    expect(popoverInputFocusRingClassName).toContain('popover-input-focus-ring')
    expect(cardFocusRingClassName).not.toBe(popoverFocusRingClassName)
    expect(mutedFocusRingClassName).not.toBe(cardFocusRingClassName)
    expect(cardInputFocusRingClassName).not.toBe(popoverInputFocusRingClassName)
  })

  it('keeps popover search focus keyboard-gated', () => {
    expect(keyboardPopoverInputFocusClassName).toContain(
      'keyboard-popover-input-focus',
    )
    expect(keyboardPopoverInputFocusClassName).not.toContain('focus-visible:ring')
  })
})
