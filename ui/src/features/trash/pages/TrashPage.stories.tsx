import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, waitFor, within } from 'storybook/test'

import {
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createStorybookServices,
  createTrashItem,
  createTrashService,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import { dayMs, timestampAgo } from '@/test/storybook/fixtures'
import { err, type DomainError } from '@shared/errors'
import type { TrashService } from '../services/trashService'
import type { TrashState } from '../types/trash.types'

import { TrashPage } from './TrashPage'

const filledTrashState: TrashState = {
  items: [
    createTrashItem({
      deletedAt: timestampAgo(5 * dayMs),
      id: 'drafting-patterns',
      kind: 'deck',
      title: 'Drafting Patterns',
    }),
    createTrashItem({
      deletedAt: timestampAgo(2 * dayMs),
      id: 'sampling-error-notes',
      kind: 'note',
      locationPath: ['Editorial Production', 'Civic Vocabulary'],
      title: 'Sampling Error Notes',
    }),
    createTrashItem({
      deletedAt: timestampAgo(7 * dayMs),
      id: 'drafts',
      kind: 'folder',
      locationPath: ['Editorial Production'],
      title: 'Drafts',
    }),
  ],
  lastEmptiedAt: timestampAgo(12 * dayMs),
}

const emptyTrashState: TrashState = {
  items: [],
  lastEmptiedAt: timestampAgo(dayMs),
}

const longNameTrashState: TrashState = {
  items: [
    createTrashItem({
      deletedAt: timestampAgo(12 * dayMs),
      id: 'long-deck',
      kind: 'deck',
      locationPath: [
        'EditorialProduction',
        'Academic',
        'ClinicalNeuroanatomyDifferentialDiagnosisAndCaseReviewArchive',
      ],
      title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
    }),
  ],
  lastEmptiedAt: timestampAgo(24 * dayMs),
}

const createTrashServiceWithPostMutationRefreshError = ({
  error,
  state = filledTrashState,
}: {
  error: DomainError
  state?: TrashState
}): TrashService => {
  const delegate = createTrashService({ state })
  let failFutureList = false

  return {
    ...delegate,
    async deleteItem(itemId) {
      const result = await delegate.deleteItem(itemId)

      if (result.ok) {
        failFutureList = true
      }

      return result
    },
    async empty() {
      const result = await delegate.empty()

      if (result.ok) {
        failFutureList = true
      }

      return result
    },
    async list() {
      if (failFutureList) {
        return err(error)
      }

      return delegate.list()
    },
    async restoreItem(itemId) {
      const result = await delegate.restoreItem(itemId)

      if (result.ok) {
        failFutureList = true
      }

      return result
    },
  }
}

const withTrashPage = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  state = filledTrashState,
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  state?: TrashState
} = {}) =>
  withStorybookApp({
    initialEntry: '/menu/trash',
    services: () =>
      createStorybookServices({
        trash: createTrashService({
          error,
          loading,
          mutationError,
          mutationLoading,
          state,
        }),
        workspaces: createWorkspaceService(),
      }),
  })

const meta = {
  component: TrashPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Trash/Pages/TrashPage',
} satisfies Meta<typeof TrashPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withTrashPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading trash' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Empty: Story = {
  decorators: [withTrashPage({ state: emptyTrashState })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Filled: Story = {
  decorators: [withTrashPage()],
}

export const MobileFilledRegression: Story = {
  decorators: [withTrashPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Trash' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const RestorePending: Story = {
  decorators: [withTrashPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Restore' }))
    await canvas.findByRole('status', { name: 'Restoring Sampling Error Notes' })
  },
}

export const LoadError: Story = {
  decorators: [
    withTrashPage({
      error: unavailableError('Trash storage is temporarily unavailable.'),
    }),
  ],
}

export const RefreshTrashError: Story = {
  decorators: [
    withStorybookApp({
      initialEntry: '/menu/trash',
      services: () =>
        createStorybookServices({
          trash: createTrashServiceWithPostMutationRefreshError({
            error: unavailableError('Trash storage is temporarily unavailable.'),
          }),
          workspaces: createWorkspaceService(),
        }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete permanently' }))
    await page.findByText('Trash may be out of date')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withTrashPage({
      error: unavailableError('Trash storage is temporarily unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Trash could not be loaded')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const RestoreError: Story = {
  decorators: [
    withTrashPage({
      mutationError: unavailableError('Trash actions are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Restore' }))
    await canvas.findByText('Could not restore item')
  },
}

export const DeleteError: Story = {
  decorators: [
    withTrashPage({
      mutationError: unavailableError('Trash actions are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete permanently' }))
    await page.findByText('Could not delete item')
  },
}

export const LongNames: Story = {
  decorators: [withTrashPage({ state: longNameTrashState })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongNamesRegression: Story = {
  decorators: [withTrashPage({ state: longNameTrashState })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DeleteItemDialogOpen: Story = {
  decorators: [withTrashPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
  },
}

export const MobileDeleteItemDialogOpenRegression: Story = {
  decorators: [withTrashPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const DeleteItemPending: Story = {
  decorators: [withTrashPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Sampling Error Notes trash actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete permanently' }))
    await waitFor(() => {
      if (!page.queryByRole('button', { name: 'Delete permanently' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new globalThis.Error('Pending spinner was not rendered.')
      }
    })
  },
}

export const EmptyTrashDialogOpen: Story = {
  decorators: [withTrashPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await userEvent.click(await canvas.findByRole('button', { name: 'Empty' }))
    await page.findByRole('dialog', { name: 'Empty trash?' })
  },
}

export const MobileEmptyTrashDialogOpenRegression: Story = {
  decorators: [withTrashPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Empty' }))
    await page.findByRole('dialog', { name: 'Empty trash?' })
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const EmptyTrashPending: Story = {
  decorators: [withTrashPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    await userEvent.click(await canvas.findByRole('button', { name: 'Empty' }))
    await userEvent.click(await page.findByRole('button', { name: 'Empty trash' }))
    await waitFor(() => {
      if (!page.queryByRole('button', { name: 'Empty trash' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new globalThis.Error('Pending spinner was not rendered.')
      }
    })
  },
}
