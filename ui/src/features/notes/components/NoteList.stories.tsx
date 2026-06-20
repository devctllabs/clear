import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import {
  createBasicNoteDetail,
  createClozeNoteDetail,
  dayMs,
  hourMs,
  noop,
  timestampAgo,
} from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import { NoteList } from './NoteList'

const baseNotes = [
  createBasicNoteDetail({
    id: 'memory-consolidation',
    status: 'in-progress',
    title: 'Memory Consolidation',
    updatedAt: timestampAgo(25 * hourMs),
  }),
  createClozeNoteDetail({
    id: 'hippocampus-cloze',
    status: 'mastered',
    title: 'Hippocampus Cloze',
    updatedAt: timestampAgo(3 * dayMs),
  }),
]

const meta = {
  args: {
    deckId: 'world-history',
    notes: baseNotes,
    onDelete: noop,
    onSortChange: noop,
    sort: {
      direction: 'desc',
      field: 'updatedAt',
    },
    workspaceId: 'independent-study',
  },
  component: NoteList,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Notes/Components/NoteList',
} satisfies Meta<typeof NoteList>

export default meta

type Story = StoryObj<typeof meta>

export const StatusMix: Story = {}

export const DenseData: Story = {
  args: {
    notes: [
      ...baseNotes,
      createBasicNoteDetail({
        id: 'spaced-repetition',
        status: 'mastered',
        title: 'Spaced Repetition Interval Tuning',
        updatedAt: timestampAgo(9 * dayMs),
      }),
      createClozeNoteDetail({
        id: 'basal-ganglia',
        status: 'in-progress',
        title: 'Basal Ganglia Pathway',
        updatedAt: timestampAgo(15 * dayMs),
      }),
    ],
  },
}

export const LongTitles: Story = {
  args: {
    notes: [
      createBasicNoteDetail({
        id: 'long-note',
        title:
          'Advanced Comparative History Differential Diagnosis and Longitudinal Treatment Planning',
      }),
      createClozeNoteDetail({
        id: 'unbroken-note',
        title: 'NeuroimmunoendocrinologicalPathophysiologyDifferentialDiagnosisProtocol',
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Empty: Story = {
  args: {
    notes: [],
  },
}
