import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { BasicNoteEditor, ClozeNoteEditor, NoteKind } from '../types/note.types'
import {
  NoteEditorForm,
  type NoteEditorValidationMessages,
} from './NoteEditorForm'

const NoteEditorFormHarness = ({
  initialActiveKind = 'basic',
  initialBasicDraft = {
    back: '',
    front: '',
  },
  initialClozeDraft = {
    body: '',
  },
  initialTitle = '',
  validationMessages,
}: {
  initialActiveKind?: NoteKind
  initialBasicDraft?: BasicNoteEditor
  initialClozeDraft?: ClozeNoteEditor
  initialTitle?: string
  validationMessages?: NoteEditorValidationMessages
}) => {
  const [activeKind, setActiveKind] = useState<NoteKind>(initialActiveKind)
  const [title, setTitle] = useState(initialTitle)
  const [basicDraft, setBasicDraft] = useState<BasicNoteEditor>(initialBasicDraft)
  const [clozeDraft, setClozeDraft] = useState<ClozeNoteEditor>(initialClozeDraft)

  return (
    <NoteEditorForm
      activeKind={activeKind}
      basicDraft={basicDraft}
      clozeDraft={clozeDraft}
      title={title}
      validationMessages={validationMessages}
      onBackChange={(back) => setBasicDraft((draft) => ({ ...draft, back }))}
      onBodyChange={(body) => setClozeDraft({ body })}
      onFrontChange={(front) => setBasicDraft((draft) => ({ ...draft, front }))}
      onKindChange={setActiveKind}
      onTitleChange={setTitle}
    />
  )
}

