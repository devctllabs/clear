import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('FolderEditPage', () => {
  it('renders the editor skeleton while the folder is loading', async () => {
    const baseServices = createAppServices('mock')
    const folderResult = await baseServices.folders.getById('history')
    const pendingFolder =
      createDeferred<Awaited<ReturnType<typeof baseServices.folders.getById>>>()
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        getById: () => pendingFolder.promise,
      },
    }

    renderRoute('/dashboard/independent-study/folders/history/edit', { services })

    expect(await screen.findByRole('status', { name: 'Loading editor' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Edit Folder' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/history',
    )

    await act(async () => {
      pendingFolder.resolve(folderResult)
      await pendingFolder.promise
    })
  })

  it('edits a folder without showing the edited folder in its own path', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/history/edit')

    expect(await screen.findByRole('heading', { name: 'Edit Folder' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/history',
    )
    expect(await screen.findByText('Reading Notes')).toBeInTheDocument()
    expect(screen.queryByText('Reading Notes / History')).not.toBeInTheDocument()

    const name = await screen.findByLabelText('Folder name')
    fireEvent.change(name, { target: { value: 'Methods Archive' } })
    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Methods Archive' })).toBeInTheDocument()
  })

  it('validates the folder name before saving', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const update = vi.fn(baseServices.folders.update)
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        update,
      },
    }

    renderRoute('/dashboard/independent-study/folders/history/edit', { services })

    const name = await screen.findByLabelText('Folder name')
    fireEvent.change(name, { target: { value: '   ' } })
    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(update).not.toHaveBeenCalled()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Name is required.')
  })
})
