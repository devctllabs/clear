import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { noop } from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import { ReviewUnavailableState } from './ReviewUnavailableState'

const meta = {
  args: {
    deckId: 'world-history',
    onClose: noop,
    workspaceId: 'independent-study',
  },
  component: ReviewUnavailableState,
  decorators: [
    withStorybookRouter('/dashboard/independent-study/decks/world-history/review'),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Review/Components/ReviewUnavailableState',
} satisfies Meta<typeof ReviewUnavailableState>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
