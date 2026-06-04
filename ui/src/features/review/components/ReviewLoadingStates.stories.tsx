import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'

import {
  ReviewSessionLoadingState,
  ReviewSummaryLoadingState,
} from './ReviewLoadingStates'

const meta = {
  component: ReviewSessionLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Review/Components/ReviewLoadingStates',
} satisfies Meta<typeof ReviewSessionLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Session: Story = {
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Summary: Story = {
  render: () => <ReviewSummaryLoadingState />,
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
