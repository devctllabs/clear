import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DateText } from './DateText'

describe('DateText', () => {
  it('renders valid timestamps as semantic time with an absolute tooltip', () => {
    render(
      <DateText
        className="text-muted-foreground"
        data-testid="date-text"
        timestamp="2026-05-01T12:34:00"
      >
        Updated today
      </DateText>,
    )

    const dateText = screen.getByTestId('date-text')

    expect(dateText.tagName).toBe('TIME')
    expect(dateText).toHaveTextContent('Updated today')
    expect(dateText).toHaveAttribute('datetime', '2026-05-01T12:34:00')
    expect(dateText).toHaveAttribute('title', '01.05.2026 12:34')
    expect(dateText).toHaveClass('text-muted-foreground')
  })

  it('renders invalid timestamps as a plain text fallback without date metadata', () => {
    render(
      <DateText
        className="text-muted-foreground"
        data-testid="date-text"
        timestamp="not-a-date"
      >
        Updated date unavailable
      </DateText>,
    )

    const dateText = screen.getByTestId('date-text')

    expect(dateText.tagName).toBe('SPAN')
    expect(dateText).toHaveTextContent('Updated date unavailable')
    expect(dateText).not.toHaveAttribute('datetime')
    expect(dateText).not.toHaveAttribute('title')
    expect(dateText).toHaveClass('text-muted-foreground')
  })
})
