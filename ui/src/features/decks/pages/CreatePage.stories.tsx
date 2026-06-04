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
  createDeckService,
  createFolderService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'

import { DeckCreatePage } from './CreatePage'

const workspaceId = 'independent-study'
const folderId = 'reading-notes'
const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const withDeckCreatePage = ({
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
    initialEntry: `/dashboard/${workspaceId}/create.deck`,
    services: () =>
      createStorybookServices({
        decks: createDeckService({ mutationError, mutationLoading }),
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
          pathError: folderPathError,
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    workspaceId,
  },
  component: DeckCreatePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Decks/Pages/CreatePage',
} satisfies Meta<typeof DeckCreatePage>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  decorators: [withDeckCreatePage()],
}

export const MobileEmptyRegression: Story = {
  decorators: [withDeckCreatePage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Create Deck' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const FilledForm: Story = {
  decorators: [withDeckCreatePage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Deck name'), 'Clinical Reasoning')
    await userEvent.type(
      await canvas.findByLabelText('Deck description'),
      'High-yield review cards grouped by clinical topic.',
    )
  },
}

export const CreatePending: Story = {
  decorators: [withDeckCreatePage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Deck name'), 'Clinical Reasoning')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create deck' }))
    await expectButtonPendingSpinner(canvasElement, 'Create deck')
  },
}

export const CreateError: Story = {
  decorators: [
    withDeckCreatePage({
      mutationError: unavailableError('Deck could not be created.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByLabelText('Deck name'), 'Clinical Reasoning')
    await userEvent.click(await canvas.findByRole('button', { name: 'Create deck' }))
    await canvas.findByText('Could not create deck')
    await canvas.findByDisplayValue('Clinical Reasoning')
  },
}

export const NestedFolder: Story = {
  args: {
    folderId,
    workspaceId,
  },
  decorators: [withDeckCreatePage()],
}

export const FolderPathError: Story = {
  args: {
    folderId,
    workspaceId,
  },
  decorators: [
    withDeckCreatePage({
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
    withDeckCreatePage({
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
    withDeckCreatePage({
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
