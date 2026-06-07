import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { formCanvas } from '@/test/storybook/decorators'

import type { NoteKind } from '../types/note.types'
import { NoteEditorForm } from './NoteEditorForm'

const noop = () => undefined

const NoteEditorFormStory = ({
  activeKind: initialKind,
  basicDraft: initialBasicDraft,
  clozeDraft: initialClozeDraft,
  title: initialTitle,
  ...args
}: ComponentProps<typeof NoteEditorForm>) => {
  const [activeKind, setActiveKind] = useState<NoteKind>(initialKind)
  const [title, setTitle] = useState(initialTitle)
  const [basicDraft, setBasicDraft] = useState(initialBasicDraft)
  const [clozeDraft, setClozeDraft] = useState(initialClozeDraft)

  return (
    <NoteEditorForm
      {...args}
      activeKind={activeKind}
      basicDraft={basicDraft}
      clozeDraft={clozeDraft}
      title={title}
      onBackChange={(back) => setBasicDraft((draft) => ({ ...draft, back }))}
      onBodyChange={(body) => setClozeDraft({ body })}
      onFrontChange={(front) => setBasicDraft((draft) => ({ ...draft, front }))}
      onKindChange={setActiveKind}
      onTitleChange={setTitle}
    />
  )
}

const meta = {
  args: {
    activeKind: 'basic',
    basicDraft: {
      back: '',
      front: '',
    },
    clozeDraft: {
      body: '',
    },
    onBackChange: noop,
    onBodyChange: noop,
    onFrontChange: noop,
    onKindChange: noop,
    onTitleChange: noop,
    title: '',
  },
  component: NoteEditorForm,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <NoteEditorFormStory {...args} />,
  title: 'Features/Notes/Components/NoteEditorForm',
} satisfies Meta<typeof NoteEditorForm>

export default meta

type Story = StoryObj<typeof meta>

export const BasicEmpty: Story = {}

export const BasicFilled: Story = {
  args: {
    basicDraft: {
      back: 'The hippocampus consolidates short-term memories into long-term memory.',
      front: 'Which structure is central to memory consolidation?',
    },
    title: 'Memory Consolidation',
  },
}

export const BasicValidation: Story = {
  args: {
    validationMessages: {
      basicBack: ['Back is required.'],
      basicFront: ['Front is required.'],
      title: ['Title is required.'],
    },
  },
}

export const ClozeFilled: Story = {
  args: {
    activeKind: 'cloze',
    clozeDraft: {
      body: 'The {{c1::hippocampus}} supports memory consolidation.',
    },
    title: 'Hippocampus Cloze',
  },
}

export const ClozeValidation: Story = {
  args: {
    activeKind: 'cloze',
    validationMessages: {
      clozeBody: ['Note body is required.'],
      title: ['Title is required.'],
    },
  },
}
