import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  expectMobileFooterActionSkeletonSize,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { withStorybookApp } from '@/test/storybook/providers'

import { NoteDetailLoadingState } from './NoteDetailLoadingState'

const meta = {
  args: {
    homeTarget: {
      to: '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    },
  },
  component: NoteDetailLoadingState,
  decorators: [
    withStorybookApp({
      initialEntry:
        '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Notes/Components/NoteDetailLoadingState',
} satisfies Meta<typeof NoteDetailLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileFooterActionSizeRegression: Story = {
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileFooterActionSkeletonSize(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}
