import { Copy, Pencil, Share2, Trash2 } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { ActionMenu } from './ActionMenu'

const meta = {
  args: {
    ariaLabel: 'Resource actions',
    items: [
      {
        icon: <Pencil className="size-4" />,
        label: 'Edit',
        onSelect: noop,
      },
      {
        icon: <Copy className="size-4" />,
        label: 'Duplicate',
        onSelect: noop,
      },
      {
        icon: <Trash2 className="size-4" />,
        label: 'Delete',
        onSelect: noop,
        tone: 'danger',
      },
    ],
  },
  component: ActionMenu,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Feedback/ActionMenu',
} satisfies Meta<typeof ActionMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TextOnly: Story = {
  args: {
    items: [
      {
        label: 'Edit',
        onSelect: noop,
      },
      {
        label: 'Delete',
        onSelect: noop,
        tone: 'danger',
      },
    ],
  },
}

export const LongLabels: Story = {
  args: {
    items: [
      {
        icon: <Share2 className="size-4" />,
        label: 'Share With Clinical Review Collaborators',
        onSelect: noop,
      },
      {
        icon: <Trash2 className="size-4" />,
        label: 'Delete Neuroimmunoendocrinological Reference Compendium',
        onSelect: noop,
        tone: 'danger',
      },
    ],
  },
}
