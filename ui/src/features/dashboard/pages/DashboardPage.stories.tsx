import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectMobileLoadingShell,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
  expectStickySearchHeader,
  setDesktopZoomRegressionViewport,
} from '@/test/storybook/assertions'
import {
  baseDeck,
  baseFolder,
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
  createWorkspace,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { SearchResultGroup } from '@features/content-search/types/search.types'
import type { Deck } from '@features/decks/types/deck.types'
import type { Folder } from '@features/folders/types/folder.types'
import type { DomainError } from '@shared/errors'

import { DashboardPage } from './DashboardPage'

const workspaceId = 'independent-study'

const folders: Folder[] = [
  createFolder({
    description: 'Methods, research notes, and reading-notes references.',
    id: 'reading-notes',
    name: 'Academic',
    parentId: workspaceId,
    updatedAt: timestampAgo(2 * dayMs),
    workspaceId,
  }),
  createFolder({
    description: 'Active clinical cases and diagnostic prompts.',
    id: 'clinical-drafts',
    name: 'Clinical Drafts',
    parentId: workspaceId,
    updatedAt: timestampAgo(6 * hourMs),
    workspaceId,
  }),
]

const decks: Deck[] = [
  createDeck({
    ...baseDeck,
    id: 'world-history',
    parentId: workspaceId,
    title: 'World History',
    updatedAt: timestampAgo(4 * hourMs),
    workspaceId,
  }),
  createDeck({
    dueToday: 9,
    icon: 'brain',
    id: 'civic-vocabulary',
    parentId: workspaceId,
    progress: 48,
    title: 'Civic Vocabulary',
    totalNotes: 96,
    updatedAt: timestampAgo(18 * hourMs),
    workspaceId,
  }),
]

const longNameFolders: Folder[] = [
  createFolder({
    id: 'long-folder',
    name: 'NeuroimmunoendocrinologicalPathophysiologyReferenceArchive',
    parentId: workspaceId,
    updatedAt: timestampAgo(5 * dayMs),
    workspaceId,
  }),
]

const longNameDecks: Deck[] = [
  createDeck({
    dueToday: 9999,
    id: 'long-deck',
    parentId: workspaceId,
    progress: 148,
    title: 'DifferentialDiagnosisAndCaseReviewCompendiumWithUnbrokenTitle',
    totalNotes: 9999,
    updatedAt: timestampAgo(5 * dayMs),
    workspaceId,
  }),
]

const stickySearchFolders: Folder[] = Array.from({ length: 14 }, (_, index) =>
  createFolder({
    description: `Reference folder ${index + 1} for sticky search scroll coverage.`,
    id: `sticky-folder-${index + 1}`,
    name: `Reference Folder ${index + 1}`,
    parentId: workspaceId,
    updatedAt: timestampAgo((index + 1) * hourMs),
    workspaceId,
  }),
)

const stickySearchDecks: Deck[] = Array.from({ length: 14 }, (_, index) =>
  createDeck({
    dueToday: (index * 3) % 19,
    id: `sticky-deck-${index + 1}`,
    parentId: workspaceId,
    progress: (index * 11) % 100,
    title: `Sticky Search Deck ${index + 1}`,
    totalNotes: 80 + index * 12,
    updatedAt: timestampAgo((index + 2) * hourMs),
    workspaceId,
  }),
)

const manyFolders: Folder[] = Array.from({ length: 18 }, (_, index) =>
  createFolder({
    description: `Study area ${index + 1} for a dense dashboard list.`,
    id: `dashboard-many-folder-${index + 1}`,
    name: `Dashboard Folder ${index + 1}`,
    parentId: workspaceId,
    updatedAt: timestampAgo((index + 1) * hourMs),
    workspaceId,
  }),
)

const manyDecks: Deck[] = Array.from({ length: 36 }, (_, index) =>
  createDeck({
    dueToday: (index * 4) % 31,
    id: `dashboard-many-deck-${index + 1}`,
    parentId: workspaceId,
    progress: (index * 7) % 100,
    title: `Dashboard Deck ${index + 1}`,
    totalNotes: 72 + index * 8,
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
  createSearchGroup({
    kind: 'note',
    results: [
      createSearchResult({
        id: 'collective-memory',
        kind: 'note',
        noteKind: 'cloze',
        deckId: 'world-history',
        locationPath: ['Editorial Production', 'Academic', 'World History'],
        title: 'Collective Memory',
        updatedAt: timestampAgo(dayMs),
        workspaceId,
      }),
    ],
  }),
]

const withDashboardPage = ({
  contentSearchGroups = [],
  contentSearchError,
  contentSearchLoading = false,
  deckMutationError,
  deckMutationLoading = false,
  deckRecords = decks,
  decksError,
  deckListRefreshError,
  folderMutationError,
  folderMutationLoading = false,
  folderRecords = folders,
  foldersError,
  folderListRefreshError,
  loading = false,
  activeWorkspaceId = workspaceId,
  workspaceMutationError,
  workspaceMutationLoading = false,
  workspaceError,
}: {
  contentSearchGroups?: SearchResultGroup[]
  contentSearchError?: DomainError
  contentSearchLoading?: boolean
  deckMutationError?: DomainError
  deckMutationLoading?: boolean
  deckRecords?: Deck[]
  decksError?: DomainError
  deckListRefreshError?: DomainError
  folderMutationError?: DomainError
  folderMutationLoading?: boolean
  folderRecords?: Folder[]
  foldersError?: DomainError
  folderListRefreshError?: DomainError
  loading?: boolean
  activeWorkspaceId?: string
  workspaceMutationError?: DomainError
  workspaceMutationLoading?: boolean
  workspaceError?: DomainError
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}`,
    services: () =>
      createStorybookServices({
        contentSearch: createContentSearchService({
          error: contentSearchError,
          groups: contentSearchGroups,
          loading: contentSearchLoading,
        }),
        decks: createDeckService({
          deckDetails: {
            [baseDeck.id]: baseDeck,
          },
          decks: deckRecords,
          error: decksError,
          listRefreshError: deckListRefreshError,
          loading,
          mutationError: deckMutationError,
          mutationLoading: deckMutationLoading,
        }),
        folders: createFolderService({
          error: foldersError,
          folderPaths: {
            [baseFolder.id]: ['Academic'],
          },
          folders: folderRecords,
          listRefreshError: folderListRefreshError,
          loading,
          mutationError: folderMutationError,
          mutationLoading: folderMutationLoading,
        }),
        workspaces: createWorkspaceService({
          activeWorkspaceId,
          error: workspaceError,
          loading,
          mutationError: workspaceMutationError,
          mutationLoading: workspaceMutationLoading,
          workspaces: [
            createWorkspace({
              description: 'Continue your path to mastery.',
              id: workspaceId,
              title: 'Editorial Production',
            }),
          ],
        }),
      }),
  })

const meta = {
  args: {
    workspaceId,
  },
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Dashboard/Pages/DashboardPage',
} satisfies Meta<typeof DashboardPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withDashboardPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading dashboard' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingShellRegression: Story = {
  decorators: [withDashboardPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading dashboard' })
    await expectMobileLoadingShell(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withDashboardPage()],
}

export const MobileLoadedRegression: Story = {
  decorators: [withDashboardPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Editorial Production' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const MobileCreateMenuLayoutStabilityRegression: Story = {
  decorators: [withDashboardPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const heading = await canvas.findByRole('heading', { name: 'Editorial Production' })
    const createButton = await canvas.findByRole('button', { name: 'Create' })
    const headingLeft = heading.getBoundingClientRect().left

    await userEvent.click(createButton)
    await page.findByText('New Item')

    await waitFor(() => {
      const nextHeadingLeft = heading.getBoundingClientRect().left

      expect(Math.abs(nextHeadingLeft - headingLeft)).toBeLessThanOrEqual(1)
    })
    await userEvent.keyboard('{Escape}')
  },
}

export const DesktopActionsZoomRegression: Story = {
  decorators: [withDashboardPage()],
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const shouldAssertZoomRegression = await setDesktopZoomRegressionViewport()

    if (!shouldAssertZoomRegression) {
      return
    }

    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const createButton = await canvas.findByRole('button', { name: 'Create' })
    await canvas.findByRole('button', { name: 'Editorial Production actions' })

    await userEvent.click(createButton)
    await page.findByText('New Item')
    await page.findByRole('menuitem', { name: 'Deck' })
    await page.findByRole('menuitem', { name: 'Folder' })
    await userEvent.keyboard('{Escape}')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const EmptyWorkspace: Story = {
  decorators: [withDashboardPage({ deckRecords: [], folderRecords: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emptyState = await canvas.findByRole('region', { name: 'Create your first deck' })
    const emptyCanvas = within(emptyState)

    await emptyCanvas.findByText(
      'Create a deck, then add notes to build your review queue.',
    )
    await emptyCanvas.findByRole('button', { name: 'New deck' })
    await emptyCanvas.findByRole('button', { name: 'New folder' })
    await expect(await canvas.findAllByRole('button', { name: 'New folder' })).toHaveLength(1)
    await expect(await canvas.findAllByRole('button', { name: 'New deck' })).toHaveLength(1)
    await canvas.findByRole('button', { name: 'Editorial Production actions' })
    await expect(canvas.queryByRole('button', { name: 'Create' })).toBeNull()
  },
}

export const LoadError: Story = {
  decorators: [
    withDashboardPage({
      workspaceError: unavailableError('Workspace storage is temporarily unavailable.'),
    }),
  ],
}

export const SectionErrors: Story = {
  decorators: [
    withDashboardPage({
      deckListRefreshError: unavailableError('Decks are temporarily unavailable.'),
      folderListRefreshError: unavailableError('Folders are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const folderTrigger = await canvas.findByRole('button', { name: 'Academic actions' })

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

export const DeleteFolderError: Story = {
  decorators: [
    withDashboardPage({
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
  decorators: [withDashboardPage({ folderMutationLoading: true })],
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
    withDashboardPage({
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
  decorators: [withDashboardPage({ deckMutationLoading: true })],
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

export const DeleteWorkspaceError: Story = {
  decorators: [
    withDashboardPage({
      workspaceMutationError: unavailableError('Workspace could not be deleted.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Editorial Production actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete workspace' }))
    await page.findByText('Could not delete workspace')
  },
}

export const DeleteWorkspacePending: Story = {
  decorators: [withDashboardPage({ workspaceMutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Editorial Production actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete workspace' }))
    await expectButtonPendingSpinner(canvasElement.ownerDocument.body, 'Delete workspace')
  },
}

export const SearchResults: Story = {
  decorators: [withDashboardPage({ contentSearchGroups: searchGroups })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByRole('heading', { name: 'Search results' })
  },
}

export const SearchLoading: Story = {
  decorators: [withDashboardPage({ contentSearchLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByRole('heading', { name: 'Search results' })
    await canvas.findByRole('status', { name: 'Searching content' })
  },
}

export const SearchNoResults: Story = {
  decorators: [withDashboardPage({ contentSearchGroups: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'zzz')
    await canvas.findByText('No matches in this workspace')
    await canvas.findByRole('button', { name: 'Clear search' })
  },
}

export const SearchError: Story = {
  decorators: [
    withDashboardPage({
      contentSearchError: unavailableError('Search is temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search folders, decks, and notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByText('Search could not be completed')
  },
}

export const LongContent: Story = {
  decorators: [
    withDashboardPage({
      deckRecords: longNameDecks,
      folderRecords: longNameFolders,
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongContentRegression: Story = {
  decorators: [
    withDashboardPage({
      deckRecords: longNameDecks,
      folderRecords: longNameFolders,
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
    withDashboardPage({
      deckRecords: manyDecks,
      folderRecords: manyFolders,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Folders' })
    await canvas.findByRole('heading', { name: 'Decks' })
    await canvas.findByText('Dashboard Folder 1')
    await canvas.findByText('Dashboard Folder 18')
    await canvas.findByText('Dashboard Deck 1')
    await canvas.findByText('Dashboard Deck 36')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileManyItemsRegression: Story = {
  decorators: [
    withDashboardPage({
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

    await canvas.findByText('Dashboard Folder 1')
    await canvas.findByText('Dashboard Folder 18')
    await canvas.findByText('Dashboard Deck 1')
    await canvas.findByText('Dashboard Deck 36')
    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectStickySearchHeader(input, { restoreScroll: false })
  },
}

export const LongListsStickySearch: Story = {
  decorators: [
    withDashboardPage({
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
