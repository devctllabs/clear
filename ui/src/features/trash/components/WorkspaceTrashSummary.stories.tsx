import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'

import { WorkspaceTrashSummary } from './WorkspaceTrashSummary'

const meta = {
  args: {
    ageLabel: 'Last emptied 2 days ago',
    countLabel: '3 items',
  },
  component: WorkspaceTrashSummary,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Trash/Components/WorkspaceTrashSummary',
} satisfies Meta<typeof WorkspaceTrashSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleItem: Story = {
  args: {
    ageLabel: 'Last emptied 1 hour ago',
    countLabel: '1 item',
  },
}
