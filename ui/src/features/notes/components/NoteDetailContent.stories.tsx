import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { dayMs, hourMs, timestampAgo } from '@/test/storybook/fixtures'

import type { NoteDetail } from '../types/note.types'
import { NoteDetailContent } from './NoteDetailContent'

const baseNote = {
  deckId: 'world-history',
  dueAt: timestampAgo(-2 * dayMs),
  id: 'memory-note',
  progress: 46,
  reviewedAt: timestampAgo(6 * dayMs),
  status: 'in-progress',
  title: 'Memory Consolidation',
  updatedAt: timestampAgo(4 * hourMs),
} as const

const basicNote = {
  ...baseNote,
  editor: {
    back: 'The hippocampus consolidates short-term memories into long-term memory.',
    front: 'Which structure is central to memory consolidation?',
  },
  kind: 'basic',
} satisfies Extract<NoteDetail, { kind: 'basic' }>

const clozeNote = {
  ...baseNote,
  cards: [
    {
      clozeId: 'c1',
      dueAt: timestampAgo(-1 * dayMs),
      id: 'memory-note:c1',
      progress: 82,
      reviewedAt: timestampAgo(1 * dayMs),
      status: 'mastered',
      title: 'Hippocampus Cloze',
    },
  ],
  editor: {
    body: 'The {{c1::hippocampus}} supports memory consolidation.',
  },
  kind: 'cloze',
  progress: 82,
} satisfies Extract<NoteDetail, { kind: 'cloze' }>

const meta = {
  args: {
    note: basicNote,
  },
  component: NoteDetailContent,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Notes/Components/NoteDetailContent',
} satisfies Meta<typeof NoteDetailContent>

export default meta

type Story = StoryObj<typeof meta>

export const Basic: Story = {}

export const Cloze: Story = {
  args: {
    note: clozeNote,
  },
}

export const LongText: Story = {
  args: {
    note: {
      ...basicNote,
      editor: {
        back:
          'A long-form explanation that wraps across multiple lines and should remain readable inside the constrained mobile detail card without clipping.',
        front:
          'Explain the neuroimmunoendocrinological feedback loop involved in stress-memory modulation.',
      },
      title: 'NeuroimmunoendocrinologicalPathophysiologyReviewProtocol',
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LongUnbrokenDerivedCards: Story = {
  args: {
    note: {
      ...clozeNote,
      cards: [
        {
          ...clozeNote.cards[0],
          title:
            'NeuroimmunoendocrinologicalPathophysiologyDifferentialDiagnosisDerivedCard',
        },
      ],
      editor: {
        body:
          'The {{c1::neuroimmunoendocrinologicalpathophysiologyfeedbackloop}} should remain readable even when the cloze token is a single uninterrupted segment.',
      },
      title: 'NeuroimmunoendocrinologicalPathophysiologyReviewProtocol',
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
