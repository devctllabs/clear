import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectCompactLocationPath,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import { baseDeck, createDeckDetail, createFolder } from '@/test/storybook/fixtures'
import {
  createDeckService,
  createFolderService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'
import type { DeckDetail } from '../types/deck.types'

import { DeckEditPage } from './EditPage'

const workspaceId = 'independent-study'
const folderId = 'reading-notes'
const longLocationPath = [
  'Editorial Production',
  'Academic',
  'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
]

const deck = createDeckDetail({
  ...baseDeck,
  id: 'world-history',
  parentId: folderId,
  title: 'World History',
  workspaceId,
})

const longNameDeck = createDeckDetail({
  ...deck,
  id: 'long-deck',
  title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
})

const withDeckEditPage = ({
  deckError,
  deckDetail = deck,
  folderPath = ['Academic'],
  folderPathError,
  loading = false,
  mutationError,
  mutationLoading = false,
}: {
  deckError?: DomainError
  deckDetail?: DeckDetail
  folderPath?: string[]
  folderPathError?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckDetail.id}/edit`,
    services: () =>
      createStorybookServices({
        decks: createDeckService({
          deckDetails: {
            [deckDetail.id]: deckDetail,
          },
          decks: [deckDetail],
          error: deckError,
          loading,
          mutationError,
          mutationLoading,
        }),
        folders: createFolderService({
          folderPaths: {
            [folderId]: folderPath,
          },
          folders: [
            createFolder({
              id: folderId,
              name: 'Academic',
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
    deckId: deck.id,
    workspaceId,
  },
  component: DeckEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Decks/Pages/EditPage',
} satisfies Meta<typeof DeckEditPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withDeckEditPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading editor' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withDeckEditPage()],
}

export const MobileLoadedRegression: Story = {
  decorators: [withDeckEditPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Edit Deck' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withDeckEditPage({
      deckError: unavailableError('Deck storage is temporarily unavailable.'),
    }),
  ],
}

export const SaveError: Story = {
  decorators: [
    withDeckEditPage({
      mutationError: unavailableError('Deck could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Deck name')

    await userEvent.clear(input)
    await userEvent.type(input, 'World History Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await canvas.findByText('Could not save deck')
    await canvas.findByDisplayValue('World History Review')
  },
}

export const SavePending: Story = {
  decorators: [withDeckEditPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText('Deck name')

    await userEvent.clear(input)
    await userEvent.type(input, 'World History Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save changes' }))
    await expectButtonPendingSpinner(canvasElement, 'Save changes')
  },
}

export const FolderPathError: Story = {
  decorators: [
    withDeckEditPage({
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
    deckId: longNameDeck.id,
    workspaceId,
  },
  decorators: [
    withDeckEditPage({
      deckDetail: longNameDeck,
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
    deckId: longNameDeck.id,
    workspaceId,
  },
  decorators: [
    withDeckEditPage({
      deckDetail: longNameDeck,
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
