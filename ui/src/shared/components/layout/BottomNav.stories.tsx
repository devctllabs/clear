import type { Meta, StoryObj } from '@storybook/react-vite'

import { appScreenCanvas } from '@/test/storybook/decorators'
import { withStorybookRouter } from '@/test/storybook/router'

import { BottomNav } from './BottomNav'

const meta = {
  args: {
    activeItem: 'home',
    homeTarget: {
      to: '/dashboard/independent-study',
    },
  },
  component: BottomNav,
  decorators: [withStorybookRouter(), appScreenCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Layout/BottomNav',
} satisfies Meta<typeof BottomNav>

export default meta

type Story = StoryObj<typeof meta>

export const HomeActive: Story = {}

export const SpacesActive: Story = {
  args: {
    activeItem: 'spaces',
  },
}

export const MenuActive: Story = {
  args: {
    activeItem: 'menu',
  },
}
