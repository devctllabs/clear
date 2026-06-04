import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it.each([
    [-25, '0%'],
    [148, '100%'],
    [Number.NaN, '0%'],
    [Number.POSITIVE_INFINITY, '0%'],
    [72.6, '73%'],
  ])('normalizes %s to %s', (value, expectedLabel) => {
    const { container } = render(<ProgressRing value={value} />)

    expect(screen.getByText(expectedLabel)).toBeInTheDocument()

    const progressCircle = container.querySelector('circle[stroke-dashoffset]')
    const dashOffset = progressCircle?.getAttribute('stroke-dashoffset')

    expect(dashOffset).toBeTruthy()
    expect(Number.isFinite(Number(dashOffset))).toBe(true)
  })

  it('uses the theme track token for the base circle', () => {
    const { container } = render(<ProgressRing value={0} />)

    const trackCircle = container.querySelector('circle:not([stroke-dashoffset])')

    expect(trackCircle).toHaveAttribute('stroke', 'var(--progress-ring-track, currentColor)')
  })
})
