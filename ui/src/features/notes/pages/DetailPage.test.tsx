import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'
import { domainError, err } from '@shared/errors'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('NoteDetailPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the note detail skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingNote =
      createDeferred<Awaited<ReturnType<typeof baseServices.notes.getById>>>()
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        getById: () => pendingNote.promise,
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
      { services },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading note' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Note Details' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading note' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading note' })).toBeInTheDocument()
  })

  it('renders the note skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingNote =
      createDeferred<Awaited<ReturnType<typeof baseServices.notes.getById>>>()
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        getById: () => pendingNote.promise,
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
      { services },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading note' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    expect(screen.queryByRole('link', { name: 'Edit Note' })).not.toBeInTheDocument()
    expect(status.closest('[class*="max-w-page"]')).not.toBeNull()
    expect(status.querySelector('[class*="minmax(14rem,20rem)"]')).not.toBeNull()
    expect(status.querySelector('[class*="minmax(14rem,22rem)"]')).not.toBeNull()
    expect(status.querySelector('[class*="820px"]')).toBeNull()
  })

  it('renders note details without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const noteResult = await baseServices.notes.getById(
      'world-history',
      'industrial-revolution-causes',
    )
    const pendingNote =
      createDeferred<Awaited<ReturnType<typeof baseServices.notes.getById>>>()
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        getById: () => pendingNote.promise,
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
      { services },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading note' })).not.toBeInTheDocument()

    await act(async () => {
      pendingNote.resolve(noteResult)
      await pendingNote.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Note Details' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading note' })).not.toBeInTheDocument()
  })

  it('renders basic and cloze note detail screens', async () => {
    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )

    expect(await screen.findByRole('heading', { name: 'Note Details' })).toBeInTheDocument()
    expect(await screen.findByText('Industrial Revolution Causes')).toBeInTheDocument()
    expect(await screen.findByText('BASIC')).toBeInTheDocument()

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/collective-memory',
    )

    expect(await screen.findByText('Collective Memory')).toBeInTheDocument()
    expect(await screen.findByText('CLOZE')).toBeInTheDocument()
  })

  it('renders desktop note actions without the mobile bottom edit link', async () => {
    mockMatchMedia(true)
    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Industrial Revolution Causes' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('heading', { level: 1, name: 'Industrial Revolution Causes' })
        .closest('[class*="max-w-page"]'),
    ).not.toBeNull()
    const editNote = await screen.findByRole('button', { name: 'Edit Note' })
    expect(editNote).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit Note' })).not.toBeInTheDocument()
    const noteActions = await screen.findByRole('button', {
      name: 'Industrial Revolution Causes actions',
    })
    expect(noteActions).toBeInTheDocument()
    expect(editNote.parentElement).toHaveClass('mt-1')
    expect(noteActions.parentElement).toBe(editNote.parentElement)
  })

  it('moves desktop note metadata into the right panel', async () => {
    mockMatchMedia(true)
    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Industrial Revolution Causes' }),
    ).toBeInTheDocument()

    const noteContent = await screen.findByRole('region', { name: 'Note content' })

    expect(within(noteContent).queryByText('TITLE')).not.toBeInTheDocument()
    expect(within(noteContent).getByText('BASIC')).toBeInTheDocument()
    expect(within(noteContent).queryByText(/UPDATED/)).not.toBeInTheDocument()
    expect(within(noteContent).queryByText('Mastered')).not.toBeInTheDocument()
    expect(within(noteContent).getByText('FRONT')).toBeInTheDocument()
    expect(within(noteContent).getByText('BACK')).toBeInTheDocument()

    const metadata = await screen.findByRole('complementary', { name: 'Note metadata' })

    expect(
      within(metadata).getByRole('heading', { name: 'Study Progress' }),
    ).toBeInTheDocument()
    const status = within(metadata).getByText('Mastered')
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass('border-border', 'text-muted-foreground')
    expect(status).not.toHaveClass('bg-primary')
    expect(status).not.toHaveClass('text-primary-foreground')
    expect(within(metadata).getByText('74%')).toBeInTheDocument()
    expect(within(metadata).queryByText('Kind')).not.toBeInTheDocument()
    expect(within(metadata).getByText('Deck')).toBeInTheDocument()
    expect(within(metadata).getByText('World History')).toBeInTheDocument()
    expect(within(metadata).getByText('Reviewed')).toBeInTheDocument()
    expect(within(metadata).getByText('Due')).toBeInTheDocument()
    expect(within(metadata).getByText('Updated')).toBeInTheDocument()
  })

  it('keeps note details visible without deck metadata when the secondary deck lookup fails', async () => {
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: vi.fn(async () =>
          err(domainError.unavailable('Deck is temporarily unavailable.')),
        ),
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
      { services },
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Industrial Revolution Causes' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Could not refresh deck')).not.toBeInTheDocument()

    const metadata = await screen.findByRole('complementary', { name: 'Note metadata' })

    expect(within(metadata).queryByText('Deck')).not.toBeInTheDocument()
    expect(within(metadata).getByText('Updated')).toBeInTheDocument()
  })

  it('keeps derived card timing in desktop cloze content instead of the right panel', async () => {
    mockMatchMedia(true)
    renderRoute('/dashboard/independent-study/decks/world-history/notes/collective-memory')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Collective Memory' }),
    ).toBeInTheDocument()

    const noteContent = await screen.findByRole('region', { name: 'Note content' })

    expect(within(noteContent).getByText('CLOZE')).toBeInTheDocument()
    expect(within(noteContent).getByText('DERIVED CARDS')).toBeInTheDocument()
    expect(
      within(noteContent).getByRole('button', { name: 'Show derived cards note' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(within(noteContent).getAllByText(/Reviewed:/).length).toBeGreaterThan(0)
    expect(within(noteContent).getAllByText(/Due:/).length).toBeGreaterThan(0)

    const metadata = await screen.findByRole('complementary', { name: 'Note metadata' })

    expect(within(metadata).queryByText('Kind')).not.toBeInTheDocument()
    expect(
      within(metadata).queryByText('Notes are the source of truth for derived cards.'),
    ).not.toBeInTheDocument()
    expect(within(metadata).queryByText('Reviewed')).not.toBeInTheDocument()
    expect(within(metadata).queryByText('Due')).not.toBeInTheDocument()
    expect(within(metadata).getByText('Deck')).toBeInTheDocument()
    expect(within(metadata).getByText('Updated')).toBeInTheDocument()
  })

  it('renders a note load error with only the top back control', async () => {
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        getById: vi.fn(async () => err(domainError.notFound('Note not found.'))),
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/missing-note',
      { services },
    )

    expect(await screen.findByRole('heading', { name: 'Note Details' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    expect(await screen.findByText('Note could not be loaded')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Back to deck' })).not.toBeInTheDocument()
  })

  it('opens edit note from the detail action menu', async () => {
    const user = userEvent.setup()
    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )

    await user.click(await screen.findByRole('button', { name: 'Industrial Revolution Causes actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit Note' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    )
    expect(await screen.findByDisplayValue('Industrial Revolution Causes')).toBeInTheDocument()
  })

  it('keeps a failed note delete dialog open with the target visible', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        delete: vi.fn(async () => err(domainError.unexpected('Note delete failed.'))),
      },
    }

    renderRoute(
      '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
      { services },
    )

    await user.click(
      await screen.findByRole('button', { name: 'Industrial Revolution Causes actions' }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Delete "Industrial Revolution Causes"?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Delete note' }))

    const failedDialog = await screen.findByRole('dialog', {
      name: 'Delete "Industrial Revolution Causes"?',
    })
    const alert = await within(failedDialog).findByRole('alert')

    expect(failedDialog).toHaveTextContent(
      'This moves "Industrial Revolution Causes" to Trash. You can restore it later.',
    )
    expect(alert).toHaveTextContent('Could not delete note')
    expect(alert).toHaveTextContent('Note delete failed.')
    expect(within(failedDialog).getByRole('button', { name: 'Delete note' })).toBeEnabled()
    expect(screen.getByText('Industrial Revolution Causes')).toBeInTheDocument()
  })
})
