import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { dayMs, hourMs, noop, timestampAgo } from '@/test/storybook/fixtures'

import type { TrashItem } from '../types/trash.types'

import { WorkspaceTrashList } from './WorkspaceTrashList'

const trashItems: TrashItem[] = [
  {
    deletedAt: timestampAgo(4 * hourMs),
    id: 'world-history',
    kind: 'deck',
    locationPath: ['Editorial Production', 'Academic'],
    title: 'World History',
  },
  {
    deletedAt: timestampAgo(2 * dayMs),
    id: 'sampling-error-notes',
    kind: 'note',
    locationPath: ['Editorial Production', 'Academic', 'World History'],
    title: 'Sampling Error Notes',
  },
  {
    deletedAt: timestampAgo(6 * dayMs),
    id: 'reading-archive',
    kind: 'workspace',
    locationPath: ['Workspaces'],
    title: 'Research Archive',
  },
]

const meta = {
  args: {
    items: trashItems,
    onDeleteRequest: noop,
    onRestore: noop,
  },
  component: WorkspaceTrashList,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Trash/Components/WorkspaceTrashList',
} satisfies Meta<typeof WorkspaceTrashList>

export default meta

type Story = StoryObj<typeof meta>

export const ManyItems: Story = {}

export const SingleItem: Story = {
  args: {
    items: [trashItems[0]],
  },
}

export const Restoring: Story = {
  args: {
    restoringItemId: 'sampling-error-notes',
    showRestoringSpinner: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Restoring Sampling Error Notes' })
  },
}

export const LongNames: Story = {
  args: {
    items: [
      {
        deletedAt: timestampAgo(12 * dayMs),
        id: 'long-deck',
        kind: 'deck',
        locationPath: [
          'EditorialProduction',
          'Academic',
          'ClinicalNeuroanatomyDifferentialDiagnosisAndCaseReviewArchive',
        ],
        title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
