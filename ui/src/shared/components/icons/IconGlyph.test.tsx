import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('IconGlyph', () => {
  afterEach(() => {
    vi.doUnmock('./IconGlyphDynamic')
    vi.resetModules()
  })

  it('renders curated icons synchronously', async () => {
    const { IconGlyph } = await import('./IconGlyph')

    const { container } = render(<IconGlyph name="sparkles" />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByLabelText('Loading icon')).not.toBeInTheDocument()
  })

  it('uses the loading fallback while non-curated icons load lazily', async () => {
    vi.doMock('./IconGlyphDynamic', () => new Promise(() => undefined))
    const { LazyIconGlyph } = await import('./IconGlyph')

    render(
      <span aria-label="Loading icon">
        <LazyIconGlyph name="arrow-big-right-dash" />
      </span>,
    )

    expect(
      screen.getByLabelText('Loading icon').querySelector('.loading-shimmer'),
    ).toBeInTheDocument()
  })
})
