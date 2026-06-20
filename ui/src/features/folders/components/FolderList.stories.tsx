import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { createFolder, dayMs, hourMs, noop, timestampAgo } from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import { FolderList } from './FolderList'

const baseFolders = [
  createFolder({
    id: 'reading-notes',
    name: 'Academic',
    updatedAt: timestampAgo(4 * hourMs),
  }),
  createFolder({
    id: 'reference',
    name: 'Professional',
    updatedAt: timestampAgo(2 * dayMs),
  }),
  createFolder({
    id: 'language-lab',
    name: 'Language Lab',
    updatedAt: timestampAgo(8 * dayMs),
  }),
]

const meta = {
  args: {
    folders: baseFolders,
    onDelete: noop,
    onSortChange: noop,
    sort: {
      direction: 'desc',
      field: 'updatedAt',
    },
    workspaceId: 'independent-study',
  },
  component: FolderList,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Folders/Components/FolderList',
} satisfies Meta<typeof FolderList>

export default meta

type Story = StoryObj<typeof meta>

export const ManyItems: Story = {}

export const SingleItem: Story = {
  args: {
    folders: [baseFolders[0]],
  },
}

export const LongNames: Story = {
  args: {
    folders: [
      createFolder({
        id: 'long-folder',
        name: 'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
        updatedAt: timestampAgo(23 * hourMs),
      }),
      createFolder({
        id: 'unbroken-folder',
        name: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
        updatedAt: timestampAgo(12 * dayMs),
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Empty: Story = {
  args: {
    folders: [],
  },
}
