import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'

import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { WorkspaceEditorForm } from './WorkspaceEditorForm'

describe('WorkspaceEditorForm', () => {
  it('edits workspace fields and visual selection', async () => {
    const user = userEvent.setup()
    const onTitleChange = vi.fn()
    const onDescriptionChange = vi.fn()
    const onIconChange = vi.fn()

    const Harness = () => {
      const [title, setTitle] = useState('')
      const [description, setDescription] = useState('')
      const [icon, setIcon] = useState<VisualIconName>(defaultWorkspaceVisualIcon)

      return (
        <WorkspaceEditorForm
          description={description}
          icon={icon}
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
    const name = screen.getByLabelText('Workspace name')
    const descriptionInput = screen.getByLabelText('Workspace description')

    expect(name).not.toHaveClass('focus-visible:ring-2')
    expect(descriptionInput).not.toHaveClass('focus-visible:ring-2')
    expect(name).toHaveClass('keyboard-editor-focus')
    expect(descriptionInput).toHaveClass('keyboard-editor-focus')
    expect(name).not.toHaveClass('keyboard-focus-field')
    expect(descriptionInput).not.toHaveClass('keyboard-focus-field')

    fireEvent.change(name, {
      target: { value: 'Clinical Knowledge' },
    })
    fireEvent.change(descriptionInput, {
      target: { value: 'Reference workspace' },
    })
    await user.click(screen.getByRole('button', { name: 'Archive' }))

    expect(name).toHaveValue('Clinical Knowledge')
    expect(descriptionInput).toHaveValue('Reference workspace')
    expect(screen.getByRole('img', { name: 'Selected Archive' })).toBeInTheDocument()
    expect(onTitleChange).toHaveBeenLastCalledWith('Clinical Knowledge')
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Reference workspace')
    expect(onIconChange).toHaveBeenLastCalledWith('archive')
  })

  it('renders field validation messages beside owned workspace fields', () => {
    render(
      <WorkspaceEditorForm
        description=""
        icon={defaultWorkspaceVisualIcon}
        title=""
        validationMessages={{
          description: ['Description is invalid.'],
          icon: ['Visual is invalid.'],
          title: ['Name is required.'],
        }}
        onDescriptionChange={() => undefined}
        onIconChange={() => undefined}
        onTitleChange={() => undefined}
      />,
    )

    const name = screen.getByLabelText('Workspace name')
    const description = screen.getByLabelText('Workspace description')

    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Name is required.')
    expect(description).toHaveAttribute('aria-invalid', 'true')
    expect(description).toHaveAccessibleDescription('Description is invalid.')
    expect(screen.getByText('Visual is invalid.')).toBeInTheDocument()
  })
})
