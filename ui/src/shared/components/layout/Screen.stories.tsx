import { Settings } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { withStorybookRouter } from '@/test/storybook/router'

import { IconButton } from '../ui/icon-button'
import { PageHeader } from './Screen'

const meta = {
  args: {
    description: 'Review your study queue and continue from the highest-priority deck.',
    title: 'Dashboard',
  },
  component: PageHeader,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Layout/PageHeader',
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const WithoutBack: Story = {}

export const WithBack: Story = {
  args: {
    backTo: '/dashboard/independent-study',
    description: 'Tune workspace defaults, scheduling, and appearance.',
    title: 'Settings',
  },
}

export const WithRightSlot: Story = {
  args: {
    description: 'Manage deck metadata and review settings.',
    rightSlot: (
      <IconButton
        className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground"
        focusSurface="muted"
        icon={<Settings className="size-4" />}
        label="Open settings"
        size="lg"
        type="button"
      />
    ),
    title: 'World History',
  },
}

export const LongCopy: Story = {
  args: {
    backTo: '/dashboard/independent-study',
    description:
      'Clinical neuroanatomy differential diagnosis and longitudinal treatment planning material with dense metadata.',
    title: 'Neuroimmunoendocrinological Reference Compendium',
  },
}
