import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectMobileNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'

import { WorkspaceCreatePage } from './CreatePage'

const withWorkspaceCreatePage = ({
  mutationError,
  mutationLoading = false,
}: {
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: '/workspaces/new',
    services: () =>
      createStorybookServices({
        workspaces: createWorkspaceService({ mutationError, mutationLoading }),
      }),
  })

const meta = {
  component: WorkspaceCreatePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Workspaces/Pages/CreatePage',
} satisfies Meta<typeof WorkspaceCreatePage>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  decorators: [withWorkspaceCreatePage()],
}

export const RequiredValidation: Story = {
  decorators: [withWorkspaceCreatePage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Create workspace' }))
    await canvas.findByText('Name is required.')
  },
}

export const MobileEmptyRegression: Story = {
  decorators: [withWorkspaceCreatePage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Create Workspace' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const FilledForm: Story = {
  decorators: [withWorkspaceCreatePage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Workspace name'), 'Medical Review')
    await userEvent.type(
      await canvas.findByLabelText('Workspace description'),
      'A focused space for case notes, study sessions, and reference decks.',
    )
  },
}

export const CreatePending: Story = {
  decorators: [withWorkspaceCreatePage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Workspace name'), 'Medical Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create workspace' }))
    await expectButtonPendingSpinner(canvasElement, 'Create workspace')
  },
}

export const CreateError: Story = {
  decorators: [
    withWorkspaceCreatePage({
      mutationError: unavailableError('Workspace could not be created.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Workspace name'), 'Medical Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create workspace' }))
    await canvas.findByText('Could not create workspace')
    await canvas.findByDisplayValue('Medical Review')
  },
}
