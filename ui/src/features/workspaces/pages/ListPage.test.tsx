import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { ok } from '@shared/errors'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('WorkspaceListPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the workspace list skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingWorkspaces =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.list>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        list: () => pendingWorkspaces.promise,
      },
    }

    renderRoute('/workspaces', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading workspaces' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Workspaces' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading workspaces' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading workspaces' })).toBeInTheDocument()
  })

  it('renders the workspace skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingWorkspaces =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.list>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        list: () => pendingWorkspaces.promise,
      },
    }

    renderRoute('/workspaces', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading workspaces' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Workspaces' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('link', { name: 'Spaces' })).not.toBeInTheDocument()
    expect(status.querySelector('.grid')).toHaveClass(
      'grid-cols-1',
      'lg:grid-cols-2',
      'xl:grid-cols-3',
    )
  })

  it('renders workspaces without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const workspacesResult = await baseServices.workspaces.list()
    const pendingWorkspaces =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.list>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        list: () => pendingWorkspaces.promise,
      },
    }

    renderRoute('/workspaces', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading workspaces' })).not.toBeInTheDocument()

    await act(async () => {
      pendingWorkspaces.resolve(workspacesResult)
      await pendingWorkspaces.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading workspaces' })).not.toBeInTheDocument()
  })

  it('renders workspaces and persists the selected active workspace', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces')

    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()
    expect(await screen.findByText('Independent Study')).toHaveClass('line-clamp-2')
    expect(await screen.findByText('Reading Archive')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open Independent Study' }).closest('.relative'),
    ).toHaveClass('rounded-compact')

    await user.click(await screen.findByRole('button', { name: 'Open Reading Archive' }))

    expect(
      await screen.findByRole('heading', { name: 'Reading Archive' }),
    ).toBeInTheDocument()
    expect(
      JSON.parse(window.localStorage.getItem('clear-ui:mock-state:v15') ?? '{}'),
    ).toMatchObject({ activeWorkspaceId: 'reading-archive' })
  })

  it('renders desktop navigation and workspace actions at the desktop breakpoint', async () => {
    mockMatchMedia(true)
    renderRoute('/workspaces')

    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Workspaces' }).closest('[class*="max-w-page"]'),
    ).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Workspaces' })).toHaveAttribute(
      'href',
      '/workspaces',
    )
    expect(screen.queryByRole('link', { name: 'Spaces' })).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'New workspace' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create New Workspace' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open Independent Study' }).closest('.relative'),
    ).toHaveClass('sm:rounded-card')
    expect(screen.getByText('Independent Study')).not.toHaveClass('line-clamp-2')
  })

  it('renders the mobile creation action in the page header', async () => {
    renderRoute('/workspaces')

    const heading = await screen.findByRole('heading', { name: 'Workspaces' })
    const createButton = await screen.findByRole('button', { name: 'New workspace' })
    const headerSection = heading.closest('section')

    expect(heading.closest('[class*="pb-[calc"]')).not.toBeNull()
    expect(headerSection).toHaveClass('mb-6')
    expect(headerSection).toContainElement(createButton)
    expect(createButton.textContent).toBe('')
    expect(createButton.closest('[class*="bottom-24"]')).toBeNull()
  })

  it('uses only the empty state creation action when there are no workspaces', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        list: vi.fn(async () =>
          ok({
            activeWorkspaceId: null,
            workspaces: [],
          }),
        ),
      },
    }

    renderRoute('/workspaces', { services })

    const emptyState = await screen.findByRole('region', { name: 'Start with a workspace' })

    expect(
      within(emptyState).getByText(
        'Separate decks, notes, and review queues by study context.',
      ),
    ).toBeInTheDocument()
    expect(
      within(emptyState).getByRole('button', { name: 'Create workspace' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New workspace' })).not.toBeInTheDocument()
    expect(screen.queryByText('Independent Study')).not.toBeInTheDocument()

    await user.click(within(emptyState).getByRole('button', { name: 'Create workspace' }))

    expect(await screen.findByRole('heading', { name: 'Create Workspace' })).toBeInTheDocument()
  })

  it('shows a delayed spinner only on the workspace being opened', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const pendingSetActive =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.setActiveId>>>()
    const setActiveId = vi.fn(() => pendingSetActive.promise)
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        setActiveId,
      },
    }

    renderRoute('/workspaces', { services })

    const researchArchiveCard = await screen.findByRole('button', {
      name: 'Open Reading Archive',
    })

    await user.click(researchArchiveCard)

    expect(setActiveId).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('status', { name: 'Opening Reading Archive' }),
    ).not.toBeInTheDocument()

    expect(
      await screen.findByRole('status', { name: 'Opening Reading Archive' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Opening Independent Study' }),
    ).not.toBeInTheDocument()

    await user.click(researchArchiveCard)
    expect(setActiveId).toHaveBeenCalledTimes(1)
  })

  it('opens create and edit workspace flows', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces')

    await user.click(await screen.findByRole('button', { name: 'New workspace' }))
    expect(
      await screen.findByRole('heading', { name: 'Create Workspace' }),
    ).toBeInTheDocument()
    expect(await screen.findByPlaceholderText('Workspace name')).toBeInTheDocument()

    renderRoute('/workspaces')
    await user.click(await screen.findByRole('button', { name: 'Reading Archive actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Reading Archive')).toBeInTheDocument()
  })

  it('confirms workspace deletion and moves it out of the list', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces')

    await user.click(await screen.findByRole('button', { name: 'Reading Archive actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Delete "Reading Archive"?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete workspace' }))

    await waitFor(() => {
      expect(screen.queryByText('Reading Archive')).not.toBeInTheDocument()
    })
  })
})
