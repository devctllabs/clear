import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import { DesktopPageLayout } from '@shared/components/layout/DesktopShell'
import { AppShell } from '@shared/components/layout/Screen'

import { WorkspaceListLoadingState } from './WorkspaceListLoadingState'

const meta = {
  component: WorkspaceListLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Workspaces/Components/WorkspaceListLoadingState',
} satisfies Meta<typeof WorkspaceListLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  args: {
    variant: 'mobile',
  },
  decorators: [
    (Story) => (
      <AppShell>
        <Story />
      </AppShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Desktop: Story = {
  args: {
    variant: 'desktop',
  },
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/workspaces">
        <DesktopPageLayout
          activeItem="spaces"
          homeTarget={{ to: '/workspaces' }}
        >
          <Story />
        </DesktopPageLayout>
      </StorybookRouterProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
