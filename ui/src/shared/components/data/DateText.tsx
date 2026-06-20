import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { useDateFormatters } from '@shared/lib/translated-date-format'

type DateTextProps = Omit<
  ComponentPropsWithoutRef<'time'>,
  'children' | 'dateTime' | 'title'
> & {
  children: ReactNode
  timestamp: string
}

export const DateText = ({ children, timestamp, ...props }: DateTextProps) => {
  const { formatAbsoluteDateTime } = useDateFormatters()
  const title = formatAbsoluteDateTime(timestamp)

  if (!title) {
    return <span {...props}>{children}</span>
  }

  return (
    <time dateTime={timestamp} title={title} {...props}>
      {children}
    </time>
  )
}
