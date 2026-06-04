import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectElementsStackVertically,
  expectMobileLoadingShell,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
  setDesktopDetailZoomRegressionViewport,
} from '@/test/storybook/assertions'
import { dayMs, timestampAgo } from '@/test/storybook/fixtures'
import {
  createStorybookServices,
  createWorkspace,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'
import type { Workspace } from '../types/workspace.types'

import { WorkspaceListPage } from './ListPage'

const workspaces: Workspace[] = [
  createWorkspace({
    description: 'Daily study operations, production notes, and active review decks.',
    icon: 'layers-3',
    id: 'independent-study',
    title: 'Editorial Production',
    updatedAt: timestampAgo(3 * dayMs),
  }),
  createWorkspace({
    description: 'Long-term references, archived research, and supporting material.',
    icon: 'archive',
    id: 'reading-archive',
    title: 'Research Archive',
    updatedAt: timestampAgo(9 * dayMs),
  }),
]

const longNameWorkspaces: Workspace[] = [
  createWorkspace({
    description:
      'Layout stress case for very long workspace names and descriptions inside the full page shell.',
    id: 'long-workspace',
    title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
    updatedAt: timestampAgo(12 * dayMs),
  }),
]

const withWorkspaceListPage = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  workspaceRecords = workspaces,
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  workspaceRecords?: Workspace[]
} = {}) =>
  withStorybookApp({
    initialEntry: '/workspaces',
    services: () =>
      createStorybookServices({
        workspaces: createWorkspaceService({
          activeWorkspaceId: workspaceRecords[0]?.id ?? 'independent-study',
          error,
          loading,
          mutationError,
          mutationLoading,
          workspaces: workspaceRecords,
        }),
      }),
  })

const meta = {
  component: WorkspaceListPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Workspaces/Pages/ListPage',
} satisfies Meta<typeof WorkspaceListPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withWorkspaceListPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading workspaces' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingShellRegression: Story = {
  decorators: [withWorkspaceListPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading workspaces' })
    await expectMobileLoadingShell(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withWorkspaceListPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = await canvas.findByRole('heading', { name: 'Editorial Production' })
    const titleStyle = window.getComputedStyle(title)

    await expect(titleStyle.fontFamily).toContain('Geist Sans')
    await expect(titleStyle.fontSize).toBe('24px')
    await expect(titleStyle.fontWeight).toBe('650')
  },
}

export const MobileLoadedRegression: Story = {
  decorators: [withWorkspaceListPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Workspaces' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DesktopZoom150GridRegression: Story = {
  decorators: [withWorkspaceListPage()],
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const shouldAssertZoomRegression = await setDesktopDetailZoomRegressionViewport()

    if (!shouldAssertZoomRegression) {
      return
    }

    const canvas = within(canvasElement)
    const firstWorkspace = await canvas.findByRole('button', {
      name: 'Open Editorial Production',
    })
    const secondWorkspace = await canvas.findByRole('button', {
      name: 'Open Research Archive',
    })

    await expectElementsStackVertically(firstWorkspace, secondWorkspace)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpenWorkspacePending: Story = {
  decorators: [withWorkspaceListPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = await canvas.findByText('Research Archive')
    const titleTopBefore = title.getBoundingClientRect().top

    await userEvent.click(await canvas.findByRole('button', { name: 'Open Research Archive' }))
    await canvas.findByRole('status', { name: 'Opening Research Archive' })

    const titleTopAfter = (await canvas.findByText('Research Archive')).getBoundingClientRect().top

    await expect(Math.abs(titleTopAfter - titleTopBefore)).toBeLessThanOrEqual(1)
  },
}

export const OpenWorkspaceError: Story = {
  decorators: [
    withWorkspaceListPage({
      mutationError: unavailableError('Workspace actions are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Open Research Archive' }))
    await canvas.findByText('Could not open workspace')
  },
}

export const EmptyList: Story = {
  decorators: [withWorkspaceListPage({ workspaceRecords: [] })],
}

export const LoadError: Story = {
  decorators: [
    withWorkspaceListPage({
      error: unavailableError('Workspace storage is temporarily unavailable.'),
    }),
  ],
}

export const DeleteError: Story = {
  decorators: [
    withWorkspaceListPage({
      mutationError: unavailableError('Workspace actions are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Research Archive actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete workspace' }))
    await expectNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const DeleteWorkspacePending: Story = {
  decorators: [withWorkspaceListPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Research Archive actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete workspace' }))
    await expectButtonPendingSpinner(canvasElement.ownerDocument.body, 'Delete workspace')
  },
}

export const LongNames: Story = {
  decorators: [withWorkspaceListPage({ workspaceRecords: longNameWorkspaces })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongNamesRegression: Story = {
  decorators: [withWorkspaceListPage({ workspaceRecords: longNameWorkspaces })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DeleteDialogOpen: Story = {
  decorators: [withWorkspaceListPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Research Archive actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
  },
}

export const MobileDeleteDialogOpenRegression: Story = {
  decorators: [withWorkspaceListPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Research Archive actions' })

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}
