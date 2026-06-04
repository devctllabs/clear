import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'

describe('active workspace navigation flows', () => {
  it('uses the selected active workspace for dashboard redirects and home navigation', async () => {
    const user = userEvent.setup()
    renderRoute('/workspaces')

    await user.click(await screen.findByRole('button', { name: 'Open Reading Archive' }))
    expect(await screen.findByRole('heading', { name: 'Reading Archive' })).toBeInTheDocument()

    renderRoute('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Reading Archive' })).toBeInTheDocument()

    renderRoute('/workspaces')
    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument()
    const homeLink = await screen.findByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/dashboard/reading-archive')

    await user.click(homeLink)

    expect(await screen.findByRole('heading', { name: 'Reading Archive' })).toBeInTheDocument()
  })
})
