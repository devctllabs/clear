import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  expectMobileFooterActionSkeletonSize,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { withStorybookRouter } from '@/test/storybook/router'

import { NoteEditorLoadingState } from './NoteEditorLoadingState'

const meta = {
  args: {
    activeKind: 'basic',
    backTo: '/dashboard/independent-study/decks/world-history',
    title: 'New Note',
  },
  component: NoteEditorLoadingState,
  decorators: [
    withStorybookRouter('/dashboard/independent-study/decks/world-history/notes/new/basic'),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Notes/Components/NoteEditorLoadingState',
} satisfies Meta<typeof NoteEditorLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Basic: Story = {
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

export const Cloze: Story = {
  args: {
    activeKind: 'cloze',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
