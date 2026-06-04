import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { createDeck, dayMs, hourMs, noop, timestampAgo } from '@/test/storybook/fixtures'
import { withStorybookApp } from '@/test/storybook/providers'

import { DeckList } from './DeckList'

const baseDecks = [
  createDeck({
    dueToday: 18,
    id: 'world-history',
    progress: 72,
    title: 'World History',
    updatedAt: timestampAgo(4 * hourMs),
  }),
  createDeck({
    dueToday: 9,
    icon: 'brain',
    id: 'civic-vocabulary',
    progress: 48,
    title: 'Civic Vocabulary',
    totalNotes: 96,
    updatedAt: timestampAgo(18 * hourMs),
  }),
]

const meta = {
  args: {
    decks: baseDecks,
    onDelete: noop,
    onSortChange: noop,
    sort: {
      direction: 'asc',
      field: 'title',
    },
  },
  component: DeckList,
  decorators: [withStorybookApp(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Decks/Components/DeckList',
} satisfies Meta<typeof DeckList>

export default meta

type Story = StoryObj<typeof meta>

export const ManyItems: Story = {}

export const SingleItem: Story = {
  args: {
    decks: [baseDecks[0]],
  },
}

export const LongNames: Story = {
  args: {
    decks: [
      createDeck({
        dueToday: 9999,
        id: 'long-deck',
        progress: 148,
        title: 'DifferentialDiagnosisAndCaseReviewCompendiumWithUnbrokenTitle',
        totalNotes: 9999,
        updatedAt: timestampAgo(5 * dayMs),
      }),
      createDeck({
        dueToday: 4,
        id: 'long-readable-deck',
        title: 'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
        updatedAt: timestampAgo(12 * dayMs),
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Empty: Story = {
  args: {
    decks: [],
  },
}
