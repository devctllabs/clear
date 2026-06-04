import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'

describe('MenuPage', () => {
  it('renders menu sections and bottom navigation', async () => {
    renderRoute('/menu')

    expect(await screen.findByRole('heading', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.queryByText('Conflicts')).not.toBeInTheDocument()
    expect(await screen.findByText('Settings')).toBeInTheDocument()
    expect(await screen.findByText('Trash')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Settings/ })).toHaveAttribute(
      'href',
      '/menu/settings',
    )
    expect(await screen.findByRole('link', { name: /Trash/ })).toHaveAttribute(
      'href',
      '/menu/trash',
    )
    expect(await screen.findByRole('link', { name: 'Menu' })).toHaveAttribute(
      'href',
      '/menu',
    )
  })
})
