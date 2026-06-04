import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectElementCentersAlignVertically,
  expectMobileLoadingShell,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
  expectStickySearchHeader,
  setDesktopZoomRegressionViewport,
} from '@/test/storybook/assertions'
import {
  createDeck,
  createFolder,
  createSearchGroup,
  createSearchResult,
  dayMs,
  hourMs,
  timestampAgo,
} from '@/test/storybook/fixtures'
import {
  createContentSearchService,
  createDeckService,
  createFolderService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { SearchResultGroup } from '@features/content-search/types/search.types'
import type { Deck } from '@features/decks'
import { err, type DomainError } from '@shared/errors'
import type { Folder } from '../types/folder.types'

import { FolderDetailPage } from './DetailPage'

const workspaceId = 'independent-study'
const folderId = 'reading-notes'

const folder = createFolder({
  description: 'Methods, research notes, and reading-notes references.',
  id: folderId,
  name: 'Academic',
  parentId: workspaceId,
  updatedAt: timestampAgo(2 * dayMs),
  workspaceId,
})

const childFolders: Folder[] = [
  createFolder({
    description: 'Active clinical cases and diagnostic prompts.',
    id: 'clinical-drafts',
    name: 'Clinical Drafts',
    parentId: folderId,
    updatedAt: timestampAgo(6 * hourMs),
    workspaceId,
  }),
]

const decks: Deck[] = [
  createDeck({
    dueToday: 18,
    id: 'world-history',
    parentId: folderId,
    progress: 72,
    title: 'World History',
    totalNotes: 145,
    updatedAt: timestampAgo(4 * hourMs),
    workspaceId,
  }),
]

const longNameFolder = createFolder({
  ...folder,
  id: 'long-folder',
  name: 'NeuroimmunoendocrinologicalPathophysiologyReferenceArchive',
})

const longNameDecks: Deck[] = [
  createDeck({
    dueToday: 9999,
    id: 'long-deck',
    parentId: longNameFolder.id,
    progress: 148,
    title: 'DifferentialDiagnosisAndCaseReviewCompendiumWithUnbrokenTitle',
    totalNotes: 9999,
    updatedAt: timestampAgo(5 * dayMs),
    workspaceId,
  }),
]

const stickySearchFolders: Folder[] = Array.from({ length: 12 }, (_, index) =>
  createFolder({
    description: `Nested reference folder ${index + 1} for sticky search scroll coverage.`,
    id: `sticky-child-folder-${index + 1}`,
    name: `Nested Folder ${index + 1}`,
    parentId: folderId,
    updatedAt: timestampAgo((index + 1) * hourMs),
    workspaceId,
  }),
)

const stickySearchDecks: Deck[] = Array.from({ length: 12 }, (_, index) =>
  createDeck({
    dueToday: (index * 5) % 23,
    id: `sticky-folder-deck-${index + 1}`,
    parentId: folderId,
    progress: (index * 9) % 100,
    title: `Folder Sticky Deck ${index + 1}`,
    totalNotes: 64 + index * 10,
    updatedAt: timestampAgo((index + 2) * hourMs),
    workspaceId,
  }),
)

const manyFolders: Folder[] = Array.from({ length: 18 }, (_, index) =>
  createFolder({
    description: `Nested study folder ${index + 1} for dense folder detail coverage.`,
    id: `folder-many-child-${index + 1}`,
    name: `Folder Detail Folder ${index + 1}`,
    parentId: folderId,
    updatedAt: timestampAgo((index + 1) * hourMs),
    workspaceId,
  }),
)

const manyDecks: Deck[] = Array.from({ length: 36 }, (_, index) =>
  createDeck({
    dueToday: (index * 4) % 29,
    id: `folder-many-deck-${index + 1}`,
    parentId: folderId,
    progress: (index * 7) % 100,
    title: `Folder Detail Deck ${index + 1}`,
    totalNotes: 80 + index * 9,
    updatedAt: timestampAgo((index + 3) * hourMs),
    workspaceId,
  }),
)

const searchGroups: SearchResultGroup[] = [
  createSearchGroup({
    kind: 'deck',
    results: [
      createSearchResult({
        id: 'world-history',
        kind: 'deck',
        locationPath: ['Editorial Production', 'Academic'],
        title: 'World History',
        updatedAt: timestampAgo(4 * hourMs),
      }),
    ],
  }),
]

const withFolderDetailPage = ({
  contentSearchGroups = [],
  contentSearchError,
  contentSearchLoading = false,
  currentFolder = folder,
  deckMutationError,
  deckMutationLoading = false,
  deckRecords = decks,
  decksError,
  deckListRefreshError,
  folderError,
  folderMutationError,
  folderMutationLoading = false,
  folderRecords = childFolders,
  foldersError,
  folderListRefreshError,
  loading = false,
}: {
  contentSearchGroups?: SearchResultGroup[]
  contentSearchError?: DomainError
  contentSearchLoading?: boolean
  currentFolder?: Folder
  deckMutationError?: DomainError
  deckMutationLoading?: boolean
  deckRecords?: Deck[]
  decksError?: DomainError
  deckListRefreshError?: DomainError
  folderError?: DomainError
  folderMutationError?: DomainError
  folderMutationLoading?: boolean
  folderRecords?: Folder[]
  foldersError?: DomainError
  folderListRefreshError?: DomainError
  loading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/folders/${currentFolder.id}`,
    services: () => {
      const folderService = createFolderService({
        error: folderError,
        folders: [currentFolder, ...folderRecords],
        listRefreshError: folderListRefreshError,
        loading,
        mutationError: folderMutationError,
        mutationLoading: folderMutationLoading,
      })

      return createStorybookServices({
        contentSearch: createContentSearchService({
          error: contentSearchError,
          groups: contentSearchGroups,
          loading: contentSearchLoading,
        }),
        decks: createDeckService({
          decks: deckRecords,
          error: decksError,
          listRefreshError: deckListRefreshError,
          loading,
          mutationError: deckMutationError,
          mutationLoading: deckMutationLoading,
        }),
        folders: foldersError
          ? {
              ...folderService,
              listFolderChildren: async () => err(foldersError),
              listWorkspaceRoot: async () => err(foldersError),
            }
          : folderService,
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      })
    },
  })

const meta = {
  args: {
    folderId,
    workspaceId,
  },
  component: FolderDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Folders/Pages/DetailPage',
} satisfies Meta<typeof FolderDetailPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withFolderDetailPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading folder' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingShellRegression: Story = {
  decorators: [withFolderDetailPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading folder' })
    await expectMobileLoadingShell(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withFolderDetailPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const back = await canvas.findByRole('link', { name: 'Back' })
    const heading = await canvas.findByRole('heading', { name: 'Academic' })

    await expectElementCentersAlignVertically(back, heading)
  },
}

export const MobileLoadedRegression: Story = {
  decorators: [withFolderDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Academic' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DesktopActionsZoomRegression: Story = {
  decorators: [withFolderDetailPage()],
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const shouldAssertZoomRegression = await setDesktopZoomRegressionViewport()

    if (!shouldAssertZoomRegression) {
      return
    }

    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const createButton = await canvas.findByRole('button', { name: 'Create' })
    await canvas.findByRole('button', { name: 'Academic actions' })

    await userEvent.click(createButton)
    await page.findByText('New Item')
    await page.findByRole('menuitem', { name: 'Deck' })
    await page.findByRole('menuitem', { name: 'Folder' })
    await userEvent.keyboard('{Escape}')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const EmptyFolder: Story = {
  decorators: [withFolderDetailPage({ deckRecords: [], folderRecords: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emptyState = await canvas.findByRole('region', {
      name: 'Create your first deck',
    })
    const emptyCanvas = within(emptyState)

    await emptyCanvas.findByText(
      'Create a deck, then add notes to build a review queue.',
    )
    await emptyCanvas.findByRole('button', { name: 'New deck' })
    await emptyCanvas.findByRole('button', { name: 'New folder' })
    await expect(await canvas.findAllByRole('button', { name: 'New folder' })).toHaveLength(1)
    await expect(await canvas.findAllByRole('button', { name: 'New deck' })).toHaveLength(1)
  },
}

export const LoadError: Story = {
  decorators: [
    withFolderDetailPage({
      folderError: unavailableError('Folder storage is temporarily unavailable.'),
    }),
  ],
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withFolderDetailPage({
      folderError: unavailableError('Folder storage is temporarily unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Folder could not be loaded')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const SectionErrors: Story = {
  decorators: [
    withFolderDetailPage({
      deckListRefreshError: unavailableError('Decks are temporarily unavailable.'),
      folderListRefreshError: unavailableError('Folders are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const folderTrigger = await canvas.findByRole('button', {
      name: 'Clinical Drafts actions',
    })

    await userEvent.click(folderTrigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete folder' }))
    await page.findByText('Folders may be out of date')

    const deckTrigger = await canvas.findByRole('button', { name: 'World History actions' })

    await userEvent.click(deckTrigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete deck' }))
    await page.findByText('Decks may be out of date')
  },
}

export const SearchResults: Story = {
  decorators: [withFolderDetailPage({ contentSearchGroups: searchGroups })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'history')
    await canvas.findByRole('heading', { name: 'Search results' })
  },
}

export const SearchLoading: Story = {
  decorators: [withFolderDetailPage({ contentSearchLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'history')
    await canvas.findByRole('heading', { name: 'Search results' })
    await canvas.findByRole('status', { name: 'Searching content' })
  },
}

export const SearchNoResults: Story = {
  decorators: [withFolderDetailPage({ contentSearchGroups: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'zzz')
    await canvas.findByText('No matches in this folder')
    await canvas.findByRole('button', { name: 'Clear search' })
  },
}

export const SearchError: Story = {
  decorators: [
    withFolderDetailPage({
      contentSearchError: unavailableError('Search is temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'history')
    await canvas.findByText('Search could not be completed')
  },
}

export const LongContent: Story = {
  args: {
    folderId: longNameFolder.id,
    workspaceId,
  },
  decorators: [
    withFolderDetailPage({
      currentFolder: longNameFolder,
      deckRecords: longNameDecks,
      folderRecords: [],
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongContentRegression: Story = {
  args: {
    folderId: longNameFolder.id,
    workspaceId,
  },
  decorators: [
    withFolderDetailPage({
      currentFolder: longNameFolder,
      deckRecords: longNameDecks,
      folderRecords: [],
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const ManyItems: Story = {
  decorators: [
    withFolderDetailPage({
      deckRecords: manyDecks,
      folderRecords: manyFolders,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Folders' })
    await canvas.findByRole('heading', { name: 'Decks' })
    await canvas.findByText('Folder Detail Folder 1')
    await canvas.findByText('Folder Detail Folder 18')
    await canvas.findByText('Folder Detail Deck 1')
    await canvas.findByText('Folder Detail Deck 36')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileManyItemsRegression: Story = {
  decorators: [
    withFolderDetailPage({
      deckRecords: manyDecks,
      folderRecords: manyFolders,
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await canvas.findByText('Folder Detail Folder 1')
    await canvas.findByText('Folder Detail Folder 18')
    await canvas.findByText('Folder Detail Deck 1')
    await canvas.findByText('Folder Detail Deck 36')
    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectStickySearchHeader(input, { restoreScroll: false })
  },
}

export const LongListsStickySearch: Story = {
  decorators: [
    withFolderDetailPage({
      deckRecords: stickySearchDecks,
      folderRecords: stickySearchFolders,
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectStickySearchHeader(input, { restoreScroll: false })
  },
}

export const DeleteDialogOpen: Story = {
  decorators: [withFolderDetailPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Academic actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
  },
}

export const MobileDeleteDialogOpenRegression: Story = {
  decorators: [withFolderDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Academic actions' })

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const DeleteFolderError: Story = {
  decorators: [
    withFolderDetailPage({
      folderMutationError: unavailableError('Folder could not be deleted.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Academic actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete folder' }))
    await page.findByText('Could not delete folder')
  },
}

export const DeleteFolderPending: Story = {
  decorators: [withFolderDetailPage({ folderMutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Academic actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete folder' }))
    await expectButtonPendingSpinner(canvasElement.ownerDocument.body, 'Delete folder')
  },
}

export const DeleteDeckError: Story = {
  decorators: [
    withFolderDetailPage({
      deckMutationError: unavailableError('Deck could not be deleted.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'World History actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete deck' }))
    await page.findByText('Could not delete deck')
  },
}

export const DeleteDeckPending: Story = {
  decorators: [withFolderDetailPage({ deckMutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'World History actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete deck' }))
    await expectButtonPendingSpinner(canvasElement.ownerDocument.body, 'Delete deck')
  },
}
