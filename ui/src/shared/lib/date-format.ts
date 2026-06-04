const dayMs = 24 * 60 * 60 * 1000
const hourMs = 60 * 60 * 1000
const minuteMs = 60 * 1000
const weekMs = 7 * dayMs
const unavailableDateLabel = 'Date unavailable'
const unavailableRelativeAgeLabel = 'date unavailable'

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

const formatRelativeDayCount = (count: number, tense: 'past' | 'future') =>
  count === 1
    ? tense === 'past'
      ? 'Yesterday'
      : 'Tomorrow'
    : tense === 'past'
      ? `${count} days ago`
      : `In ${count} days`

const formatRelativeWeekCount = (count: number, tense: 'past' | 'future') =>
  tense === 'past' ? `${count} weeks ago` : `In ${count} weeks`

const formatRelativeMonthCount = (count: number, tense: 'past' | 'future') =>
  tense === 'past'
    ? `${count} month${count === 1 ? '' : 's'} ago`
    : `In ${count} month${count === 1 ? '' : 's'}`

export const formatRelativeDate = (value: string) => {
  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    return `Updated ${unavailableRelativeAgeLabel}`
  }

  const diffMs = Math.abs(Date.now() - timestamp)

  if (diffMs < minuteMs) {
    return `Updated ${Math.max(1, Math.round(diffMs / 1000))}s ago`
  }

  if (diffMs < hourMs) {
    return `Updated ${Math.max(1, Math.round(diffMs / minuteMs))}m ago`
  }

  if (diffMs < dayMs) {
    return `Updated ${Math.max(1, Math.round(diffMs / hourMs))}h ago`
  }

  if (diffMs < weekMs) {
    const days = Math.max(1, Math.round(diffMs / dayMs))

    return `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  return `Updated ${formatAbsoluteDate(value)}`
}

export const formatRelativeTimestamp = (
  timestamp: string,
  mode: 'auto' | 'past' | 'future' = 'auto',
) => {
  const parsed = new Date(timestamp)

  if (!isValidDate(parsed)) {
    return unavailableDateLabel
  }

  const now = new Date()
  const diffMs = parsed.getTime() - now.getTime()
  const tense =
    mode === 'future' ? 'future' : mode === 'past' ? 'past' : diffMs >= 0 ? 'future' : 'past'
  const absDiffMs = Math.abs(diffMs)

  if (absDiffMs < minuteMs) {
    return tense === 'future' ? 'In a moment' : 'Just now'
  }

  const calendarDayDifference = getCalendarDayDifference(parsed, now)

  if (calendarDayDifference === 0) {
    return 'Today'
  }

  const absDays = Math.abs(calendarDayDifference)

  if (absDays < 7) {
    return formatRelativeDayCount(absDays, tense)
  }

  const absWeeks = Math.max(1, Math.round(absDays / 7))

  if (absDays < 30) {
    return formatRelativeWeekCount(absWeeks, tense)
  }

  const absMonths = Math.max(1, Math.round(absDays / 30))

  return formatRelativeMonthCount(absMonths, tense)
}

export const formatReviewedLabel = (timestamp: string) =>
  `Reviewed: ${formatRelativeTimestamp(timestamp, 'past')}`

export const formatDueLabel = (timestamp: string) =>
  `Due: ${formatRelativeTimestamp(timestamp, 'future')}`

export const formatUpdatedChipLabel = (timestamp: string) =>
  `UPDATED ${formatRelativeDate(timestamp).replace('Updated ', '').toUpperCase()}`

export const formatDeletedAge = (value: string) =>
  `Deleted ${formatRelativeAge(value)}`

export const formatRelativeAge = (isoDate: string) => {
  const parsed = new Date(isoDate)

  if (!isValidDate(parsed)) {
    return unavailableRelativeAgeLabel
  }

  const diffMs = Date.now() - parsed.getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / (60 * 1000)))

  if (diffMinutes < 1) {
    return 'just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.max(1, Math.round(diffMinutes / 60))

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.max(1, Math.round(diffMs / dayMs))

  if (diffDays >= 7 && diffDays % 7 === 0) {
    const weeks = diffDays / 7

    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }

  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}
