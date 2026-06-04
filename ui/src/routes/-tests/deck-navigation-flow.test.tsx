import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'

describe('deck navigation flows', () => {
  it('returns to the folder that opened a nested deck', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('link', { name: 'Reference' }))
    expect(await screen.findByRole('heading', { name: 'Reference' })).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Open Statistics Basics deck' }))
    expect(
      await screen.findByRole('heading', { name: 'Statistics Basics' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('link', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Reference' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Independent Study' })).not.toBeInTheDocument()
  })
})
