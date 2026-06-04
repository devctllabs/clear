import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import { DesktopPageLayout } from '@shared/components/layout/DesktopShell'
import { AppShell, ScreenCanvas } from '@shared/components/layout/Screen'

import { FolderDetailLoadingState } from './FolderDetailLoadingState'

const meta = {
  component: FolderDetailLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Folders/Components/FolderDetailLoadingState',
} satisfies Meta<typeof FolderDetailLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  args: {
    backTo: '/dashboard/independent-study',
    variant: 'mobile',
  },
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/dashboard/independent-study/folders/reading-notes">
        <AppShell>
          <ScreenCanvas>
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
  args: {
    backTo: '/dashboard/independent-study',
    variant: 'desktop',
  },
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/dashboard/independent-study/folders/reading-notes">
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
