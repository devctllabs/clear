import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'
import { ok } from '@shared/errors'

import type { Folder } from '../types/folder.types'

const appearsBefore = (left: HTMLElement, right: HTMLElement) =>
  Boolean(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING)

describe('FolderList', () => {
  it('hides folder sorting for a single folder', async () => {
    const baseServices = createAppServices('mock')
    const singleFolder: Folder = {
      description: '',
      id: 'single-folder',
      name: 'Single Folder',
      parentId: 'independent-study',
      updatedAt: '2026-04-24T12:00:00.000Z',
      workspaceId: 'independent-study',
    }
    const services = {
      ...baseServices,
      folders: {
        ...baseServices.folders,
        listWorkspaceRoot: async (workspaceId: string) =>
          ok(workspaceId === 'independent-study' ? [singleFolder] : []),
      },
    }

    renderRoute('/dashboard/independent-study', { services })

    const folderLink = await screen.findByRole('link', { name: 'Single Folder' })
    const row = folderLink.parentElement

    expect(folderLink).toBeInTheDocument()
    expect(row).toHaveClass(
      'grid',
      'max-w-full',
      'grid-cols-[auto_minmax(0,1fr)_auto]',
      'px-5',
      'py-4',
    )
    expect(folderLink).toHaveClass(
      'absolute',
      'inset-0',
      'block',
      'rounded-[1.375rem]',
      'focus-visible:ring-inset',
      'focus-visible:ring-offset-0',
    )
    expect(folderLink).not.toHaveClass('card-focus-ring')
    expect(screen.queryByRole('button', { name: 'Sort folders' })).not.toBeInTheDocument()
  })

  it('sorts folders and persists the preference', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    await user.click(await screen.findByRole('button', { name: 'Sort folders' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Name' }))
    await user.click(await screen.findByRole('button', { name: 'Sort folders' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }))

    expect(
      appearsBefore(
        await screen.findByRole('link', { name: 'Reference' }),
        await screen.findByRole('link', { name: 'Reading Notes' }),
      ),
    ).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('workspace-sort:folders') ?? '{}')).toMatchObject(
      { direction: 'desc', field: 'title' },
    )
  })

  it('opens edit flow from folder actions', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study')

    const actionTrigger = await screen.findByRole('button', { name: 'Reading Notes actions' })
    expect(actionTrigger).toHaveClass('card-focus-ring')
    await user.click(actionTrigger)
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit Folder' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
  })
})
