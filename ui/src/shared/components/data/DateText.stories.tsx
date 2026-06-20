import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'

import { DateText } from './DateText'

const meta = {
  args: {
    children: 'Updated yesterday',
    className: 'text-sm text-muted-foreground',
    timestamp: '2026-05-01T12:34:00',
  },
  component: DateText,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/DateText',
} satisfies Meta<typeof DateText>

export default meta

type Story = StoryObj<typeof meta>

export const ValidTimestamp: Story = {}

export const InvalidTimestampFallback: Story = {
  args: {
    children: 'Updated date unavailable',
    timestamp: 'not-a-date',
  },
}
