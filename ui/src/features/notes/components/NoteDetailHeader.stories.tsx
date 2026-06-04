import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import type { NoteDetail } from '../types/note.types'
import { NoteDetailHeader } from './NoteDetailHeader'

const note = {
  deckId: 'world-history',
  dueAt: '2026-05-05T10:00:00.000Z',
  editor: {
    back: 'Answer',
    front: 'Question',
  },
  id: 'memory-note',
  kind: 'basic',
  progress: 46,
  reviewedAt: '2026-04-27T10:00:00.000Z',
  status: 'in-progress',
  title: 'Memory Consolidation',
  updatedAt: '2026-05-02T10:00:00.000Z',
} satisfies Extract<NoteDetail, { kind: 'basic' }>

const meta = {
  args: {
    backTo: '/dashboard/independent-study/decks/world-history',
    note,
    onDelete: noop,
    onEdit: noop,
  },
  component: NoteDetailHeader,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Notes/Components/NoteDetailHeader',
} satisfies Meta<typeof NoteDetailHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
