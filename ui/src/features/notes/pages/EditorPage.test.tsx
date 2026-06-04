import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

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

describe('NoteEditorPage', () => {
  afterEach(() => {
    mockMatchMedia(false)
  })

  it('renders the note editor skeleton while the deck is loading', async () => {
    const baseServices = createAppServices('mock')
    const deckResult = await baseServices.decks.getById('world-history')
    const pendingDeck =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.getById>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: () => pendingDeck.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic', {
      services,
    })

    expect(
      await screen.findByRole('status', { name: 'Loading note editor' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )

    await act(async () => {
      pendingDeck.resolve(deckResult)
      await pendingDeck.promise
    })
  })

  it('switches note editor modes while preserving draft fields', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic')

    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    fireEvent.change(await screen.findByPlaceholderText('Add a note title'), {
      target: { value: 'Draft Note' },
    })
    fireEvent.change(await screen.findByPlaceholderText('Enter front side'), {
      target: { value: 'Front draft' },
    })

    await user.click(await screen.findByRole('button', { name: 'cloze' }))
    expect(
      await screen.findByPlaceholderText('Write the note body with cloze deletions…'),
    ).toHaveValue('Front draft')
    expect(await screen.findByDisplayValue('Draft Note')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'basic' }))
    expect(await screen.findByPlaceholderText('Enter front side')).toHaveValue('Front draft')
  })

  it('renders the note editor action in the desktop header', async () => {
    mockMatchMedia(true)
    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic')

    const heading = await screen.findByRole('heading', { name: 'New Note' })
    const saveButton = await screen.findByRole('button', { name: 'Save note' })

    expect(heading.closest('div.mx-auto')).toHaveClass('max-w-editor')
    expect(saveButton).toHaveClass('h-12')
    expect(saveButton.closest('header')).toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
    expect(await screen.findByPlaceholderText('Add a note title')).toBeInTheDocument()
  })

  it('creates, updates, and deletes notes through the routed editor flow', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic')

    fireEvent.change(await screen.findByPlaceholderText('Add a note title'), {
      target: { value: 'Operative Memory' },
    })
    fireEvent.change(await screen.findByPlaceholderText('Enter front side'), {
      target: { value: 'What is memory?' },
    })
    fireEvent.change(await screen.findByPlaceholderText('Enter back side'), {
      target: { value: 'A learned association.' },
    })
    await user.click(await screen.findByRole('button', { name: 'Save note' }))

    expect(await screen.findByRole('heading', { name: 'Note Details' })).toBeInTheDocument()
    expect(await screen.findByText('Operative Memory')).toBeInTheDocument()
    expect(await screen.findByText('What is memory?')).toBeInTheDocument()

    await user.click(await screen.findByRole('link', { name: 'Edit Note' }))
    const title = await screen.findByPlaceholderText('Add a note title')
    fireEvent.change(title, { target: { value: 'Operative Recall' } })
    await user.click(await screen.findByRole('button', { name: 'Save note' }))

    expect(await screen.findByText('Operative Recall')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Operative Recall actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete note' }))

    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Operative Recall')).not.toBeInTheDocument()
  })

  it('keeps the draft and shows a footer action error when saving fails', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        create: () => Promise.resolve(err(domainError.unavailable('Note could not be saved.'))),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic', {
      services,
    })

    fireEvent.change(await screen.findByPlaceholderText('Add a note title'), {
      target: { value: 'Draft Note' },
    })
    fireEvent.change(await screen.findByPlaceholderText('Enter front side'), {
      target: { value: 'Front draft' },
    })
    await user.click(await screen.findByRole('button', { name: 'Save note' }))

    const saveButton = await screen.findByRole('button', { name: 'Save note' })
    const alert = await screen.findByRole('alert')

    expect(saveButton.querySelector('svg')).toBeInTheDocument()
    expect(saveButton).toHaveAccessibleDescription(
      'Could not create note. The service is temporarily unavailable.',
    )
    expect(alert).toHaveTextContent('Could not create note')
    expect(alert).toHaveTextContent('The service is temporarily unavailable.')
    expect(await screen.findByDisplayValue('Draft Note')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Front draft')).toBeInTheDocument()
  })

  it('shows a delayed footer spinner while saving a note', async () => {
    const baseServices = createAppServices('mock')
    const pendingCreate =
      createDeferred<Awaited<ReturnType<typeof baseServices.notes.create>>>()
    const create = () => pendingCreate.promise
    const services = {
      ...baseServices,
      notes: {
        ...baseServices.notes,
        create,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/notes/new/basic', {
      services,
    })

    fireEvent.change(await screen.findByPlaceholderText('Add a note title'), {
      target: { value: 'Draft Note' },
    })
    fireEvent.change(await screen.findByPlaceholderText('Enter front side'), {
      target: { value: 'Front draft' },
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Save note' }))

    const saveButton = await screen.findByRole('button', { name: 'Save note' })

    expect(saveButton).toBeDisabled()
    expect(saveButton).toHaveAccessibleName('Save note')
    expect(saveButton.querySelector('[data-slot="pending-spinner"]')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(saveButton.querySelector('[data-slot="pending-spinner"]')).toBeInTheDocument()
    })
    expect(saveButton).toHaveAccessibleName('Save note')
  })
})
