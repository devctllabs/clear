import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('merges project radius tokens with Tailwind radius utilities', () => {
    expect(cn('rounded-lg', 'rounded-card')).toBe('rounded-card')
    expect(cn('rounded-card', 'rounded-compact')).toBe('rounded-compact')
    expect(cn('rounded-card', 'sm:rounded-panel', 'sm:rounded-card')).toBe(
      'rounded-card sm:rounded-card',
    )
  })
})
