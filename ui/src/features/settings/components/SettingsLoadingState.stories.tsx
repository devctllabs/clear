import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'

import { SettingsLoadingState } from './SettingsLoadingState'

const meta = {
  component: SettingsLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Settings/Components/SettingsLoadingState',
} satisfies Meta<typeof SettingsLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/menu/settings">
        <AppShell>
          <ScreenCanvas>
            <PageHeader backTo="/menu" title="Settings" />
            <Story />
          </ScreenCanvas>
        </AppShell>
      </StorybookRouterProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Desktop: Story = {
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/menu/settings">
        <DesktopPageLayout
          activeItem="settings"
          contentClassName="mx-auto w-full max-w-page-narrow"
          homeTarget={{ to: '/dashboard/independent-study' }}
        >
          <DesktopPageHeader title="Settings" />
          <Story />
        </DesktopPageLayout>
      </StorybookRouterProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
