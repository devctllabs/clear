import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'

describe('FolderCreatePage', () => {
  it('creates a root folder and falls back to the workspace from close', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/create/folder')

    expect(await screen.findByRole('heading', { name: 'Create Folder' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(await screen.findByText('Workspace')).toBeInTheDocument()

    fireEvent.change(await screen.findByLabelText('Folder name'), {
      target: { value: 'Clinical Drafts' },
    })
    fireEvent.change(await screen.findByLabelText('Folder description'), {
      target: { value: 'Draft folder for clinical decks.' },
    })
    await user.click(await screen.findByRole('button', { name: 'Create folder' }))

    expect(await screen.findByRole('heading', { name: 'Clinical Drafts' })).toBeInTheDocument()
    expect(await screen.findByText('Draft folder for clinical decks.')).toBeInTheDocument()
  })

  it('creates a child folder with the parent folder location', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/reading-notes/create/folder')

    expect(await screen.findByRole('heading', { name: 'Create Folder' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )
    expect(await screen.findByText('Reading Notes')).toBeInTheDocument()

    fireEvent.change(await screen.findByLabelText('Folder name'), {
      target: { value: 'Reading Queue' },
    })
    await user.click(await screen.findByRole('button', { name: 'Create folder' }))

    expect(await screen.findByRole('heading', { name: 'Reading Queue' })).toBeInTheDocument()
  })
})
