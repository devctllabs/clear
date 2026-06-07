import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectCompactLocationPath,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { createFolder } from '@/test/storybook/fixtures'
import {
  createFolderService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'
import type { Folder } from '../types/folder.types'

import { FolderEditPage } from './EditPage'

const workspaceId = 'independent-study'
const parentId = 'reading-notes'
const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const folder = createFolder({
  description: 'Active clinical cases and diagnostic prompts.',
  id: 'clinical-drafts',
  name: 'Clinical Drafts',
  parentId,
  workspaceId,
})

const longNameFolder = createFolder({
  ...folder,
  id: 'long-folder',
  name: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
})

const withFolderEditPage = ({
  folderError,
  folderPath = ['Academic'],
  folderPathError,
  folderRecord = folder,
  loading = false,
  mutationError,
  mutationLoading = false,
}: {
  folderError?: DomainError
  folderPath?: string[]
  folderPathError?: DomainError
  folderRecord?: Folder
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/folders/${folderRecord.id}/edit`,
    services: () =>
      createStorybookServices({
        folders: createFolderService({
          error: folderError,
          folderPaths: {
            [parentId]: folderPath,
          },
          folders: [
            createFolder({
              id: parentId,
              name: 'Academic',
              parentId: workspaceId,
              workspaceId,
            }),
            folderRecord,
          ],
          loading,
          mutationError,
          mutationLoading,
          pathError: folderPathError,
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    folderId: folder.id,
    workspaceId,
  },
  component: FolderEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Folders/Pages/EditPage',
} satisfies Meta<typeof FolderEditPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withFolderEditPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading editor' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withFolderEditPage()],
}

export const MobileLoadedRegression: Story = {
  decorators: [withFolderEditPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Edit Folder' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withFolderEditPage({
      folderError: unavailableError('Folder storage is temporarily unavailable.'),
    }),
  ],
}

export const SaveError: Story = {
  decorators: [
    withFolderEditPage({
      mutationError: unavailableError('Folder could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Folder name')

    await userEvent.clear(input)
    await userEvent.type(input, 'Clinical Drafts Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await canvas.findByText('Could not save folder')
    await canvas.findByDisplayValue('Clinical Drafts Review')
  },
}

export const SaveRequiredValidation: Story = {
  decorators: [withFolderEditPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Folder name')

    await userEvent.clear(input)
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await canvas.findByText('Name is required.')
  },
}

export const SavePending: Story = {
  decorators: [withFolderEditPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Folder name')

    await userEvent.clear(input)
    await userEvent.type(input, 'Clinical Drafts Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await expectButtonPendingSpinner(canvasElement, 'Save changes')
  },
}

export const FolderPathError: Story = {
  decorators: [
    withFolderEditPage({
      folderPathError: unavailableError('Folder path is temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Could not load folder path')
  },
}

export const LongLocation: Story = {
  args: {
    folderId: longNameFolder.id,
    workspaceId,
  },
  decorators: [
    withFolderEditPage({
      folderPath: longLocationPath,
      folderRecord: longNameFolder,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByDisplayValue(longNameFolder.name)
    await expectCompactLocationPath(canvasElement, longLocationPath)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongLocationRegression: Story = {
  args: {
    folderId: longNameFolder.id,
    workspaceId,
  },
  decorators: [
    withFolderEditPage({
      folderPath: longLocationPath,
      folderRecord: longNameFolder,
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectCompactLocationPath(canvasElement, longLocationPath)
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}
