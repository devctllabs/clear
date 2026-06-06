import { act, screen, waitFor, within } from '@testing-library/react'
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

describe('TrashPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the trash skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingTrash =
      createDeferred<Awaited<ReturnType<typeof baseServices.trash.list>>>()
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        list: () => pendingTrash.promise,
      },
    }

    renderRoute('/menu/trash', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Trash' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading trash' })).not.toBeInTheDocument()
    expect(screen.queryByText('1 item')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading trash' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading trash' })).toBeInTheDocument()
  })

  it('renders the trash skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingTrash =
      createDeferred<Awaited<ReturnType<typeof baseServices.trash.list>>>()
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        list: () => pendingTrash.promise,
      },
    }

    renderRoute('/menu/trash', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading trash' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Trash' }).closest('div.mx-auto')).toHaveClass(
      'max-w-page-narrow',
    )
    expect(screen.getByRole('link', { name: 'Trash' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('renders trash without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const trashResult = await baseServices.trash.list()
    const pendingTrash =
      createDeferred<Awaited<ReturnType<typeof baseServices.trash.list>>>()
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        list: () => pendingTrash.promise,
      },
    }

    renderRoute('/menu/trash', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading trash' })).not.toBeInTheDocument()

    await act(async () => {
      pendingTrash.resolve(trashResult)
      await pendingTrash.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('1 item')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading trash' })).not.toBeInTheDocument()
  })

  it('renders trash and supports empty, restore, and delete actions', async () => {
    const user = userEvent.setup()
    const services = createAppServices('mock')
    await services.notes.delete('industrial-revolution-causes')
    await services.notes.delete('postwar-institutions')

    renderRoute('/menu/trash', { services })

    const heading = await screen.findByRole('heading', { name: 'Trash' })
    expect(heading).toBeInTheDocument()
    expect(heading.closest('section')).toHaveClass('mb-7')
    expect(heading.closest('section')?.querySelector('[class*="min-h-[3.75rem]"]')).toBeNull()
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute('href', '/menu')
    expect(await screen.findByText('3 items')).toBeInTheDocument()
    expect(await screen.findByText('Base Rates')).toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', {
        name: 'Industrial Revolution Causes trash actions',
      }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Restore' }))
    await waitFor(() => {
      expect(screen.queryByText('Industrial Revolution Causes')).not.toBeInTheDocument()
    })
    expect(await screen.findByText('2 items')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Base Rates trash actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const deleteDialog = await screen.findByRole('dialog')
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete permanently' }))
    await waitFor(() => {
      expect(screen.queryByText('Base Rates')).not.toBeInTheDocument()
    })
    expect(await screen.findByText('1 item')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Empty' }))
    const emptyDialog = await screen.findByRole('dialog', { name: 'Empty trash?' })
    await user.click(within(emptyDialog).getByRole('button', { name: 'Empty trash' }))

    expect(await screen.findByText('Trash is empty')).toBeInTheDocument()
    expect(await screen.findByText('0 items')).toBeInTheDocument()
  })

  it('shows a stale refresh status when delete succeeds but trash refetch fails', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    await baseServices.notes.delete('industrial-revolution-causes')

    const refreshError = domainError.unexpected(
      'Trash storage is temporarily unavailable.',
    )
    let failFutureList = false
    const list = vi.fn(async () => {
      if (failFutureList) {
        return err(refreshError)
      }

      return baseServices.trash.list()
    })
    const deleteItem = vi.fn(async (itemId: string) => {
      const result = await baseServices.trash.deleteItem(itemId)

      if (result.ok) {
        failFutureList = true
      }

      return result
    })
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        deleteItem,
        list,
      },
    }

    renderRoute('/menu/trash', { services })

    expect(await screen.findByText('Base Rates')).toBeInTheDocument()
    expect(await screen.findByText('Industrial Revolution Causes')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Base Rates trash actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await user.click(await screen.findByRole('button', { name: 'Delete permanently' }))

    expect(deleteItem).toHaveBeenCalledWith('base-rates')
    expect(await screen.findByText('Trash may be out of date')).toBeInTheDocument()
    expect(screen.getByText('Trash storage is temporarily unavailable.')).toBeInTheDocument()
    expect(screen.getByText('Base Rates')).toBeInTheDocument()
    await waitFor(() => {
      expect(list.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    await user.click(screen.getByRole('button', { name: 'Dismiss status' }))
    await waitFor(() => {
      expect(screen.queryByText('Trash may be out of date')).not.toBeInTheDocument()
    })

    await user.click(
      await screen.findByRole('button', {
        name: 'Industrial Revolution Causes trash actions',
      }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await user.click(await screen.findByRole('button', { name: 'Delete permanently' }))

    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText('Trash may be out of date')).toBeInTheDocument()
  })

  it('renders in the desktop sidebar layout', async () => {
    mockMatchMedia(true)
    renderRoute('/menu/trash')

    const heading = await screen.findByRole('heading', { name: 'Trash' })
    expect(heading).toBeInTheDocument()
    expect(heading.closest('div.mx-auto')).toHaveClass('max-w-page-narrow')
    expect(await screen.findByText('1 item')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Trash' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('link', { name: 'Conflicts' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/menu/settings',
    )
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
  })

  it('shows failed restore as a floating status above bottom navigation', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        restoreItem: vi.fn(async () => err(domainError.unexpected('Restore failed.'))),
      },
    }

    renderRoute('/menu/trash', { services })

    expect(await screen.findByText('Base Rates')).toBeInTheDocument()
    await user.click(
      await screen.findByRole('button', {
        name: 'Base Rates trash actions',
      }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Restore' }))

    expect(await screen.findByText('Base Rates')).toBeInTheDocument()
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Could not restore item')
    expect(status).toHaveTextContent('Restore failed.')
    expect(status).toHaveClass('border-border')
    expect(status).toHaveClass('bg-card')
    expect(status.parentElement?.parentElement).toHaveClass(
      'bottom-[calc(7rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]',
    )
    expect(screen.getByText('Could not restore item').closest('[role="status"]')).toBe(status)
    expect(screen.getByRole('button', { name: 'Dismiss error' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Menu' })).toBeInTheDocument()
  })

  it('shows a delayed row spinner while restoring a trash item', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const pendingRestore =
      createDeferred<Awaited<ReturnType<typeof baseServices.trash.restoreItem>>>()
    const restoreItem = vi.fn(() => pendingRestore.promise)
    const services = {
      ...baseServices,
      trash: {
        ...baseServices.trash,
        restoreItem,
      },
    }

    renderRoute('/menu/trash', { services })

    await user.click(
      await screen.findByRole('button', {
        name: 'Base Rates trash actions',
      }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Restore' }))

    expect(restoreItem).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('status', { name: 'Restoring Base Rates' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: 'Restoring Base Rates' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: 'Restoring Industrial Revolution Causes' }),
    ).not.toBeInTheDocument()
  })
})
