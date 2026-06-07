import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  expectCompactLocationPath,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { formCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { FolderEditorForm } from './FolderEditorForm'

const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const FolderEditorFormStory = ({
  description,
  name,
  ...args
}: ComponentProps<typeof FolderEditorForm>) => {
  const [currentName, setCurrentName] = useState(name)
  const [currentDescription, setCurrentDescription] = useState(description)

  return (
    <FolderEditorForm
      {...args}
      description={currentDescription}
      name={currentName}
      onDescriptionChange={setCurrentDescription}
      onNameChange={setCurrentName}
    />
  )
}

const meta = {
  args: {
    description: '',
    name: '',
    onDescriptionChange: noop,
    onNameChange: noop,
  },
  component: FolderEditorForm,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <FolderEditorFormStory {...args} />,
  title: 'Features/Folders/Components/FolderEditorForm',
} satisfies Meta<typeof FolderEditorForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithParentLocation: Story = {
  args: {
    description: 'High-yield decks grouped by clinical topic.',
    locationPath: ['Editorial Production', 'Academic'],
    name: 'Comparative History',
  },
}

export const Validation: Story = {
  args: {
    validationMessages: {
      description: ['Description is invalid.'],
      name: ['Name is required.'],
    },
  },
}

export const LongLocation: Story = {
  args: {
    description: 'Layout stress case for a deeply nested folder path.',
    locationPath: longLocationPath,
    name: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
  },
  play: async ({ canvasElement }) => {
    await expectCompactLocationPath(canvasElement, longLocationPath)
    await expectNoHorizontalOverflow(canvasElement)
  },
}
