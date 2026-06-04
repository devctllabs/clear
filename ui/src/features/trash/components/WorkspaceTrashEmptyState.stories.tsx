import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'

import { WorkspaceTrashEmptyState } from './WorkspaceTrashEmptyState'

const meta = {
  component: WorkspaceTrashEmptyState,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Trash/Components/WorkspaceTrashEmptyState',
} satisfies Meta<typeof WorkspaceTrashEmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}
