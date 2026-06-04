import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { StorybookRouterProvider } from '@/test/storybook/router'
import {
  DesktopPageLayout,
  desktopDetailContentClassName,
} from '@shared/components/layout/DesktopShell'
import { AppShell, ScreenCanvas } from '@shared/components/layout/Screen'

import { DeckDetailLoadingState } from './DeckDetailLoadingState'

const meta = {
  component: DeckDetailLoadingState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Decks/Components/DeckDetailLoadingState',
} satisfies Meta<typeof DeckDetailLoadingState>

export default meta

type Story = StoryObj<typeof meta>

export const Mobile: Story = {
  args: {
    backTo: '/dashboard/independent-study',
    variant: 'mobile',
  },
  decorators: [
    (Story) => (
      <StorybookRouterProvider initialEntry="/dashboard/independent-study/decks/world-history">
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
      <StorybookRouterProvider initialEntry="/dashboard/independent-study/decks/world-history">
        <DesktopPageLayout
          activeItem="home"
          contentClassName={desktopDetailContentClassName}
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
