import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('WorkspaceEditPage', () => {
  it('renders the editor skeleton while the workspace is loading', async () => {
    const baseServices = createAppServices('mock')
    const workspaceResult = await baseServices.workspaces.getById('independent-study')
    const pendingWorkspace =
      createDeferred<Awaited<ReturnType<typeof baseServices.workspaces.getById>>>()
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        getById: () => pendingWorkspace.promise,
      },
    }

    renderRoute('/workspaces/independent-study/edit', { services })

    expect(await screen.findByRole('status', { name: 'Loading editor' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )

    await act(async () => {
      pendingWorkspace.resolve(workspaceResult)
      await pendingWorkspace.promise
    })
  })

  it('edits a workspace and returns to the workspace list', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces/independent-study/edit')

    expect(await screen.findByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    const name = await screen.findByLabelText('Workspace name')
    fireEvent.change(name, { target: { value: 'Editorial Archive' } })
    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()
    expect(await screen.findByText('Editorial Archive')).toBeInTheDocument()
  })
})
