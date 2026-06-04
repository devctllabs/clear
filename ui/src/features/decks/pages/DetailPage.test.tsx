import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { ok } from '@shared/errors'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'

const appearsBefore = (left: HTMLElement, right: HTMLElement) =>
  Boolean(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING)

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('DeckDetailPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the deck skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingDeck =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.getById>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: () => pendingDeck.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading deck' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'World History' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading deck' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading deck' })).toBeInTheDocument()
  })

  it('renders the deck skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingDeck =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.getById>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: () => pendingDeck.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading deck' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(status.closest('[class*="max-w-page"]')).not.toBeNull()
    expect(status.querySelector('[class*="minmax(14rem,20rem)"]')).not.toBeNull()
    expect(status.querySelector('[class*="minmax(14rem,22rem)"]')).not.toBeNull()
    expect(status.querySelector('[class*="max-w-section"]')).not.toBeNull()

    const asideWrapper = status.querySelector('.desktop-detail-aside')

    if (!(asideWrapper instanceof HTMLElement)) {
      throw new Error('Expected the desktop skeleton aside wrapper to be rendered.')
    }

    const asidePanel = asideWrapper.firstElementChild

    if (!(asidePanel instanceof HTMLElement)) {
      throw new Error('Expected the desktop skeleton aside panel to be rendered.')
    }

    expect(asideWrapper).toHaveClass('desktop-detail-aside-first')
    expect(asidePanel).not.toHaveClass('desktop-detail-aside')
    expect(asidePanel).toHaveClass('flex', 'min-w-0', 'flex-col')
  })

  it('renders deck content without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const deckResult = await baseServices.decks.getById('world-history')
    const pendingDeck =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.getById>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: () => pendingDeck.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading deck' })).not.toBeInTheDocument()

    await act(async () => {
      pendingDeck.resolve(deckResult)
      await pendingDeck.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'World History' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading deck' })).not.toBeInTheDocument()
  })

  it('renders deck summary, notes, and hierarchy back link', async () => {
    const baseServices = createAppServices('mock')
    const deckResult = await baseServices.decks.getById('world-history')
    const deckDescription = 'High-yield review cards for daily study.'

    if (!deckResult.ok) {
      throw new Error('Expected world-history deck fixture to exist.')
    }

    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: vi.fn(async (deckId: string) =>
          deckId === 'world-history'
            ? ok({ ...deckResult.value, description: deckDescription })
            : baseServices.decks.getById(deckId),
        ),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'World History' }).closest('[class*="pb-[calc"]'),
    ).not.toBeNull()
    const createButton = await screen.findByRole('button', { name: 'Create note' })
    expect(
      screen.getByRole('heading', { name: 'World History' }).closest('section'),
    ).toContainElement(createButton)
    expect(createButton.textContent).toBe('')
    expect(createButton.closest('[class*="bottom-24"]')).toBeNull()
    expect(await screen.findByText(deckDescription)).toHaveClass('max-w-copy')
    expect(await screen.findByText('71%')).toBeInTheDocument()
    expect(await screen.findByText('9')).toBeInTheDocument()
    expect(await screen.findByText('7')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Notes' })).toBeInTheDocument()
    expect(await screen.findByText('Industrial Revolution Causes')).toBeInTheDocument()
    expect(await screen.findByText('Collective Memory')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute('href', '/dashboard/independent-study')
  })

  it('shows actionable empty state when the deck has no notes', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        listByDeck: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    const emptyState = await screen.findByRole('region', { name: 'This deck is empty' })

    expect(
      within(emptyState).getByText(
        'Add a note so this deck has material to review.',
      ),
    ).toBeInTheDocument()
    expect(within(emptyState).getByRole('button', { name: 'Basic' })).toBeInTheDocument()
    expect(within(emptyState).getByRole('button', { name: 'Cloze' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Notes' })).not.toBeInTheDocument()

    await user.click(within(emptyState).getByRole('button', { name: 'Basic' }))

    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
  })

  it('uses only empty state note actions on an empty desktop deck', async () => {
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        listByDeck: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    const emptyState = await screen.findByRole('region', { name: 'This deck is empty' })

    expect(within(emptyState).getByRole('button', { name: 'Basic' })).toBeInTheDocument()
    expect(within(emptyState).getByRole('button', { name: 'Cloze' })).toBeInTheDocument()
    const deckActions = await screen.findByRole('button', { name: 'World History actions' })
    expect(deckActions).toBeInTheDocument()
    expect(deckActions.parentElement).toHaveClass('mt-1')
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument()
  })

  it('renders desktop deck actions with the create menu', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    const deckDescription = 'High-yield review cards for daily study.'
    const baseServices = createAppServices('mock')
    const deckResult = await baseServices.decks.getById('world-history')

    if (!deckResult.ok) {
      throw new Error('Expected world-history deck fixture to exist.')
    }

    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: vi.fn(async () => ok({ ...deckResult.value, description: deckDescription })),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    const titleHeading = await screen.findByRole('heading', { name: 'World History' })

    expect(titleHeading).toBeInTheDocument()
    expect(titleHeading.closest('header')).toHaveClass('mb-4', 'pb-4')
    expect(await screen.findByText(deckDescription)).toBeInTheDocument()
    const studyNowLinks = screen.getAllByRole('link', { name: 'Study now' })
    expect(studyNowLinks).toHaveLength(1)
    const createButton = await screen.findByRole('button', { name: 'Create' })
    const deckActions = await screen.findByRole('button', { name: 'World History actions' })

    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(createButton.parentElement).toHaveClass('mt-1')
    expect(deckActions.parentElement).toBe(createButton.parentElement)
    expect(screen.queryByRole('button', { name: 'Basic' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cloze' })).not.toBeInTheDocument()

    await user.click(createButton)
    const createMenu = await screen.findByRole('menu', { name: 'New Note' })

    expect(within(createMenu).getByRole('menuitem', { name: 'Basic' })).toBeInTheDocument()
    expect(within(createMenu).getByRole('menuitem', { name: 'Cloze' })).toBeInTheDocument()
    await user.keyboard('{Escape}')

    const notesHeading = await screen.findByRole('heading', { name: 'Notes' })
    const searchInput = await screen.findByPlaceholderText('Search notes…')

    expect(searchInput.closest('[class*="max-w-section"]')).not.toBeNull()
    expect(searchInput.closest('[class*="max-w-page"]')).not.toBeNull()
    expect(notesHeading.closest('[aria-label="Deck notes search"]')).not.toBeNull()
    expect(searchInput.closest('.sticky')).toBeNull()
    expect(notesHeading.closest('.mt-8')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Notes' }).closest('[class*="max-w-section"]')).not.toBeNull()

    fireEvent.change(searchInput, {
      target: { value: 'narratives' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Search results' }).closest('[class*="max-w-section"]')).not.toBeNull()
  })

  it('opens desktop note creation from the create menu', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)

    renderRoute('/dashboard/independent-study/decks/world-history')

    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(
      within(await screen.findByRole('menu', { name: 'New Note' })).getByRole('menuitem', {
        name: 'Basic',
      }),
    )

    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
  })

  it('keeps root decks pointed back to the workspace', async () => {
    renderRoute('/dashboard/independent-study/decks/cognitive-biases')

    expect(
      await screen.findByRole('heading', { name: 'Cognitive Biases' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
  })

  it('searches deck notes and hides the notes inventory section', async () => {
    renderRoute('/dashboard/independent-study/decks/world-history')

    fireEvent.change(await screen.findByPlaceholderText('Search notes…'), {
      target: { value: 'narratives' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(await screen.findByText('Collective Memory')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sort notes' })).not.toBeInTheDocument()
  })

  it('delays note search loading and waits for search completion before showing empty results', async () => {
    const baseServices = createAppServices('mock')
    const pendingSearch =
      createDeferred<Awaited<ReturnType<typeof baseServices.contentSearch.search>>>()
    const services = {
      ...baseServices,
      contentSearch: {
        ...baseServices.contentSearch,
        search: vi.fn(() => pendingSearch.promise),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    const input = await screen.findByPlaceholderText('Search notes…')

    vi.useFakeTimers()

    fireEvent.change(input, {
      target: { value: 'unmatched' },
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()
    expect(screen.queryByText('No matching notes')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(119)
    })
    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Searching content' })).toBeInTheDocument()
    expect(screen.queryByText('No matching notes')).not.toBeInTheDocument()

    await act(async () => {
      pendingSearch.resolve(ok([]))
      await pendingSearch.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()
    expect(screen.getByText('No matching notes')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.queryByRole('heading', { name: 'Search results' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument()
    expect(screen.getByText('Industrial Revolution Causes')).toBeInTheDocument()
  })

  it('sorts notes independently with a default title order', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history')

    expect(
      appearsBefore(
        await screen.findByRole('heading', { name: 'Collective Memory' }),
        await screen.findByRole('heading', { name: 'Constitutional Crisis' }),
      ),
    ).toBe(true)

    await user.click(await screen.findByRole('button', { name: 'Sort notes' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Updated' }))
    await user.click(await screen.findByRole('button', { name: 'Sort notes' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }))

    expect(JSON.parse(window.localStorage.getItem('workspace-sort:deck-notes') ?? '{}')).toMatchObject(
      { direction: 'desc', field: 'updated' },
    )
  })

  it('keeps the current notes visible while sorted notes are refetching', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const originalListByDeck = baseServices.notes.listByDeck
    const sortedNotes =
      createDeferred<Awaited<ReturnType<typeof baseServices.notes.listByDeck>>>()
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        listByDeck: (...args: Parameters<typeof baseServices.notes.listByDeck>) => {
          const [, sort] = args

          if (sort?.field === 'updated') {
            return sortedNotes.promise
          }

          return originalListByDeck(...args)
        },
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history', { services })

    expect(await screen.findByText('Industrial Revolution Causes')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Sort notes' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Updated' }))

    expect(screen.queryByRole('status', { name: 'Loading deck' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'World History' })).toBeInTheDocument()
    expect(screen.getByText('Industrial Revolution Causes')).toBeInTheDocument()

    const sortedResult = await originalListByDeck('world-history', {
      direction: 'asc',
      field: 'updated',
    })

    await act(async () => {
      sortedNotes.resolve(sortedResult)
      await sortedNotes.promise
    })
  })

  it('opens review, note creation, and deck action flows', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history')

    await user.click(await screen.findByRole('link', { name: 'Study now' }))
    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Create note' }))
    const createMenu = await screen.findByRole('menu', { name: 'New Note' })
    await user.click(within(createMenu).getByRole('menuitem', { name: 'Basic' }))
    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
  })

  it('deletes notes and the current deck after confirmation', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history')

    await user.click(await screen.findByRole('button', { name: 'Industrial Revolution Causes actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const noteDialog = await screen.findByRole('dialog')
    await user.click(within(noteDialog).getByRole('button', { name: 'Delete note' }))
    await waitFor(() => {
      expect(screen.queryByText('Industrial Revolution Causes')).not.toBeInTheDocument()
    })

    await user.click(await screen.findByRole('button', { name: 'World History actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const deckDialog = await screen.findByRole('dialog')
    await user.click(within(deckDialog).getByRole('button', { name: 'Delete deck' }))

    expect(await screen.findByRole('heading', { name: 'Independent Study' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'World History' })).not.toBeInTheDocument()
    })
  })
})
