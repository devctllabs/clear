import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { formCanvas } from '@/test/storybook/decorators'
import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'

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

export const BasicPreview: Story = {
  args: {
    basicDraft: {
      back: 'The hippocampus consolidates short-term memories into long-term memory.',
      front: 'Which structure is central to memory consolidation?',
    },
    title: 'Memory Consolidation',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Review' }))
    const preview = getPreviewElement(canvasElement)
    const previewCanvas = within(preview)

    await expect(
      previewCanvas.getByText('Which structure is central to memory consolidation?'),
    ).toBeVisible()
    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await expect(
      previewCanvas.getByText(
        'The hippocampus consolidates short-term memories into long-term memory.',
      ),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
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

export const ClozePreview: Story = {
  args: {
    activeKind: 'cloze',
    clozeDraft: {
      body: 'The {{c1::hippocampus}} supports {{c2::memory consolidation}}.',
    },
    title: 'Hippocampus Cloze',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Review' }))
    const preview = getPreviewElement(canvasElement)
    const previewCanvas = within(preview)

    await expect(previewCanvas.getByText('•••')).toBeVisible()
    await userEvent.click(await canvas.findByRole('button', { name: 'c2' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await expect(previewCanvas.getByText('memory consolidation')).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
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

const getPreviewElement = (canvasElement: HTMLElement) => {
  const preview = canvasElement.querySelector('[data-slot="note-review-preview"]')

  if (!(preview instanceof HTMLElement)) {
    throw new Error('Expected note review preview to render.')
  }

  return preview
}
