import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectCompactLocationPath,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { baseFolder, createFolder } from '@/test/storybook/fixtures'
import {
  createFolderService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'

import { FolderCreatePage } from './CreatePage'

const workspaceId = 'independent-study'
const folderId = 'reading-notes'
const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const withFolderCreatePage = ({
  folderPath = ['Academic'],
  folderPathError,
  mutationError,
  mutationLoading = false,
}: {
  folderPath?: string[]
  folderPathError?: DomainError
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/create.folder`,
    services: () =>
      createStorybookServices({
        folders: createFolderService({
          folderPaths: {
            [folderId]: folderPath,
          },
          folders: [
            createFolder({
              ...baseFolder,
              id: folderId,
              parentId: workspaceId,
              workspaceId,
            }),
          ],
          mutationError,
          mutationLoading,
          pathError: folderPathError,
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    workspaceId,
  },
  component: FolderCreatePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Folders/Pages/CreatePage',
} satisfies Meta<typeof FolderCreatePage>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  decorators: [withFolderCreatePage()],
}

export const MobileEmptyRegression: Story = {
  decorators: [withFolderCreatePage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Create Folder' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const FilledForm: Story = {
  decorators: [withFolderCreatePage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Folder name'), 'Comparative History')
    await userEvent.type(
      await canvas.findByLabelText('Folder description'),
      'High-yield decks grouped by clinical topic.',
    )
  },
}

export const CreateRequiredValidation: Story = {
  decorators: [withFolderCreatePage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Create folder' }))
    await canvas.findByText('Name is required.')
  },
}

export const CreatePending: Story = {
  decorators: [withFolderCreatePage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Folder name'), 'Comparative History')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create folder' }))
    await expectButtonPendingSpinner(canvasElement, 'Create folder')
  },
}

export const CreateError: Story = {
  decorators: [
    withFolderCreatePage({
      mutationError: unavailableError('Folder could not be created.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Folder name'), 'Comparative History')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create folder' }))
    await canvas.findByText('Could not create folder')
    await canvas.findByDisplayValue('Comparative History')
  },
}

export const NestedFolder: Story = {
  args: {
    folderId,
    workspaceId,
  },
  decorators: [withFolderCreatePage()],
}

export const FolderPathError: Story = {
  args: {
    folderId,
    workspaceId,
  },
  decorators: [
    withFolderCreatePage({
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
    folderId,
    workspaceId,
  },
  decorators: [
    withFolderCreatePage({
      folderPath: longLocationPath,
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectCompactLocationPath(canvasElement, longLocationPath)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongLocationRegression: Story = {
  args: {
    folderId,
    workspaceId,
  },
  decorators: [
    withFolderCreatePage({
      folderPath: longLocationPath,
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
