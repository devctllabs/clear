import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'

describe('WorkspaceCreatePage', () => {
  it('creates a workspace and opens its dashboard', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces/new')

    expect(await screen.findByRole('heading', { name: 'Create Workspace' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/workspaces',
    )

    fireEvent.change(await screen.findByLabelText('Workspace name'), {
      target: { value: 'Clinical Knowledge' },
    })
    fireEvent.change(await screen.findByLabelText('Workspace description'), {
      target: { value: 'Workspace for clinical study notes.' },
    })
    await user.click(await screen.findByRole('button', { name: 'Create workspace' }))

    expect(await screen.findByRole('heading', { name: 'Clinical Knowledge' })).toBeInTheDocument()
    expect(await screen.findByText('Workspace for clinical study notes.')).toBeInTheDocument()
  })

  it('validates the workspace name before creating', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const create = vi.fn(baseServices.workspaces.create)
    const services = {
      ...baseServices,
      workspaces: {
        ...baseServices.workspaces,
        create,
      },
    }

    renderRoute('/workspaces/new', { services })

    const name = await screen.findByLabelText('Workspace name')
    fireEvent.change(name, { target: { value: '   ' } })
    await user.click(await screen.findByRole('button', { name: 'Create workspace' }))

    expect(create).not.toHaveBeenCalled()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Name is required.')

    fireEvent.change(name, { target: { value: 'Recovered Workspace' } })
    expect(name).not.toHaveAttribute('aria-invalid')
    expect(name).not.toHaveAccessibleDescription('Name is required.')
  })
})
