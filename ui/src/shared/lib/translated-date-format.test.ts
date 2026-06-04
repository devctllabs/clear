import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { createAppI18n } from '@core/i18n'

import {
  createDateFormatters,
  formatDurationSeconds,
} from './translated-date-format'

describe('translated date formatters', () => {
  const createFormatters = () => createDateFormatters(createAppI18n().t)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-04T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats labeled dates through translations', () => {
    const formatters = createFormatters()

    expect(formatters.formatDueLabel('2026-06-05T12:00:00.000Z')).toBe('Due: Tomorrow')
    expect(formatters.formatReviewedLabel('2026-06-03T12:00:00.000Z')).toBe(
      'Reviewed: Yesterday',
    )
    expect(formatters.formatRelativeDate('2026-06-04T10:00:00.000Z')).toBe('Updated 2h ago')
    expect(formatters.formatUpdatedChipLabel('2026-06-04T10:00:00.000Z')).toBe(
      'UPDATED 2H AGO',
    )
    expect(formatters.formatDeletedAge('2026-06-03T12:00:00.000Z')).toBe(
      'Deleted 1 day ago',
    )
  })

  it('formats relative timestamps for immediate, day, week, and month ranges', () => {
    const formatters = createFormatters()

    expect(formatters.formatRelativeTimestamp('not-a-date')).toBe('Date unavailable')
    expect(formatters.formatRelativeTimestamp('2026-06-04T12:00:30.000Z')).toBe(
      'In a moment',
    )
    expect(formatters.formatRelativeTimestamp('2026-06-04T11:59:30.000Z')).toBe(
      'Just now',
    )
    expect(formatters.formatRelativeTimestamp('2026-06-04T09:00:00.000Z')).toBe('Today')
    expect(formatters.formatRelativeTimestamp('2026-06-18T12:00:00.000Z')).toBe(
      'In 2 weeks',
    )
    expect(formatters.formatRelativeTimestamp('2026-07-05T12:00:00.000Z')).toBe(
      'In 1 month',
    )
  })

  it('formats relative ages with translated long labels', () => {
    const formatters = createFormatters()

    expect(formatters.formatRelativeAge('not-a-date')).toBe('date unavailable')
    expect(formatters.formatRelativeAge('2026-06-04T12:00:00.000Z')).toBe('just now')
    expect(formatters.formatRelativeAge('2026-06-04T11:58:00.000Z')).toBe('2 minutes ago')
    expect(formatters.formatRelativeAge('2026-06-04T10:00:00.000Z')).toBe('2 hours ago')
    expect(formatters.formatRelativeAge('2026-05-28T12:00:00.000Z')).toBe('1 week ago')
  })

  it('formats updated ages with compact labels and absolute fallback', () => {
    const formatters = createFormatters()

    expect(formatters.formatUpdatedAge('not-a-date')).toBe('date unavailable')
    expect(formatters.formatUpdatedAge('2026-06-04T11:59:30.000Z')).toBe('30s ago')
    expect(formatters.formatUpdatedAge('2026-06-04T11:55:00.000Z')).toBe('5m ago')
    expect(formatters.formatUpdatedAge('2026-06-04T10:00:00.000Z')).toBe('2h ago')
    expect(formatters.formatUpdatedAge('2026-06-01T12:00:00.000Z')).toBe('3 days ago')
    expect(formatters.formatUpdatedAge('2026-05-01T12:00:00.000Z')).toBe('01.05.2026')
  })

  it('formats review durations through translations', () => {
    const t = createAppI18n().t

    expect(formatDurationSeconds(t, undefined)).toBe('0s')
    expect(formatDurationSeconds(t, 42)).toBe('42s')
    expect(formatDurationSeconds(t, 65)).toBe('1m')
    expect(formatDurationSeconds(t, 3661)).toBe('1h 1m')
  })
})