describe('NoteEditorForm', () => {
  it('edits basic note fields', () => {
    render(<NoteEditorFormHarness />)

    const title = screen.getByLabelText('Title')
    const front = screen.getByLabelText('Front')
    const back = screen.getByLabelText('Back')

    expect(title).toHaveAttribute('name', 'note-title')
    expect(front).toHaveAttribute('name', 'note-front')
    expect(back).toHaveAttribute('name', 'note-back')
    expect(title).toHaveAttribute('autocomplete', 'off')
    expect(title).not.toHaveClass('focus-visible:ring-2')
    expect(front).not.toHaveClass('focus-visible:ring-2')
    expect(back).not.toHaveClass('focus-visible:ring-2')
    expect(title).toHaveClass('keyboard-editor-focus')
    expect(front).toHaveClass('keyboard-editor-focus')
    expect(back).toHaveClass('keyboard-editor-focus')
    expect(title).not.toHaveClass('keyboard-focus-field')
    expect(front).not.toHaveClass('keyboard-focus-field')
    expect(back).not.toHaveClass('keyboard-focus-field')
    expect(title).toHaveClass('type-study-title')
    expect(title).not.toHaveClass('type-reading')
    expect(front).toHaveClass('type-editor-body')
    expect(back).toHaveClass('type-editor-body')
    expect(title).toHaveClass('px-1', 'py-0')
    expect(front).toHaveClass('px-1', 'py-0')
    expect(back).toHaveClass('px-1', 'py-0')
    expect(title).not.toHaveClass('p-0')
    expect(front).not.toHaveClass('p-0')
    expect(back).not.toHaveClass('p-0')

    fireEvent.change(title, {
      target: { value: 'Draft Note' },
    })
    fireEvent.change(front, {
      target: { value: 'Front **draft**' },
    })
    fireEvent.change(back, {
      target: { value: 'Back `draft`' },
    })

    expect(title).toHaveValue('Draft Note')
    expect(front).toHaveValue('Front **draft**')
    expect(back).toHaveValue('Back `draft`')
  })

  it('keeps only supported markdown toolbar actions', () => {
    render(<NoteEditorFormHarness />)

    expect(screen.getByRole('group', { name: 'Note type' })).toBeInTheDocument()
    expect(screen.getByRole('toolbar', { name: 'Markdown formatting' })).toHaveClass(
      'quiet-scrollbar',
      'overflow-x-auto',
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.queryByRole('button', { name: 'Underline' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Highlight' })).not.toBeInTheDocument()
  })

  it('opens a basic review preview and reveals the answer on demand', async () => {
    const user = userEvent.setup()
    render(
      <NoteEditorFormHarness
        initialBasicDraft={{
          back: 'Back answer',
          front: 'Front prompt',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Review' }))

    const preview = getReviewPreview()
    const previewQueries = within(preview)

    expect(previewQueries.getByText('Review')).toBeInTheDocument()
    expect(previewQueries.getByText('BASIC')).toBeInTheDocument()
    expect(previewQueries.getByText('Front prompt')).toBeInTheDocument()
    expect(preview).not.toHaveTextContent('Back answer')

    await user.click(screen.getByRole('button', { name: 'Show answer' }))

    expect(previewQueries.getByText('Back answer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show answer' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('applies bold markdown to the selected basic back text', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const back = screen.getByPlaceholderText('Enter back side') as HTMLTextAreaElement

    fireEvent.change(back, { target: { value: 'Study memory' } })
    back.focus()
    back.setSelectionRange(6, 12)
    await user.click(screen.getByRole('button', { name: 'Bold' }))

    expect(back).toHaveValue('Study **memory**')
  })

  it('renders field validation messages beside owned note fields', () => {
    render(
      <NoteEditorFormHarness
        validationMessages={{
          basicBack: ['Back is required.'],
          basicFront: ['Front is required.'],
          title: ['Title is required.'],
        }}
      />,
    )

    const title = screen.getByLabelText('Title')
    const front = screen.getByLabelText('Front')
    const back = screen.getByLabelText('Back')

    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title is required.')
    expect(front).toHaveAttribute('aria-invalid', 'true')
    expect(front).toHaveAccessibleDescription('Front is required.')
    expect(back).toHaveAttribute('aria-invalid', 'true')
    expect(back).toHaveAccessibleDescription('Back is required.')
  })

  it('applies toolbar actions to the selected basic front text when front is active', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const front = screen.getByPlaceholderText('Enter front side') as HTMLTextAreaElement
    const back = screen.getByPlaceholderText('Enter back side')

    fireEvent.change(front, { target: { value: 'Study memory' } })
    fireEvent.focus(front)
    front.setSelectionRange(6, 12)
    await user.click(screen.getByRole('button', { name: 'Bold' }))

    expect(front).toHaveValue('Study **memory**')
    expect(back).toHaveValue('')
  })

  it('returns toolbar actions to the selected basic back text after back is active', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const front = screen.getByPlaceholderText('Enter front side') as HTMLTextAreaElement
    const back = screen.getByPlaceholderText('Enter back side') as HTMLTextAreaElement

    fireEvent.change(front, { target: { value: 'Front memory' } })
    fireEvent.focus(front)
    front.setSelectionRange(6, 12)
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    fireEvent.change(back, { target: { value: 'Back memory' } })
    fireEvent.focus(back)
    back.setSelectionRange(5, 11)
    await user.click(screen.getByRole('button', { name: 'Italic' }))

    expect(front).toHaveValue('Front **memory**')
    expect(back).toHaveValue('Back *memory*')
  })

  it('applies link markdown to the selected basic back text', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const back = screen.getByPlaceholderText('Enter back side') as HTMLTextAreaElement

    fireEvent.change(back, { target: { value: 'Read docs' } })
    back.focus()
    back.setSelectionRange(5, 9)
    await user.click(screen.getByRole('button', { name: 'Link' }))

    expect(back).toHaveValue('Read [docs](https://)')
  })

  it('applies list markdown to selected basic back lines', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const back = screen.getByPlaceholderText('Enter back side') as HTMLTextAreaElement

    fireEvent.change(back, { target: { value: 'first\nsecond' } })
    back.focus()
    back.setSelectionRange(0, back.value.length)
    await user.click(screen.getByRole('button', { name: 'List' }))

    expect(back).toHaveValue('- first\n- second')
  })

  it('undoes the last toolbar edit with Command+Z', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)
    const front = screen.getByPlaceholderText('Enter front side') as HTMLTextAreaElement

    fireEvent.change(front, { target: { value: 'Study memory' } })
    fireEvent.focus(front)
    front.setSelectionRange(6, 12)
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    fireEvent.keyDown(front, { key: 'z', metaKey: true })

    expect(front).toHaveValue('Study memory')
  })

  it('leaves native textarea undo available when no toolbar undo exists', () => {
    render(<NoteEditorFormHarness />)
    const back = screen.getByPlaceholderText('Enter back side')

    expect(fireEvent.keyDown(back, { key: 'z', metaKey: true })).toBe(true)
  })

  it('switches to cloze fields and exposes cloze toolbar action', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)

    await user.click(screen.getByRole('button', { name: 'cloze' }))
    const clozeBody = screen.getByPlaceholderText(
      'Write the note body with cloze deletions…',
    )
    expect(clozeBody).not.toHaveClass('focus-visible:ring-2')
    expect(clozeBody).toHaveClass('keyboard-editor-focus')
    expect(clozeBody).not.toHaveClass('keyboard-focus-field')
    expect(clozeBody).toHaveClass('type-editor-body')
    await user.click(clozeBody)
    await user.paste('The {{c1::hippocampus}} supports memory.')

    expect(screen.getByRole('button', { name: 'Add cloze' })).toBeInTheDocument()
    expect(screen.getByText('Cloze format').closest('.flex')?.firstElementChild).toHaveClass(
      'bg-muted',
    )
    expect(clozeBody).toHaveValue('The {{c1::hippocampus}} supports memory.')
  })

  it('previews cloze cards with selectable hidden and revealed clozes', async () => {
    const user = userEvent.setup()
    render(
      <NoteEditorFormHarness
        initialActiveKind="cloze"
        initialClozeDraft={{
          body: 'The {{c1::hippocampus}} supports {{c2::memory}}.',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Review' }))

    const preview = getReviewPreview()
    const previewQueries = within(preview)

    expect(previewQueries.getByText('CLOZE')).toBeInTheDocument()
    expect(previewQueries.getByText('•••')).toHaveAttribute('data-cloze-id', 'c1')
    expect(preview).not.toHaveTextContent('hippocampus')
    expect(preview).toHaveTextContent('memory')

    await user.click(screen.getByRole('button', { name: 'c2' }))

    expect(preview).toHaveTextContent('hippocampus')
    expect(previewQueries.getByText('•••')).toHaveAttribute('data-cloze-id', 'c2')
    expect(preview).not.toHaveTextContent('memory')

    await user.click(screen.getByRole('button', { name: 'Show answer' }))

    expect(previewQueries.getByText('memory').closest('[data-cloze-state="revealed"]')).toHaveAttribute(
      'data-cloze-id',
      'c2',
    )
  })

  it('folds cloze format guidance into the empty cloze preview', async () => {
    const user = userEvent.setup()
    render(
      <NoteEditorFormHarness
        initialActiveKind="cloze"
        initialClozeDraft={{
          body: 'Plain study note without a marker.',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Review' }))

    const previewQueries = within(getReviewPreview())

    expect(previewQueries.getByText('Plain study note without a marker.')).toBeInTheDocument()
    expect(previewQueries.getByText('Cloze format')).toBeInTheDocument()
    expect(previewQueries.getByText('{{c1::...}}')).toBeInTheDocument()
  })

  it('adds the next cloze marker around selected cloze body text', async () => {
    const user = userEvent.setup()
    render(<NoteEditorFormHarness />)

    await user.click(screen.getByRole('button', { name: 'cloze' }))
    const clozeBody = screen.getByPlaceholderText(
      'Write the note body with cloze deletions…',
    ) as HTMLTextAreaElement
    fireEvent.change(clozeBody, {
      target: { value: 'The {{c1::hippocampus}} supports memory.' },
    })
    const selectionStart = clozeBody.value.indexOf('memory')
    clozeBody.focus()
    clozeBody.setSelectionRange(selectionStart, selectionStart + 'memory'.length)
    await user.click(screen.getByRole('button', { name: 'Add cloze' }))

    expect(clozeBody).toHaveValue(
      'The {{c1::hippocampus}} supports {{c2::memory}}.',
    )
  })
})

const getReviewPreview = () => {
  const preview = document.querySelector('[data-slot="note-review-preview"]')

  expect(preview).toBeInstanceOf(HTMLElement)

  return preview as HTMLElement
}
