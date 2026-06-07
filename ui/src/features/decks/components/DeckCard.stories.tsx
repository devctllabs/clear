import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'

import type { Deck } from '../types/deck.types'
import { DeckCard } from './DeckCard'

const baseDeck: Deck = {
  description: '',
  dueToday: 18,
  icon: 'brain',
  id: 'storybook-deck',
  parentId: 'independent-study',
  progress: 72,
  title: 'Biology',
  totalNotes: 145,
  updatedAt: '2026-04-24T12:00:00.000Z',
  workspaceId: 'independent-study',
}

const createDeck = (deck: Partial<Deck>): Deck => ({
  ...baseDeck,
  ...deck,
})

const secondMs = 1000
const minuteMs = 60 * secondMs
const hourMs = 60 * minuteMs
const dayMs = 24 * hourMs

const timestampAgo = (durationMs: number) => new Date(Date.now() - durationMs).toISOString()

const noop = () => undefined

const meta = {
  args: {
    deck: baseDeck,
    onDelete: noop,
    onEdit: noop,
    onOpen: noop,
    onReview: noop,
  },
  component: DeckCard,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Decks/Components/DeckCard',
} satisfies Meta<typeof DeckCard>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    deck: baseDeck,
  },
}

export const ZeroDueReview: Story = {
  args: {
    deck: createDeck({
      dueToday: 0,
      id: 'zero-due-review',
      progress: 38,
      title: 'Zero Due Review',
    }),
  },
}

export const UpdatedSecondsAgo: Story = {
  args: {
    deck: createDeck({
      id: 'updated-seconds-ago',
      title: 'Updated Seconds Ago',
      updatedAt: timestampAgo(15 * secondMs),
    }),
  },
}

export const UpdatedMinutesAgo: Story = {
  args: {
    deck: createDeck({
      id: 'updated-minutes-ago',
      title: 'Updated Minutes Ago',
      updatedAt: timestampAgo(25 * minuteMs),
    }),
  },
}

export const UpdatedHoursAgo: Story = {
  args: {
    deck: createDeck({
      id: 'updated-hours-ago',
      title: 'Updated Hours Ago',
      updatedAt: timestampAgo(4 * hourMs),
    }),
  },
}

export const UpdatedOneDayAgo: Story = {
  args: {
    deck: createDeck({
      id: 'updated-one-day-ago',
      title: 'Updated One Day Ago',
      updatedAt: timestampAgo(26 * hourMs),
    }),
  },
}

export const UpdatedSixDaysAgo: Story = {
  args: {
    deck: createDeck({
      id: 'updated-six-days-ago',
      title: 'Updated Six Days Ago',
      updatedAt: timestampAgo(6 * dayMs),
    }),
  },
}

export const UpdatedAbsoluteDate: Story = {
  args: {
    deck: createDeck({
      id: 'updated-absolute-date',
      title: 'Updated Absolute Date',
      updatedAt: timestampAgo(32 * dayMs),
    }),
  },
}

export const ZeroMetrics: Story = {
  args: {
    deck: createDeck({
      dueToday: 0,
      id: 'zero-metrics',
      progress: 0,
      title: 'Zero Metrics',
      totalNotes: 0,
      updatedAt: '1970-01-01T00:00:00.000Z',
    }),
  },
}

export const NegativeMetrics: Story = {
  args: {
    deck: createDeck({
      dueToday: -3,
      id: 'negative-metrics',
      progress: -25,
      title: 'Negative Metrics',
    }),
  },
}

export const OverflowMetrics: Story = {
  args: {
    deck: createDeck({
      dueToday: 9999,
      id: 'overflow-metrics',
      progress: 148,
      title: 'Overflow Metrics',
      totalNotes: 9999,
    }),
  },
}

export const NaNProgress: Story = {
  args: {
    deck: createDeck({
      id: 'nan-progress',
      progress: Number.NaN,
      title: 'NaN Progress',
    }),
  },
}

export const InfiniteProgress: Story = {
  args: {
    deck: createDeck({
      id: 'infinite-progress',
      progress: Number.POSITIVE_INFINITY,
      title: 'Infinite Progress',
    }),
  },
}

export const InvalidDate: Story = {
  args: {
    deck: createDeck({
      id: 'invalid-date',
      title: 'Invalid Date',
      updatedAt: 'not-a-date',
    }),
  },
}

export const LongInvalidDate: Story = {
  args: {
    deck: createDeck({
      id: 'long-invalid-date',
      title: 'Long Invalid Date',
      updatedAt:
        'not-a-date-with-an-extremely-long-unbroken-diagnostic-token-that-should-not-expand-the-card',
    }),
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LongTitle: Story = {
  args: {
    deck: createDeck({
      id: 'long-title',
      title:
        'Advanced Comparative History Differential Diagnosis and Longitudinal Treatment Planning Workshop',
    }),
  },
}

export const LongUnbrokenTitle: Story = {
  args: {
    deck: createDeck({
      id: 'long-unbroken-title',
      title: 'NeuroimmunoendocrinologicalPathophysiologyDifferentialDiagnosisWorkshop',
    }),
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
