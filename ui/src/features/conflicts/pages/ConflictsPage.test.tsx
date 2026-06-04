import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'

describe('ConflictsPage', () => {
  it('renders the conflicts placeholder with menu navigation', async () => {
    renderRoute('/menu/conflicts')

    expect(await screen.findByRole('heading', { name: 'Conflicts' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute('href', '/menu')
    expect(await screen.findByText('Sync status')).toBeInTheDocument()
    expect(
      await screen.findByText('No conflicts found'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(
        'If local and synced data ever disagree, the item will appear here.',
      ),
    ).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Menu' })).toHaveAttribute(
      'href',
      '/menu',
    )
  })

  it('renders in the desktop sidebar layout', async () => {
    mockMatchMedia(true)
    renderRoute('/menu/conflicts')

    expect(await screen.findByRole('heading', { name: 'Conflicts' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Conflicts' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/menu/settings',
    )
    expect(screen.getByRole('link', { name: 'Trash' })).toHaveAttribute(
      'href',
      '/menu/trash',
    )
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
  })
})
