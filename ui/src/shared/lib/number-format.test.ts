import { describe, expect, it } from 'vitest'

import {
  formatInteger,
  formatNonNegativeInteger,
  formatPercentage,
  normalizeNonNegativeInteger,
  normalizePercentage,
} from './number-format'

describe('formatInteger', () => {
  it('formats integers through Intl.NumberFormat', () => {
    const expected = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(1450)

    expect(formatInteger(1450)).toBe(expected)
  })

  it('falls back for non-finite integers instead of rendering broken values', () => {
    expect(formatInteger(Number.NaN)).toBe('0')
    expect(formatInteger(Number.POSITIVE_INFINITY)).toBe('0')
  })

  it('normalizes non-negative integers for user-facing counts', () => {
    expect(normalizeNonNegativeInteger(3.6)).toBe(4)
    expect(normalizeNonNegativeInteger(-3)).toBe(0)
    expect(formatNonNegativeInteger(1200.2)).toBe(
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(1200),
    )
    expect(formatNonNegativeInteger(Number.NaN)).toBe('0')
  })

  it('clamps percentages for progress displays', () => {
    expect(normalizePercentage(148)).toBe(100)
    expect(normalizePercentage(-12)).toBe(0)
    expect(normalizePercentage(Number.POSITIVE_INFINITY)).toBe(0)
    expect(formatPercentage(72.4)).toBe('72%')
  })
})
