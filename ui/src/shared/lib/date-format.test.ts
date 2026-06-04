import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  formatDeletedAge,
  formatDueLabel,
  formatRelativeAge,
  formatRelativeDate,
  formatRelativeTimestamp,
  formatReviewedLabel,
  formatUpdatedChipLabel,
} from './date-format'

describe('date-format', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-26T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats relative update dates across time buckets', () => {
    expect(formatRelativeDate('bad-date')).toBe('Updated date unavailable')
    expect(formatRelativeDate('2026-04-26T11:59:45.000Z')).toBe('Updated 15s ago')
    expect(formatRelativeDate('2026-04-26T11:35:00.000Z')).toBe('Updated 25m ago')
    expect(formatRelativeDate('2026-04-26T08:00:00.000Z')).toBe('Updated 4h ago')
    expect(formatRelativeDate('2026-04-24T12:00:00.000Z')).toBe('Updated 2 days ago')
    expect(formatRelativeDate('2026-04-01T12:00:00.000Z')).toBe('Updated 01.04.2026')
  })

  it('formats calendar timestamps for past and future contexts', () => {
    expect(formatRelativeTimestamp('not-a-date')).toBe('Date unavailable')
    expect(formatRelativeTimestamp('2026-04-26T12:00:30.000Z')).toBe('In a moment')
    expect(formatRelativeTimestamp('2026-04-26T11:59:30.000Z')).toBe('Just now')
    expect(formatRelativeTimestamp('2026-04-26T08:00:00.000Z')).toBe('Today')
    expect(formatRelativeTimestamp('2026-04-25T12:00:00.000Z')).toBe('Yesterday')
    expect(formatRelativeTimestamp('2026-04-27T12:00:00.000Z')).toBe('Tomorrow')
    expect(formatRelativeTimestamp('2026-04-12T12:00:00.000Z')).toBe('2 weeks ago')
    expect(formatRelativeTimestamp('2026-03-01T12:00:00.000Z')).toBe('2 months ago')
    expect(formatRelativeTimestamp('2026-05-30T12:00:00.000Z')).toBe('In 1 month')
  })

  it('formats review, due, chip, and deleted labels', () => {
    expect(formatReviewedLabel('2026-04-25T12:00:00.000Z')).toBe('Reviewed: Yesterday')
    expect(formatDueLabel('2026-04-27T12:00:00.000Z')).toBe('Due: Tomorrow')
    expect(formatUpdatedChipLabel('2026-04-26T11:30:00.000Z')).toBe('UPDATED 30M AGO')
    expect(formatDeletedAge('2026-04-26T12:00:00.000Z')).toBe('Deleted just now')
    expect(formatRelativeAge('2026-04-26T11:59:00.000Z')).toBe('1 minute ago')
    expect(formatRelativeAge('2026-04-26T10:00:00.000Z')).toBe('2 hours ago')
    expect(formatRelativeAge('2026-04-19T12:00:00.000Z')).toBe('1 week ago')
    expect(formatRelativeAge('2026-04-23T12:00:00.000Z')).toBe('3 days ago')
    expect(formatRelativeAge('bad-date')).toBe('date unavailable')
    expect(formatDeletedAge('bad-date')).toBe('Deleted date unavailable')
    expect(formatReviewedLabel('bad-date')).toBe('Reviewed: Date unavailable')
    expect(formatDueLabel('bad-date')).toBe('Due: Date unavailable')
    expect(formatUpdatedChipLabel('bad-date')).toBe('UPDATED DATE UNAVAILABLE')
  })
})
