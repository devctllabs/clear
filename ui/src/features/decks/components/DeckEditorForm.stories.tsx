import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import {
  expectCompactLocationPath,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { formCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { defaultDeckVisualIcon } from '../constants/visuals'
import { DeckEditorForm } from './DeckEditorForm'

const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const DeckEditorFormStory = ({
  description,
  icon,
  title,
  ...args
}: ComponentProps<typeof DeckEditorForm>) => {
  const [currentTitle, setCurrentTitle] = useState(title)
  const [currentDescription, setCurrentDescription] = useState(description)
  const [currentIcon, setCurrentIcon] = useState<VisualIconName>(icon)

  return (
    <DeckEditorForm
      {...args}
      description={currentDescription}
      icon={currentIcon}
      title={currentTitle}
      onDescriptionChange={setCurrentDescription}
      onIconChange={setCurrentIcon}
      onTitleChange={setCurrentTitle}
    />
  )
}

const meta = {
  args: {
    description: '',
    icon: defaultDeckVisualIcon,
    onDescriptionChange: noop,
    onIconChange: noop,
    onTitleChange: noop,
    title: '',
  },
  component: DeckEditorForm,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <DeckEditorFormStory {...args} />,
  title: 'Features/Decks/Components/DeckEditorForm',
} satisfies Meta<typeof DeckEditorForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithLocation: Story = {
  args: {
    description: 'High-yield cards grouped by clinical topic.',
    locationPath: ['Academic', 'Comparative History', 'Board Review'],
    title: 'World History',
  },
}

export const Validation: Story = {
  args: {
    validationMessages: {
      description: ['Description is invalid.'],
      icon: ['Visual is invalid.'],
      title: ['Name is required.'],
    },
  },
}

export const LongLocation: Story = {
  args: {
    description: 'Layout stress case for a deeply nested deck path.',
    locationPath: longLocationPath,
    title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
  },
  play: async ({ canvasElement }) => {
    await expectCompactLocationPath(canvasElement, longLocationPath)
    await expectNoHorizontalOverflow(canvasElement)
  },
}
