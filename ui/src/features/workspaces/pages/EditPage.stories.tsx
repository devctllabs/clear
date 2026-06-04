import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createStorybookServices,
  createWorkspace,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import { dayMs, timestampAgo } from '@/test/storybook/fixtures'
import type { DomainError } from '@shared/errors'
import type { Workspace } from '../types/workspace.types'

import { WorkspaceEditPage } from './EditPage'

const workspace = createWorkspace({
  description: 'Daily study operations, production notes, and active review decks.',
  id: 'independent-study',
  title: 'Editorial Production',
  updatedAt: timestampAgo(3 * dayMs),
})

const longNameWorkspace = createWorkspace({
  description:
    'Layout stress case for a workspace with a long name inside the full editor shell.',
  id: 'long-workspace',
  title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
  updatedAt: timestampAgo(12 * dayMs),
})

const withWorkspaceEditPage = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  workspaceRecord = workspace,
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  workspaceRecord?: Workspace
} = {}) =>
  withStorybookApp({
    initialEntry: `/workspaces/${workspaceRecord.id}.edit`,
    services: () =>
      createStorybookServices({
        workspaces: createWorkspaceService({
          activeWorkspaceId: workspaceRecord.id,
          error,
          loading,
          mutationError,
          mutationLoading,
          workspaces: [workspaceRecord],
        }),
      }),
  })

const meta = {
  args: {
    workspaceId: workspace.id,
  },
  component: WorkspaceEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Workspaces/Pages/EditPage',
} satisfies Meta<typeof WorkspaceEditPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withWorkspaceEditPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading editor' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withWorkspaceEditPage()],
}

export const MobileLoadedRegression: Story = {
  decorators: [withWorkspaceEditPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Edit Workspace' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withWorkspaceEditPage({
      error: unavailableError('Workspace storage is temporarily unavailable.'),
    }),
  ],
}

export const SaveError: Story = {
  decorators: [
    withWorkspaceEditPage({
      mutationError: unavailableError('Workspace could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Workspace name')

    await userEvent.clear(input)
    await userEvent.type(input, 'Editorial Production Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await canvas.findByText('Could not save workspace')
    await canvas.findByDisplayValue('Editorial Production Review')
  },
}

export const SavePending: Story = {
  decorators: [withWorkspaceEditPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Workspace name')

    await userEvent.clear(input)
    await userEvent.type(input, 'Editorial Production Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await expectButtonPendingSpinner(canvasElement, 'Save changes')
  },
}

export const LongName: Story = {
  args: {
    workspaceId: longNameWorkspace.id,
  },
  decorators: [withWorkspaceEditPage({ workspaceRecord: longNameWorkspace })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongNameRegression: Story = {
  args: {
    workspaceId: longNameWorkspace.id,
  },
  decorators: [withWorkspaceEditPage({ workspaceRecord: longNameWorkspace })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}
