import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { expectMobileNoHorizontalOverflow } from '@/test/storybook/assertions'
import {
  createStorybookServices,
  createWorkspaceService,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'

import { MenuPage } from './MenuPage'

const meta = {
  component: MenuPage,
  decorators: [
    withStorybookApp({
      initialEntry: '/menu',
      services: () =>
        createStorybookServices({
          workspaces: createWorkspaceService(),
        }),
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Menu/Pages/MenuPage',
} satisfies Meta<typeof MenuPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MobileLoadedRegression: Story = {
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Menu' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}
