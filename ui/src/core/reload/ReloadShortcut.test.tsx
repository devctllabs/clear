/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ReloadShortcut } from './ReloadShortcut'

describe('ReloadShortcut', () => {
  it('handles primary+r and prevents the browser reload', () => {
    const onReload = vi.fn()

    render(<ReloadShortcut onReload={onReload} />)

    const event = new KeyboardEvent('keydown', {
      cancelable: true,
      ctrlKey: true,
      key: 'r',
    })

    window.dispatchEvent(event)

    expect(onReload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })
})
