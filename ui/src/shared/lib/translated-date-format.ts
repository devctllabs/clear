import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { normalizeNonNegativeInteger } from './number-format'

import type { TFunction } from 'i18next'

const dayMs = 24 * 60 * 60 * 1000
const hourMs = 60 * 60 * 1000
const minuteMs = 60 * 1000
const weekMs = 7 * dayMs

const isValidDate = (value: Date) => !Number.isNaN(value.getTime())

const pad2 = (value: number) => value.toString().padStart(2, '0')

const formatAbsoluteDate = (timestamp: string) => {
  const parsed = new Date(timestamp)

  if (!isValidDate(parsed)) {
    return timestamp
  }

  return `${pad2(parsed.getDate())}.${pad2(parsed.getMonth() + 1)}.${parsed.getFullYear()}`
}

const getCalendarDayDifference = (left: Date, right: Date) => {
  const leftDay = new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime()
  const rightDay = new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime()

  return Math.round((leftDay - rightDay) / dayMs)
}

const formatRelativeDayCount = (
  t: TFunction,
  count: number,
  tense: 'past' | 'future',
) => {
  if (count === 1) {
    return tense === 'past'
      ? t(($) => $.dates.relative.yesterday)
      : t(($) => $.dates.relative.tomorrow)
  }

  return tense === 'past'
    ? t(($) => $.dates.relative.daysAgo, { count })
    : t(($) => $.dates.relative.inDays, { count })
}

const formatRelativeWeekCount = (
  t: TFunction,
  count: number,
  tense: 'past' | 'future',
) => {
  return tense === 'past'
    ? t(($) => $.dates.relative.weeksAgo, { count })
    : t(($) => $.dates.relative.inWeeks, { count })
}

const formatRelativeMonthCount = (
  t: TFunction,
  count: number,
  tense: 'past' | 'future',
) => {
  if (count === 1) {
    return tense === 'past'
      ? t(($) => $.dates.relative.monthAgo, { count })
      : t(($) => $.dates.relative.inMonth, { count })
  }

  return tense === 'past'
    ? t(($) => $.dates.relative.monthsAgo, { count })
    : t(($) => $.dates.relative.inMonths, { count })
}

const formatRelativeAgeValue = (t: TFunction, isoDate: string) => {
  const parsed = new Date(isoDate)

  if (!isValidDate(parsed)) {
    return t(($) => $.dates.age.unavailable)
  }

  const diffMs = Date.now() - parsed.getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / minuteMs))

  if (diffMinutes < 1) {
    return t(($) => $.dates.age.justNow)
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1
      ? t(($) => $.dates.age.minuteAgo, { count: diffMinutes })
      : t(($) => $.dates.age.minutesAgo, { count: diffMinutes })
  }

  const diffHours = Math.max(1, Math.round(diffMinutes / 60))

  if (diffHours < 24) {
    return diffHours === 1
      ? t(($) => $.dates.age.hourAgo, { count: diffHours })
      : t(($) => $.dates.age.hoursAgo, { count: diffHours })
  }

  const diffDays = Math.max(1, Math.round(diffMs / dayMs))

  if (diffDays >= 7 && diffDays % 7 === 0) {
    const weeks = diffDays / 7

    return weeks === 1
      ? t(($) => $.dates.age.weekAgo, { count: weeks })
      : t(($) => $.dates.age.weeksAgo, { count: weeks })
  }

  return diffDays === 1
    ? t(($) => $.dates.age.dayAgo, { count: diffDays })
    : t(($) => $.dates.age.daysAgo, { count: diffDays })
}

const formatUpdatedAgeValue = (t: TFunction, value: string) => {
  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    return t(($) => $.dates.age.unavailable)
  }

  const diffMs = Math.abs(Date.now() - timestamp)

  if (diffMs < minuteMs) {
    return t(($) => $.dates.relative.secondsAgoShort, {
      count: Math.max(1, Math.round(diffMs / 1000)),
    })
  }

  if (diffMs < hourMs) {
    return t(($) => $.dates.relative.minutesAgoShort, {
      count: Math.max(1, Math.round(diffMs / minuteMs)),
    })
  }

  if (diffMs < dayMs) {
    return t(($) => $.dates.relative.hoursAgoShort, {
      count: Math.max(1, Math.round(diffMs / hourMs)),
    })
  }

  if (diffMs < weekMs) {
    const days = Math.max(1, Math.round(diffMs / dayMs))

    return days === 1
      ? t(($) => $.dates.relative.dayAgo, { count: days })
      : t(($) => $.dates.relative.daysAgo, { count: days })
  }

  return formatAbsoluteDate(value)
}

