import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import { AppShell, ScreenCanvas } from '@shared/components/layout/Screen'
import { DesktopPageLayout } from '@shared/components/layout/DesktopShell'

import { DashboardLoadingState } from './DashboardLoadingState'

const meta = {
  component: DashboardLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Dashboard/Components/DashboardLoadingState',
} satisfies Meta<typeof DashboardLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  args: {
    variant: 'mobile',
  },
  decorators: [
    (Story) => (
      <AppShell>
        <ScreenCanvas>
          <Story />
        </ScreenCanvas>
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
      <StorybookRouterProvider initialEntry="/dashboard/independent-study">
        <DesktopPageLayout
          activeItem="home"
          homeTarget={{ to: '/dashboard/independent-study' }}
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
