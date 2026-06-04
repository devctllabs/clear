import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { withStorybookRouter } from '@/test/storybook/router'

import { ReviewSummaryCard } from './ReviewSummaryCard'

const meta = {
  args: {
    backTo: '/dashboard/independent-study/decks/world-history',
    summary: {
      completedAt: '2026-05-16T12:12:00.000Z',
      deckId: 'world-history',
      durationSeconds: 720,
      id: 'world-history-review',
      mode: 'due',
      plannedCount: 42,
      reviewedCount: 24,
      startedAt: '2026-05-16T12:00:00.000Z',
      status: 'completed',
    },
  },
  component: ReviewSummaryCard,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Review/Components/ReviewSummaryCard',
} satisfies Meta<typeof ReviewSummaryCard>

export default meta

type Story = StoryObj<typeof meta>

export const Complete: Story = {}

export const ShortDuration: Story = {
  args: {
    summary: {
      completedAt: '2026-05-16T12:00:45.000Z',
      deckId: 'world-history',
      durationSeconds: 45,
      id: 'world-history-review',
      mode: 'due',
      plannedCount: 42,
      reviewedCount: 4,
      startedAt: '2026-05-16T12:00:00.000Z',
      status: 'completed',
    },
  },
}

export const HourDuration: Story = {
  args: {
    summary: {
      completedAt: '2026-05-16T14:01:00.000Z',
      deckId: 'world-history',
      durationSeconds: 7260,
      id: 'world-history-review',
      mode: 'due',
      plannedCount: 84,
      reviewedCount: 84,
      startedAt: '2026-05-16T12:00:00.000Z',
      status: 'completed',
    },
  },
}

export const EmptyMetrics: Story = {
  args: {
    summary: {
      completedAt: '2026-05-16T12:00:00.000Z',
      deckId: 'world-history',
      durationSeconds: 0,
      id: 'world-history-review',
      mode: 'due',
      plannedCount: 0,
      reviewedCount: 0,
      startedAt: '2026-05-16T12:00:00.000Z',
      status: 'completed',
    },
  },
}
