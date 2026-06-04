import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  expectMobileFooterActionSkeletonSize,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { withStorybookRouter } from '@/test/storybook/router'

import { EditorLoadingState } from './EditorLoadingState'

const meta = {
  args: {
    backTo: '/dashboard/independent-study',
    formKind: 'generic',
    title: 'Edit Resource',
  },
  component: EditorLoadingState,
  decorators: [withStorybookRouter()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Shared/Layout/EditorLoadingState',
} satisfies Meta<typeof EditorLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const DeckForm: Story = {
  args: {
    formKind: 'deck',
    title: 'Edit Deck',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const FolderForm: Story = {
  args: {
    formKind: 'folder',
    title: 'Edit Folder',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileFooterActionSizeRegression: Story = {
  args: {
    formKind: 'folder',
    title: 'Edit Folder',
  },
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileFooterActionSkeletonSize(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const WorkspaceForm: Story = {
  args: {
    formKind: 'workspace',
    title: 'Edit Workspace',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LongTitle: Story = {
  args: {
    title: 'Edit Neuroimmunoendocrinological Reference Compendium',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
