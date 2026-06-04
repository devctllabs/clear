import type { Meta, StoryObj } from '@storybook/react-vite'

import { PendingSpinner } from './PendingSpinner'

const meta = {
  args: {
    label: 'Saving',
  },
  component: PendingSpinner,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
  title: 'Shared/Feedback/PendingSpinner',
} satisfies Meta<typeof PendingSpinner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnDark: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center bg-primary p-8 text-primary-foreground">
        <Story />
      </div>
    ),
  ],
}
