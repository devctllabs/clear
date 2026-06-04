import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { formCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { WorkspaceEditorForm } from './WorkspaceEditorForm'

const WorkspaceEditorFormStory = ({
  description,
  icon,
  title,
  ...args
}: ComponentProps<typeof WorkspaceEditorForm>) => {
  const [currentTitle, setCurrentTitle] = useState(title)
  const [currentDescription, setCurrentDescription] = useState(description)
  const [currentIcon, setCurrentIcon] = useState<VisualIconName>(icon)

  return (
    <WorkspaceEditorForm
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
    icon: defaultWorkspaceVisualIcon,
    onDescriptionChange: noop,
    onIconChange: noop,
    onTitleChange: noop,
    title: '',
  },
  component: WorkspaceEditorForm,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <WorkspaceEditorFormStory {...args} />,
  title: 'Features/Workspaces/Components/WorkspaceEditorForm',
} satisfies Meta<typeof WorkspaceEditorForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    description: 'A focused workspace for medical review, case notes, and study sessions.',
    title: 'Editorial Production',
  },
}

export const LongName: Story = {
  args: {
    description: 'Layout stress case for a workspace with a long name.',
    title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
  },
}
