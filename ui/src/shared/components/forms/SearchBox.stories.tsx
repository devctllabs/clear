import { SlidersHorizontal } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { formCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { SearchBox } from './SearchBox'

const meta = {
  args: {
    onChange: noop,
    placeholder: 'Search notes, decks, and folders',
  },
  component: SearchBox,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Forms/SearchBox',
} satisfies Meta<typeof SearchBox>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    value: 'memory consolidation',
  },
}

export const LongValue: Story = {
  args: {
    value: 'neuroimmunoendocrinological pathophysiology differential diagnosis',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search unavailable',
  },
}

export const WithoutIcon: Story = {
  args: {
    icon: false,
    placeholder: 'Search icons...',
  },
}

export const CustomIcon: Story = {
  args: {
    icon: <SlidersHorizontal className="size-5" />,
    label: 'Filter',
    placeholder: 'Filter resources',
  },
}

export const CardSurface: Story = {
  args: {
    icon: false,
    placeholder: 'Search inside dialog',
    surface: 'card',
  },
}

export const PopoverSurface: Story = {
  args: {
    icon: false,
    placeholder: 'Search icons...',
    surface: 'popover',
  },
}
