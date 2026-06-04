import type { Meta, StoryObj } from '@storybook/react-vite'
import { FolderPlus, Layers3 } from 'lucide-react'

import { noop } from '@/test/storybook/fixtures'

import { EmptyState } from './EmptyState'

const meta = {
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  title: 'Shared/Feedback/EmptyState',
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Actionable: Story = {
  args: {
    actions: [
      {
        icon: <FolderPlus className="size-4" />,
        label: 'New folder',
        onClick: noop,
      },
      {
        icon: <Layers3 className="size-4" />,
        label: 'New deck',
        onClick: noop,
        variant: 'outline',
      },
    ],
    description: 'Create a folder or deck to start organizing this workspace.',
    icon: <Layers3 className="size-6" />,
    title: 'Nothing here yet',
  },
}

export const Informational: Story = {
  args: {
    description: 'Items will appear here when they are available.',
    icon: <Layers3 className="size-6" />,
    title: 'No items yet',
  },
}

export const Compact: Story = {
  args: {
    actions: [
      {
        label: 'Basic',
        onClick: noop,
      },
      {
        label: 'Cloze',
        onClick: noop,
        variant: 'outline',
      },
    ],
    density: 'compact',
    description: 'Create the first note to start building this deck.',
    icon: <Layers3 className="size-6" />,
    title: 'This deck is empty',
  },
}
