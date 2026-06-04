import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { createDeckDetail } from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import { DeckSummary } from './DeckSummary'

const meta = {
  args: {
    deck: createDeckDetail(),
    studyNowTo: '/dashboard/independent-study/decks/world-history/review',
  },
  component: DeckSummary,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Decks/Components/DeckSummary',
} satisfies Meta<typeof DeckSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const ZeroMetrics: Story = {
  args: {
    deck: createDeckDetail({
      dueToday: 0,
      progress: 0,
      totalNotes: 0,
    }),
  },
}

export const OverflowMetrics: Story = {
  args: {
    deck: createDeckDetail({
      dueToday: 9999,
      progress: 148,
      totalNotes: 12500,
    }),
  },
}
