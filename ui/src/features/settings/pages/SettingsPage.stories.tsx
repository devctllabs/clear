import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, waitFor, within } from 'storybook/test'

import {
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createSettings,
  createSettingsService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'

import { SettingsPage } from './SettingsPage'

const withSettingsPage = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: '/menu/settings',
    services: () =>
      createStorybookServices({
        settings: createSettingsService({
          error,
          loading,
          mutationError,
          mutationLoading,
          settings: createSettings({
            dailyNewLimit: 32,
            dailyReviewLimit: 140,
            fsrsRetention: 92,
            masteryHorizonDays: 45,
            newCardsOrder: 'mixed',
            timezone: 'Asia/Tokyo',
          }),
        }),
        workspaces: createWorkspaceService(),
      }),
  })

const meta = {
  component: SettingsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Settings/Pages/SettingsPage',
} satisfies Meta<typeof SettingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withSettingsPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading settings' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withSettingsPage()],
}

export const MobileLoadedRegression: Story = {
  decorators: [withSettingsPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Settings' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const SavePending: Story = {
  decorators: [withSettingsPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole('spinbutton', { name: 'New cards per day' })

    await userEvent.clear(input)
    await userEvent.type(input, '33')
    await canvas.findByRole('status', { name: 'Saving settings' })
  },
}

export const LoadError: Story = {
  decorators: [
    withSettingsPage({
      error: unavailableError('Settings storage is temporarily unavailable.'),
    }),
  ],
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withSettingsPage({
      error: unavailableError('Settings storage is temporarily unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Settings could not be loaded')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const SaveError: Story = {
  decorators: [
    withSettingsPage({
      mutationError: unavailableError('Settings could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole('spinbutton', { name: 'New cards per day' })

    await userEvent.clear(input)
    await userEvent.type(input, '33')
    await canvas.findByText('Could not save settings')
  },
}

export const ResetError: Story = {
  decorators: [
    withSettingsPage({
      mutationError: unavailableError('Settings could not be reset.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await userEvent.click(await canvas.findByRole('button', { name: 'Reset all settings' }))
    await userEvent.click(await page.findByRole('button', { name: 'Reset settings' }))
    await page.findByText('Could not reset settings')
  },
}

export const MobileResetDialogOpenRegression: Story = {
  decorators: [withSettingsPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Reset all settings' }))
    await page.findByRole('dialog', { name: 'Reset all settings?' })
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const ResetPending: Story = {
  decorators: [withSettingsPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await userEvent.click(await canvas.findByRole('button', { name: 'Reset all settings' }))
    await userEvent.click(await page.findByRole('button', { name: 'Reset settings' }))
    await waitFor(() => {
      if (!page.queryByRole('button', { name: 'Reset settings' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new globalThis.Error('Pending spinner was not rendered.')
      }
    })
  },
}
