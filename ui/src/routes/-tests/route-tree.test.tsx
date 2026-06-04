import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createAppServices } from '@core/services'
import { ok } from '@shared/errors'
import { renderRoute } from '@/test/renderRoute'

describe('route composition', () => {
  it('redirects / and /boot to workspaces', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()

    renderRoute('/boot')
    expect(await screen.findAllByRole('heading', { name: 'Workspaces' })).not.toHaveLength(0)
  })

  it('redirects /dashboard to the active workspace', async () => {
    renderRoute('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Independent Study' }),
    ).toBeInTheDocument()
  })

  it('renders workspace routes through the app shell', async () => {
    renderRoute('/workspaces')
    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()

    renderRoute('/workspaces/new')
    expect(
      await screen.findByRole('heading', { name: 'Create Workspace' }),
    ).toBeInTheDocument()

    renderRoute('/workspaces/independent-study/edit')
    expect(
      await screen.findByRole('heading', { name: 'Edit Workspace' }),
    ).toBeInTheDocument()
  })

  it('renders dashboard resource routes through the app shell', async () => {
    renderRoute('/dashboard/independent-study')
    expect(
      await screen.findByRole('heading', { name: 'Independent Study' }),
    ).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/folders/reading-notes')
    expect(await screen.findByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/create/folder')
    expect(await screen.findByRole('heading', { name: 'Create Folder' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/folders/reading-notes/create/deck')
    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/folders/reading-notes/edit')
    expect(await screen.findByRole('heading', { name: 'Edit Folder' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/decks/world-history')
    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/decks/world-history/edit')
    expect(await screen.findByRole('heading', { name: 'Edit Deck' })).toBeInTheDocument()
  })

  it('renders note and review routes through the app shell', async () => {
    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )
    expect(await screen.findByRole('heading', { name: 'Note Details' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic')
    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes/edit',
    )
    expect(await screen.findByRole('heading', { name: 'Edit Note' })).toBeInTheDocument()

    renderRoute('/dashboard/independent-study/decks/world-history/review')
    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument()

    const services = createAppServices('mock')
    renderRoute(
      '/dashboard/independent-study/decks/world-history/review/world-history-review/summary',
      {
        services: {
          ...services,
          review: {
            ...services.review,
            get: () =>
              Promise.resolve(
                ok({
                  completedAt: '2026-05-16T12:18:00.000Z',
                  deckId: 'world-history',
                  durationSeconds: 1080,
                  id: 'world-history-review',
                  mode: 'due',
                  plannedCount: 42,
                  reviewedCount: 24,
                  startedAt: '2026-05-16T12:00:00.000Z',
                  status: 'completed',
                  workspaceId: 'independent-study',
                }),
              ),
          },
        },
      },
    )
    expect(await screen.findByRole('heading', { name: 'Review complete' })).toBeInTheDocument()
  })

  it('renders menu routes through the app shell', async () => {
    renderRoute('/menu')
    expect(await screen.findByRole('heading', { name: 'Menu' })).toBeInTheDocument()

    renderRoute('/menu/settings')
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()

    renderRoute('/menu/trash')
    expect(await screen.findByRole('heading', { name: 'Trash' })).toBeInTheDocument()

    renderRoute('/menu/conflicts')
    expect(await screen.findByRole('heading', { name: 'Conflicts' })).toBeInTheDocument()
  })
})
