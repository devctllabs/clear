import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'
import { domainError, err, ok } from '@shared/errors'

const appearsBefore = (left: HTMLElement, right: HTMLElement) =>
  Boolean(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING)

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the dashboard skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingWorkspace =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.getById>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        getById: () => pendingWorkspace.promise,
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search folders, decks, and notes…')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Independent Study' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading dashboard' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders the dashboard skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingWorkspace =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.getById>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        getById: () => pendingWorkspace.promise,
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading dashboard' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
    expect(status.querySelector('[class*="max-w-section"]')).not.toBeNull()
    expect(status.querySelector('[class*="rounded-panel"]')).not.toBeNull()

    vi.useRealTimers()
  })

  it('renders content without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const originalGetById = baseServices.workspaces.getById
    const workspaceResult = await originalGetById('independent-study')
    const pendingWorkspace =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.getById>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        getById: () => pendingWorkspace.promise,
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading dashboard' })).not.toBeInTheDocument()

    await act(async () => {
      pendingWorkspace.resolve(workspaceResult)
      await pendingWorkspace.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Independent Study' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading dashboard' })).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('syncs the active workspace after the route workspace loads without surfacing sync failures', async () => {
    const baseServices = createAppServices('mock')
    const originalGetById = baseServices.workspaces.getById
    const workspaceResult = await originalGetById('independent-study')
    const pendingWorkspace =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.getById>>>()
    const getActiveId = vi.fn(async () => ok('reading-archive'))
    const setActiveId = vi.fn(async () =>
      err(domainError.unavailable('Active workspace update failed.')),
    )
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        getActiveId,
        getById: () => pendingWorkspace.promise,
        setActiveId,
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    await waitFor(() => {
      expect(getActiveId).toHaveBeenCalled()
    })
    expect(setActiveId).not.toHaveBeenCalled()

    await act(async () => {
      pendingWorkspace.resolve(workspaceResult)
      await pendingWorkspace.promise
    })

    expect(await screen.findByRole('heading', { name: 'Independent Study' })).toBeInTheDocument()
    await waitFor(() => {
      expect(setActiveId).toHaveBeenCalledWith('independent-study')
    })
    expect(screen.queryByText('Could not switch workspace')).not.toBeInTheDocument()
    expect(screen.queryByText('Active workspace update failed.')).not.toBeInTheDocument()
  })

  it('renders workspace folders, decks, and bottom navigation', async () => {
    renderRoute('/dashboard/independent-study')

    const heading = await screen.findByRole('heading', { name: 'Independent Study' })
    const headerSection = heading.closest('section')
    expect(heading).toBeInTheDocument()
    expect(heading.closest('[class*="pb-[calc"]')).not.toBeNull()
    expect(headerSection).toHaveClass('mb-4')
    expect(headerSection?.querySelector('[class*="min-h-[3.75rem]"]')).toBeNull()
    expect(
      await screen.findByText('Reading notes, review decks, and reference material for ongoing study.'),
    ).toHaveClass('max-w-copy')
    expect(await screen.findByPlaceholderText('Search folders, decks, and notes…')).toBeInTheDocument()
    const createButton = await screen.findByRole('button', { name: 'Create' })
    expect(headerSection).toContainElement(createButton)
    expect(createButton.textContent).toBe('')
    expect(createButton.closest('[class*="bottom-24"]')).toBeNull()
    expect(
      await screen.findByRole('button', { name: 'Independent Study actions' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Folders' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Decks' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Reading Notes' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )
    expect(
      await screen.findByRole('button', { name: 'Open Cognitive Biases deck' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Attention and Memory' })).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(await screen.findByRole('link', { name: 'Spaces' })).toHaveAttribute(
      'href',
      '/workspaces',
    )
    expect(await screen.findByRole('link', { name: 'Menu' })).toHaveAttribute(
      'href',
      '/menu',
    )
  })

  it('shows actionable empty state when the workspace has no content', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
      folders: {
        ...baseServices.folders,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    const emptyState = await screen.findByRole('region', { name: 'Create your first deck' })

    expect(
      within(emptyState).getByText(
        'Create a deck, then add notes to build your review queue.',
      ),
    ).toBeInTheDocument()
    const actions = within(emptyState).getAllByRole('button')
    expect(actions[0]).toHaveTextContent('New deck')
    expect(actions[1]).toHaveTextContent('New folder')
    expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Decks' })).not.toBeInTheDocument()

    await user.click(within(emptyState).getByRole('button', { name: 'New deck' }))

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
  })

  it('uses only empty state creation actions on an empty desktop workspace', async () => {
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
      folders: {
        ...baseServices.folders,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    const emptyState = await screen.findByRole('region', { name: 'Create your first deck' })

    const actions = within(emptyState).getAllByRole('button')
    expect(actions[0]).toHaveTextContent('New deck')
    expect(actions[1]).toHaveTextContent('New folder')
    expect(await screen.findAllByRole('button', { name: 'New folder' })).toHaveLength(1)
    expect(await screen.findAllByRole('button', { name: 'New deck' })).toHaveLength(1)
    expect(await screen.findByRole('button', { name: 'Independent Study actions' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument()
  })

  it('does not show workspace empty state when at least one section has content', async () => {
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    expect(await screen.findByRole('heading', { name: 'Decks' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Create your first deck' })).not.toBeInTheDocument()
  })

  it('keeps deck-only desktop content aligned with search width', async () => {
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        listWorkspaceRoot: vi.fn(async () => ok([])),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    const decksHeading = await screen.findByRole('heading', { name: 'Decks' })

    expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument()
    expect(decksHeading.closest('[class*="max-w-section"]')).not.toBeNull()
  })

  it('renders desktop shell actions instead of the mobile FAB', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    renderRoute('/dashboard/independent-study')

    expect(
      await screen.findByRole('heading', { name: 'Independent Study' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Independent Study' }).closest('[class*="max-w-page"]'),
    ).not.toBeNull()
    expect(await screen.findByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(await screen.findByRole('link', { name: 'Workspaces' })).toHaveAttribute(
      'href',
      '/workspaces',
    )
    expect(screen.queryByRole('link', { name: 'Conflicts' })).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/menu/settings',
    )
    expect(await screen.findByRole('link', { name: 'Trash' })).toHaveAttribute(
      'href',
      '/menu/trash',
    )
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
    const createButton = await screen.findByRole('button', { name: 'Create' })
    const workspaceActions = await screen.findByRole('button', {
      name: 'Independent Study actions',
    })
    expect(createButton.parentElement).toHaveClass('mt-1')
    expect(workspaceActions.parentElement).toBe(createButton.parentElement)
    expect(screen.queryByRole('button', { name: 'New deck' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New folder' })).not.toBeInTheDocument()
    await user.click(createButton)
    expect(await screen.findByText('New Item')).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Folder' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(workspaceActions)
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(await screen.findByRole('heading', { name: 'Folders' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Decks' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Folders' }).closest('[class*="max-w-section"]')).not.toBeNull()
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()

    fireEvent.change(await screen.findByPlaceholderText('Search folders, decks, and notes…'), {
      target: { value: 'neural' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Search results' }).closest('[class*="max-w-section"]')).not.toBeNull()
  })

  it('searches workspace content and hides normal sections in results mode', async () => {
    renderRoute('/dashboard/independent-study')

    fireEvent.change(await screen.findByPlaceholderText('Search folders, decks, and notes…'), {
      target: { value: 'neural' },
    })

    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(await screen.findByText('Neural Models')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sort folders' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sort decks' })).not.toBeInTheDocument()
  })

  it('delays search loading and waits for search completion before showing empty results', async () => {
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

    renderRoute('/dashboard/independent-study', { services })

    const input = await screen.findByPlaceholderText('Search folders, decks, and notes…')

    vi.useFakeTimers()

    fireEvent.change(input, {
      target: { value: 'unmatched' },
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()
    expect(screen.queryByText('No matches in this workspace')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(119)
    })
    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Searching content' })).toBeInTheDocument()
    expect(screen.queryByText('No matches in this workspace')).not.toBeInTheDocument()

    await act(async () => {
      pendingSearch.resolve(ok([]))
      await pendingSearch.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()
    expect(screen.getByText('No matches in this workspace')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.queryByRole('heading', { name: 'Search results' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Folders' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Decks' })).toBeInTheDocument()
  })

  it('sorts folders and decks independently', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await screen.findByRole('heading', { name: 'Cognitive Biases' })
    await user.click(await screen.findByRole('button', { name: 'Sort decks' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Due Today' }))
    await user.click(await screen.findByRole('button', { name: 'Sort decks' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }))

    expect(
      appearsBefore(
        screen.getByRole('heading', { name: 'World History' }),
        screen.getByRole('heading', { name: 'Cognitive Biases' }),
      ),
    ).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('workspace-sort:decks') ?? '{}')).toMatchObject(
      { direction: 'desc', field: 'dueToday' },
    )
  })

  it('keeps the current page content visible while sorted decks are refetching', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const originalListWorkspaceRoot = baseServices.decks.listWorkspaceRoot
    const sortedDecks =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.listWorkspaceRoot>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        listWorkspaceRoot: (
          ...args: Parameters<typeof baseServices.decks.listWorkspaceRoot>
        ) => {
          const [, sort] = args

          if (sort?.field === 'dueToday') {
            return sortedDecks.promise
          }

          return originalListWorkspaceRoot(...args)
        },
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    expect(
      await screen.findByRole('heading', { name: 'Cognitive Biases' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Sort decks' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Due Today' }))

    expect(screen.queryByRole('status', { name: 'Loading dashboard' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Independent Study' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cognitive Biases' })).toBeInTheDocument()

    const sortedResult = await originalListWorkspaceRoot('independent-study', {
      direction: 'asc',
      field: 'dueToday',
    })

    await act(async () => {
      sortedDecks.resolve(sortedResult)
      await sortedDecks.promise
    })
  })

  it('opens create and action menus from the dashboard', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('button', { name: 'Independent Study actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.click(await screen.findByRole('button', { name: 'Create' }))
    const createMenu = await screen.findByRole('menu', { name: 'New Item' })
    expect(within(createMenu).getByRole('menuitem', { name: 'Deck' })).toBeInTheDocument()
    expect(within(createMenu).getByRole('menuitem', { name: 'Folder' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu', { name: 'New Item' })).not.toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Reading Notes actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  it('edits and deletes the current workspace from dashboard actions', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('button', { name: 'Independent Study actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Independent Study')).toBeInTheDocument()

    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('button', { name: 'Independent Study actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Delete "Independent Study"?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete workspace' }))

    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()
  })

  it('moves dashboard folders and decks to trash after confirmation', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('button', { name: 'Reading Notes actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const folderDialog = await screen.findByRole('dialog')
    await user.click(within(folderDialog).getByRole('button', { name: 'Delete folder' }))
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Reading Notes' })).not.toBeInTheDocument()
    })

    await user.click(await screen.findByRole('button', { name: 'Cognitive Biases actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const deckDialog = await screen.findByRole('dialog')
    await user.click(within(deckDialog).getByRole('button', { name: 'Delete deck' }))
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Cognitive Biases' }),
      ).not.toBeInTheDocument()
    })
  })

  it('keeps a failed dashboard folder delete dialog open with the target visible', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        delete: vi.fn(async () => err(domainError.unexpected('Folder delete failed.'))),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    await user.click(await screen.findByRole('button', { name: 'Reading Notes actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete "Reading Notes"?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete folder' }))

    const failedDialog = await screen.findByRole('dialog', { name: 'Delete "Reading Notes"?' })
    const alert = await within(failedDialog).findByRole('alert')

    expect(failedDialog).toHaveTextContent(
      'This moves "Reading Notes" to Trash. You can restore it later.',
    )
    expect(alert).toHaveTextContent('Could not delete folder')
    expect(alert).toHaveTextContent('Folder delete failed.')
    expect(within(failedDialog).getByRole('button', { name: 'Delete folder' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Reading Notes', hidden: true })).toBeInTheDocument()
  })
})