export const createDateFormatters = (t: TFunction) => {
  const formatUpdatedAge = (value: string) => formatUpdatedAgeValue(t, value)
  const formatRelativeDate = (value: string) =>
    t(($) => $.dates.labels.updated, { value: formatUpdatedAge(value) })
  const formatRelativeTimestamp = (
    timestamp: string,
    mode: 'auto' | 'past' | 'future' = 'auto',
  ) => {
    const parsed = new Date(timestamp)

    if (!isValidDate(parsed)) {
      return t(($) => $.dates.absolute.unavailable)
    }

    const now = new Date()
    const diffMs = parsed.getTime() - now.getTime()
    const tense =
      mode === 'future' ? 'future' : mode === 'past' ? 'past' : diffMs >= 0 ? 'future' : 'past'
    const absDiffMs = Math.abs(diffMs)

    if (absDiffMs < minuteMs) {
      return tense === 'future'
        ? t(($) => $.dates.relative.inAMoment)
        : t(($) => $.dates.relative.justNow)
    }

    const calendarDayDifference = getCalendarDayDifference(parsed, now)

    if (calendarDayDifference === 0) {
      return t(($) => $.dates.relative.today)
    }

    const absDays = Math.abs(calendarDayDifference)

    if (absDays < 7) {
      return formatRelativeDayCount(t, absDays, tense)
    }

    const absWeeks = Math.max(1, Math.round(absDays / 7))

    if (absDays < 30) {
      return formatRelativeWeekCount(t, absWeeks, tense)
    }

    const absMonths = Math.max(1, Math.round(absDays / 30))

    return formatRelativeMonthCount(t, absMonths, tense)
  }

  return {
    formatDeletedAge(value: string) {
      return t(($) => $.dates.labels.deleted, {
        value: formatRelativeAgeValue(t, value),
      })
    },
    formatDueLabel(timestamp: string) {
      return t(($) => $.dates.labels.due, {
        value: formatRelativeTimestamp(timestamp, 'future'),
      })
    },
    formatRelativeAge(value: string) {
      return formatRelativeAgeValue(t, value)
    },
    formatRelativeDate,
    formatRelativeTimestamp,
    formatReviewedLabel(timestamp: string) {
      return t(($) => $.dates.labels.reviewed, {
        value: formatRelativeTimestamp(timestamp, 'past'),
      })
    },
    formatUpdatedAge,
    formatUpdatedChipLabel(timestamp: string) {
      return t(($) => $.dates.labels.updatedUppercase, {
        value: formatUpdatedAge(timestamp).toUpperCase(),
      })
    },
  }
}

export const useDateFormatters = () => {
  const { t } = useTranslation()

  return useMemo(() => createDateFormatters(t), [t])
}

export const formatDurationSeconds = (t: TFunction, value: number | undefined) => {
  const secondsInMinute = 60
  const minutesInHour = 60
  const seconds = normalizeNonNegativeInteger(value ?? 0)

  if (seconds < secondsInMinute) {
    return t(($) => $.review.summary.durationSeconds, {
      seconds,
    })
  }

  if (seconds < secondsInMinute * minutesInHour) {
    return t(($) => $.review.summary.durationMinutes, {
      minutes: normalizeNonNegativeInteger(seconds / secondsInMinute),
    })
  }

  const totalMinutes = normalizeNonNegativeInteger(seconds / secondsInMinute)
  const hours = Math.floor(totalMinutes / minutesInHour)
  const minutes = totalMinutes % minutesInHour

  return t(($) => $.review.summary.durationHoursMinutes, {
    hours,
    minutes,
  })
}
