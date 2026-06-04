import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { expectMobileNoHorizontalOverflow } from '@/test/storybook/assertions'
import {
  createStorybookServices,
  createWorkspaceService,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'

import { ConflictsPage } from './ConflictsPage'

const withConflictsPage = () =>
  withStorybookApp({
    initialEntry: '/menu/conflicts',
    services: () =>
      createStorybookServices({
        workspaces: createWorkspaceService(),
      }),
  })

const meta = {
  component: ConflictsPage,
  decorators: [withConflictsPage()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Conflicts/Pages/ConflictsPage',
} satisfies Meta<typeof ConflictsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loaded: Story = {}

export const MobileLoadedRegression: Story = {
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Conflicts' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}
