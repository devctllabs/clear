import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'

import { TrashLoadingState } from './TrashLoadingState'

const meta = {
  component: TrashLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Trash/Components/TrashLoadingState',
} satisfies Meta<typeof TrashLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/menu/trash">
        <AppShell>
          <ScreenCanvas>
            <PageHeader backTo="/menu" title="Trash" />
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
      <StorybookRouterProvider initialEntry="/menu/trash">
        <DesktopPageLayout
          activeItem="trash"
          contentClassName="mx-auto w-full max-w-page-narrow"
          homeTarget={{ to: '/dashboard/independent-study' }}
        >
          <DesktopPageHeader title="Trash" />
          <Story />
        </DesktopPageLayout>
      </StorybookRouterProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
