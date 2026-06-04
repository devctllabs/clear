import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'

import { defaultDeckVisualIcon } from '../constants/visuals'
import { DeckEditorForm } from './DeckEditorForm'

describe('DeckEditorForm', () => {
  it('edits deck fields, location, and visual selection', async () => {
    const user = userEvent.setup()
    const onTitleChange = vi.fn()
    const onDescriptionChange = vi.fn()
    const onIconChange = vi.fn()

    const Harness = () => {
      const [title, setTitle] = useState('')
      const [description, setDescription] = useState('')
      const [icon, setIcon] = useState<VisualIconName>(defaultDeckVisualIcon)

      return (
        <DeckEditorForm
          description={description}
          icon={icon}
          locationPath={['Independent Study', 'Reading Notes', 'History']}
          title={title}
          onDescriptionChange={(nextDescription) => {
            setDescription(nextDescription)
            onDescriptionChange(nextDescription)
          }}
          onIconChange={(nextIcon) => {
            setIcon(nextIcon)
            onIconChange(nextIcon)
          }}
          onTitleChange={(nextTitle) => {
            setTitle(nextTitle)
            onTitleChange(nextTitle)
          }}
        />
      )
    }

    render(<Harness />)

    const location = screen.getByTitle('Independent Study / Reading Notes / History')

    expect(location).toHaveTextContent('... / Reading Notes / History')
    expect(location).toHaveAttribute(
      'aria-label',
      'Independent Study / Reading Notes / History',
    )
    expect(location).toHaveClass('line-clamp-2', 'text-wrap-anywhere')
    expect(location).not.toHaveClass('truncate', '[direction:rtl]')

    const name = screen.getByLabelText('Deck name')
    const descriptionInput = screen.getByLabelText('Deck description')

    expect(name).not.toHaveClass('focus-visible:ring-2')
    expect(descriptionInput).not.toHaveClass('focus-visible:ring-2')
    expect(name).toHaveClass('keyboard-editor-focus')
    expect(descriptionInput).toHaveClass('keyboard-editor-focus')
    expect(name).not.toHaveClass('keyboard-focus-field')
    expect(descriptionInput).not.toHaveClass('keyboard-focus-field')

    fireEvent.change(name, {
      target: { value: 'Neuro Draft' },
    })
    fireEvent.change(descriptionInput, {
      target: { value: 'Daily review cards' },
    })
    await user.click(screen.getByRole('button', { name: 'Lab' }))

    expect(name).toHaveValue('Neuro Draft')
    expect(descriptionInput).toHaveValue('Daily review cards')
    expect(screen.getByRole('img', { name: 'Selected Lab' })).toBeInTheDocument()
    expect(onTitleChange).toHaveBeenLastCalledWith('Neuro Draft')
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Daily review cards')
    expect(onIconChange).toHaveBeenLastCalledWith('flask-conical')
  })
})
