import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'

import { ProgressRing } from './ProgressRing'

const meta = {
  args: {
    value: 72,
  },
  component: ProgressRing,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/ProgressRing',
} satisfies Meta<typeof ProgressRing>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Zero: Story = {
  args: {
    value: 0,
  },
}

export const Complete: Story = {
  args: {
    value: 100,
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Mastery',
    labelClassName: 'mt-2',
    radius: 66,
    size: 144,
    strokeWidth: 6,
    value: 84,
    valueClassName: 'type-metric',
  },
}

export const ClampedOverflow: Story = {
  args: {
    value: 148,
  },
}

export const InvalidValue: Story = {
  args: {
    value: Number.NaN,
  },
}
