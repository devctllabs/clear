import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { FolderEditorForm } from './FolderEditorForm'

describe('FolderEditorForm', () => {
  it('edits folder fields and renders parent location', () => {
    const onNameChange = vi.fn()
    const onDescriptionChange = vi.fn()

    const Harness = () => {
      const [name, setName] = useState('')
      const [description, setDescription] = useState('')

      return (
        <FolderEditorForm
          description={description}
          locationPath={['Workspace', 'Reading Notes', 'Clinical Drafts']}
          name={name}
          onDescriptionChange={(nextDescription) => {
            setDescription(nextDescription)
            onDescriptionChange(nextDescription)
          }}
          onNameChange={(nextName) => {
            setName(nextName)
            onNameChange(nextName)
          }}
        />
      )
    }

    render(<Harness />)

    const location = screen.getByTitle('Workspace / Reading Notes / Clinical Drafts')

    expect(location).toHaveTextContent('... / Reading Notes / Clinical Drafts')
    expect(location).toHaveAttribute('aria-label', 'Workspace / Reading Notes / Clinical Drafts')
    expect(location).toHaveClass('line-clamp-2', 'text-wrap-anywhere')
    expect(location).not.toHaveClass('truncate', '[direction:rtl]')

    const name = screen.getByLabelText('Folder name')
    const descriptionInput = screen.getByLabelText('Folder description')

    expect(name).not.toHaveClass('focus-visible:ring-2')
    expect(descriptionInput).not.toHaveClass('focus-visible:ring-2')
    expect(name).toHaveClass('keyboard-editor-focus')
    expect(descriptionInput).toHaveClass('keyboard-editor-focus')
    expect(name).not.toHaveClass('keyboard-focus-field')
    expect(descriptionInput).not.toHaveClass('keyboard-focus-field')

    fireEvent.change(name, {
      target: { value: 'Clinical Drafts' },
    })
    fireEvent.change(descriptionInput, {
      target: { value: 'Cases for review' },
    })

    expect(name).toHaveValue('Clinical Drafts')
    expect(descriptionInput).toHaveValue('Cases for review')
    expect(onNameChange).toHaveBeenLastCalledWith('Clinical Drafts')
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Cases for review')
  })
})
