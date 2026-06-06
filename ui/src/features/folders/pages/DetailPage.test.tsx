import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'
import { ok } from '@shared/errors'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('FolderDetailPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the folder skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingFolder =
      createDeferred<Awaited<ReturnType<typeof baseServices.folders.getById>>>()
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        getById: () => pendingFolder.promise,
      },
    }

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading folder' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reading Notes' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading folder' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading folder' })).toBeInTheDocument()
  })

  it('renders the folder skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingFolder =
      createDeferred<Awaited<ReturnType<typeof baseServices.folders.getById>>>()
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        getById: () => pendingFolder.promise,
      },
    }

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading folder' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(status.querySelector('[class*="max-w-section"]')).not.toBeNull()
    expect(status.querySelector('[class*="rounded-panel"]')).not.toBeNull()
  })

  it('renders folder content without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const folderResult = await baseServices.folders.getById('reading-notes')
    const pendingFolder =
      createDeferred<Awaited<ReturnType<typeof baseServices.folders.getById>>>()
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        getById: () => pendingFolder.promise,
      },
    }

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading folder' })).not.toBeInTheDocument()

    await act(async () => {
      pendingFolder.resolve(folderResult)
      await pendingFolder.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading folder' })).not.toBeInTheDocument()
  })

  it('renders folder contents and navigates back one hierarchy level', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/reading-notes')

    const heading = await screen.findByRole('heading', { name: 'Reading Notes' })
    const headerSection = heading.closest('section')
    expect(heading).toBeInTheDocument()
    expect(heading.closest('[class*="pb-[calc"]')).not.toBeNull()
    expect(headerSection).toHaveClass('mb-4')
    expect(headerSection?.querySelector('[class*="min-h-[3.75rem]"]')).toBeNull()
    expect(
      await screen.findByText('Topic notes, excerpts, and outlines for active study.'),
    ).toHaveClass('max-w-copy')
    expect(await screen.findByPlaceholderText('Search folders, decks, and notes…')).toBeInTheDocument()
    const createButton = await screen.findByRole('button', { name: 'Create' })
    expect(headerSection).toContainElement(createButton)
    expect(createButton.textContent).toBe('')
    expect(createButton.closest('[class*="bottom-24"]')).toBeNull()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(await screen.findByText('History')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()

    await user.click(await screen.findByRole('link', { name: 'History' }))
    expect(await screen.findByRole('heading', { name: 'History' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )
  })

  it('shows actionable empty state when the folder has no content', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        listFolderChildren: vi.fn(async () => ok([])),
      },
      folders: {
        ...baseServices.folders,
        listFolderChildren: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    const emptyState = await screen.findByRole('region', {
      name: 'Create your first deck',
    })

    expect(
      within(emptyState).getByText(
        'Create a deck, then add notes to build a review queue.',
      ),
    ).toBeInTheDocument()
    const actions = within(emptyState).getAllByRole('button')
    expect(actions[0]).toHaveTextContent('New deck')
    expect(actions[1]).toHaveTextContent('New folder')
    expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()

    await user.click(within(emptyState).getByRole('button', { name: 'New deck' }))

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
    expect(await screen.findByText('Reading Notes')).toBeInTheDocument()
  })

  it('uses only empty state creation actions on an empty desktop folder', async () => {
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        listFolderChildren: vi.fn(async () => ok([])),
      },
      folders: {
        ...baseServices.folders,
        listFolderChildren: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    const emptyState = await screen.findByRole('region', {
      name: 'Create your first deck',
    })

    const actions = within(emptyState).getAllByRole('button')
    expect(actions[0]).toHaveTextContent('New deck')
    expect(actions[1]).toHaveTextContent('New folder')
    expect(await screen.findAllByRole('button', { name: 'New folder' })).toHaveLength(1)
    expect(await screen.findAllByRole('button', { name: 'New deck' })).toHaveLength(1)
    expect(await screen.findByRole('button', { name: 'Reading Notes actions' })).toBeInTheDocument()
  })

  it('renders desktop folder actions with the create menu', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    renderRoute('/dashboard/independent-study/folders/reading-notes')

    expect(await screen.findByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Reading Notes' }).closest('[class*="max-w-page"]'),
    ).not.toBeNull()
    const createButton = await screen.findByRole('button', { name: 'Create' })
    expect(screen.queryByRole('button', { name: 'New deck' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New folder' })).not.toBeInTheDocument()
    await user.click(createButton)
    expect(await screen.findByText('New Item')).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Folder' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(await screen.findByRole('button', { name: 'Reading Notes actions' })).toBeInTheDocument()
    expect(await screen.findByText('History')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Folders' }).closest('[class*="max-w-section"]')).not.toBeNull()
    expect(screen.queryByText('Folder')).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )

    fireEvent.change(await screen.findByPlaceholderText('Search folders, decks, and notes…'), {
      target: { value: 'neural' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Search results' }).closest('[class*="max-w-section"]')).not.toBeNull()
  })

  it('keeps a single folder deck row constrained to the scan column', async () => {
    mockMatchMedia(true)
    renderRoute('/dashboard/independent-study/folders/reference')

    const deckButton = await screen.findByRole('button', { name: 'Open Statistics Basics deck' })
    const decksHeading = await screen.findByRole('heading', { name: 'Decks' })
    const deckSection = deckButton.closest('section')
    const listSurface = deckSection?.querySelector('.overflow-hidden')

    expect(decksHeading).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument()
    expect(decksHeading.closest('[class*="max-w-section"]')).not.toBeNull()
    expect(listSurface).toHaveClass('rounded-compact')
    expect(deckSection?.querySelector('[class*="grid-cols-[repeat"]')).toBeNull()
  })

  it('searches recursively inside a folder', async () => {
    renderRoute('/dashboard/independent-study/folders/reference')

    fireEvent.change(await screen.findByPlaceholderText('Search folders, decks, and notes…'), {
      target: { value: 'sampling' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(await screen.findByText('Sampling Error')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()
  })

  it('clears empty folder search results back to folder content', async () => {
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

    renderRoute('/dashboard/independent-study/folders/reading-notes', { services })

    const input = await screen.findByPlaceholderText('Search folders, decks, and notes…')

    vi.useFakeTimers()

    fireEvent.change(input, {
      target: { value: 'unmatched' },
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.queryByText('No matches in this folder')).not.toBeInTheDocument()

    await act(async () => {
      pendingSearch.resolve(ok([]))
      await pendingSearch.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('No matches in this folder')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.queryByRole('heading', { name: 'Search results' })).not.toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()
  })

  it('opens folder-scoped creation from the inline create menu', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/reading-notes')

    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Deck' }))

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
    expect(await screen.findByText('Reading Notes')).toBeInTheDocument()
  })

  it('deletes the current folder and navigates to its parent', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/history')

    expect(await screen.findByRole('heading', { name: 'History' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'History actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete folder' }))

    expect(await screen.findByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'History' })).not.toBeInTheDocument()
  })
})
