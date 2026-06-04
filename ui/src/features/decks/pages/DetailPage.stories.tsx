import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectElementCentersAlignVertically,
  expectElementsShareDesktopRow,
  expectElementsStackVertically,
  expectMobileLoadingShell,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
  expectStickySearchHeader,
  setDesktopDetailZoomRegressionViewport,
  setDesktopZoomRegressionViewport,
} from '@/test/storybook/assertions'
import {
  createBasicNoteDetail,
  createClozeNoteDetail,
  createDeckDetail,
  createSearchGroup,
  createSearchResult,
  dayMs,
  hourMs,
  timestampAgo,
} from '@/test/storybook/fixtures'
import {
  createContentSearchService,
  createDeckService,
  createNoteService,
  createStorybookServices,
  createWorkspaceService,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { SearchResultGroup } from '@features/content-search/types/search.types'
import type { NoteDetail } from '@features/notes'
import type { DomainError } from '@shared/errors'
import type { DeckDetail } from '../types/deck.types'

import { DeckDetailPage } from './DetailPage'

const workspaceId = 'independent-study'
const deckId = 'world-history'

const deck = createDeckDetail({
  description: 'High-yield review cards for daily study.',
  dueToday: 18,
  id: deckId,
  parentId: workspaceId,
  progress: 72,
  title: 'World History',
  totalNotes: 145,
  updatedAt: timestampAgo(4 * hourMs),
  workspaceId,
})

const noteDetails: NoteDetail[] = [
  createBasicNoteDetail({
    deckId,
    id: 'source-corroboration-basic',
    title: 'Source Corroboration',
    updatedAt: timestampAgo(45 * hourMs),
  }),
  createClozeNoteDetail({
    deckId,
    id: 'collective-memory-cloze',
    title: 'Collective Memory Cloze',
    updatedAt: timestampAgo(dayMs),
  }),
]

const longNameNotes: NoteDetail[] = [
  createBasicNoteDetail({
    deckId,
    id: 'long-note',
    title: 'NeuroimmunoendocrinologicalPathophysiologyReviewProtocol',
    updatedAt: timestampAgo(5 * dayMs),
  }),
]

const stickySearchNotes: NoteDetail[] = Array.from({ length: 28 }, (_, index) => {
  const noteId = `sticky-note-${index + 1}`
  const noteTitle = `Sticky Search Note ${index + 1}`
  const updatedAt = timestampAgo((index + 1) * hourMs)

  if (index % 2 === 0) {
    return createBasicNoteDetail({
      deckId,
      id: noteId,
      title: noteTitle,
      updatedAt,
    })
  }

  return createClozeNoteDetail({
    deckId,
    id: noteId,
    title: noteTitle,
    updatedAt,
  })
})

const manyNotes: NoteDetail[] = Array.from({ length: 48 }, (_, index) => {
  const noteId = `deck-many-note-${index + 1}`
  const noteTitle = `Deck Detail Note ${index + 1}`
  const updatedAt = timestampAgo((index + 1) * hourMs)

  if (index % 2 === 0) {
    return createBasicNoteDetail({
      deckId,
      id: noteId,
      title: noteTitle,
      updatedAt,
    })
  }

  return createClozeNoteDetail({
    deckId,
    id: noteId,
    title: noteTitle,
    updatedAt,
  })
})

const searchGroups: SearchResultGroup[] = [
  createSearchGroup({
    kind: 'note',
    results: [
      createSearchResult({
        id: 'collective-memory-cloze',
        kind: 'note',
        noteKind: 'cloze',
        deckId,
        locationPath: ['Editorial Production', 'World History'],
        title: 'Collective Memory Cloze',
        updatedAt: timestampAgo(dayMs),
        workspaceId,
      }),
    ],
  }),
]

const withDeckDetailPage = ({
  contentSearchGroups = [],
  contentSearchError,
  contentSearchLoading = false,
  deckDetail = deck,
  deckError,
  deckMutationError,
  deckMutationLoading = false,
  loading = false,
  noteMutationError,
  noteMutationLoading = false,
  noteRecords = noteDetails,
  notesError,
  notesRefreshError,
}: {
  contentSearchGroups?: SearchResultGroup[]
  contentSearchError?: DomainError
  contentSearchLoading?: boolean
  deckDetail?: DeckDetail
  deckError?: DomainError
  deckMutationError?: DomainError
  deckMutationLoading?: boolean
  loading?: boolean
  noteMutationError?: DomainError
  noteMutationLoading?: boolean
  noteRecords?: NoteDetail[]
  notesError?: DomainError
  notesRefreshError?: DomainError
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckDetail.id}`,
    services: () =>
      createStorybookServices({
        contentSearch: createContentSearchService({
          error: contentSearchError,
          groups: contentSearchGroups,
          loading: contentSearchLoading,
        }),
        decks: createDeckService({
          deckDetails: {
            [deckDetail.id]: deckDetail,
          },
          decks: [deckDetail],
          error: deckError,
          loading,
          mutationError: deckMutationError,
          mutationLoading: deckMutationLoading,
        }),
        notes: createNoteService({
          error: notesError,
          listRefreshError: notesRefreshError,
          loading,
          mutationError: noteMutationError,
          mutationLoading: noteMutationLoading,
          noteDetails: noteRecords,
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    deckId,
    workspaceId,
  },
  component: DeckDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Decks/Pages/DetailPage',
} satisfies Meta<typeof DeckDetailPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withDeckDetailPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading deck' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingShellRegression: Story = {
  decorators: [withDeckDetailPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading deck' })
    await expectMobileLoadingShell(canvasElement)
  },
}

export const Loaded: Story = {
  decorators: [withDeckDetailPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const back = await canvas.findByRole('link', { name: 'Back' })
    const heading = await canvas.findByRole('heading', { name: 'World History' })

    await expectElementCentersAlignVertically(back, heading)
  },
}

export const MobileLoadedRegression: Story = {
  decorators: [withDeckDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'World History' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DesktopDetailZoomRegression: Story = {
  decorators: [withDeckDetailPage()],
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const shouldAssertDesktopZoom125 = await setDesktopZoomRegressionViewport()

    if (!shouldAssertDesktopZoom125) {
      return
    }

    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')
    const notesSection = input.closest('[aria-label="Deck notes search"]')
    const overview = await canvas.findByRole('complementary', { name: 'Deck overview' })

    if (!(notesSection instanceof HTMLElement) || !(overview instanceof HTMLElement)) {
      throw new globalThis.Error('Expected deck detail desktop sections to be rendered.')
    }

    await expectElementsShareDesktopRow(notesSection, overview)
    const shouldAssertDesktopZoom150 = await setDesktopDetailZoomRegressionViewport()

    if (!shouldAssertDesktopZoom150) {
      return
    }

    await expectElementsStackVertically(overview, notesSection)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const EmptyNotes: Story = {
  decorators: [withDeckDetailPage({ noteRecords: [] })],
  play: async ({ canvasElement }) => {
    const shouldAssertDesktopLayout = await setDesktopZoomRegressionViewport()
    const canvas = within(canvasElement)
    const emptyState = await canvas.findByRole('region', { name: 'This deck is empty' })
    const emptyCanvas = within(emptyState)

    await emptyCanvas.findByText(
      'Add a note so this deck has material to review.',
    )
    await emptyCanvas.findByRole('button', { name: 'Basic' })
    await emptyCanvas.findByRole('button', { name: 'Cloze' })
    expect(canvas.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument()

    if (!shouldAssertDesktopLayout) {
      return
    }

    const overview = await canvas.findByRole('complementary', { name: 'Deck overview' })

    await waitFor(() => {
      const emptyBottom = Math.round(emptyState.getBoundingClientRect().bottom)
      const overviewBottom = Math.round(overview.getBoundingClientRect().bottom)

      expect(emptyBottom).toBe(overviewBottom)
    })
  },
}

export const LoadError: Story = {
  decorators: [
    withDeckDetailPage({
      deckError: unavailableError('Deck storage is temporarily unavailable.'),
    }),
  ],
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withDeckDetailPage({
      deckError: unavailableError('Deck storage is temporarily unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Deck could not be loaded')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const NotesRefreshError: Story = {
  decorators: [
    withDeckDetailPage({
      notesRefreshError: unavailableError('Notes are temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Source Corroboration actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete note' }))
    await page.findByText('Notes may be out of date')
  },
}

export const SearchResults: Story = {
  decorators: [withDeckDetailPage({ contentSearchGroups: searchGroups })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByRole('heading', { name: 'Search results' })
  },
}

export const SearchLoading: Story = {
  decorators: [withDeckDetailPage({ contentSearchLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByRole('heading', { name: 'Search results' })
    await canvas.findByRole('status', { name: 'Searching content' })
  },
}

export const SearchNoResults: Story = {
  decorators: [withDeckDetailPage({ contentSearchGroups: [] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await userEvent.type(input, 'zzz')
    await canvas.findByText('No matching notes')
    await canvas.findByRole('button', { name: 'Clear search' })
  },
}

export const SearchError: Story = {
  decorators: [
    withDeckDetailPage({
      contentSearchError: unavailableError('Search is temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await userEvent.type(input, 'memory')
    await canvas.findByText('Search could not be completed')
  },
}

export const LongContent: Story = {
  args: {
    deckId: 'long-deck',
    workspaceId,
  },
  decorators: [
    withDeckDetailPage({
      deckDetail: createDeckDetail({
        ...deck,
        id: 'long-deck',
        title: 'DifferentialDiagnosisAndCaseReviewCompendiumWithUnbrokenTitle',
      }),
      noteRecords: longNameNotes.map((note) => ({ ...note, deckId: 'long-deck' })),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongContentRegression: Story = {
  args: {
    deckId: 'long-deck',
    workspaceId,
  },
  decorators: [
    withDeckDetailPage({
      deckDetail: createDeckDetail({
        ...deck,
        id: 'long-deck',
        title: 'DifferentialDiagnosisAndCaseReviewCompendiumWithUnbrokenTitle',
      }),
      noteRecords: longNameNotes.map((note) => ({ ...note, deckId: 'long-deck' })),
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
    withDeckDetailPage({
      noteRecords: manyNotes,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Notes' })
    await canvas.findByText('Deck Detail Note 1')
    await canvas.findByText('Deck Detail Note 48')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileManyItemsRegression: Story = {
  decorators: [
    withDeckDetailPage({
      noteRecords: manyNotes,
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await canvas.findByText('Deck Detail Note 1')
    await canvas.findByText('Deck Detail Note 48')
    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectStickySearchHeader(input, { restoreScroll: false })
  },
}

export const LongNotesStickySearch: Story = {
  decorators: [
    withDeckDetailPage({
      noteRecords: stickySearchNotes,
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByPlaceholderText('Search notes…')

    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectStickySearchHeader(input, { restoreScroll: false })
  },
}

export const DeleteDialogOpen: Story = {
  decorators: [withDeckDetailPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'World History actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
  },
}

export const MobileDeleteDialogOpenRegression: Story = {
  decorators: [withDeckDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'World History actions' })

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const DeleteDeckError: Story = {
  decorators: [
    withDeckDetailPage({
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
  decorators: [withDeckDetailPage({ deckMutationLoading: true })],
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

export const DeleteNoteError: Story = {
  decorators: [
    withDeckDetailPage({
      noteMutationError: unavailableError('Note could not be deleted.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Source Corroboration actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete note' }))
    await page.findByText('Could not delete note')
  },
}

export const DeleteNotePending: Story = {
  decorators: [withDeckDetailPage({ noteMutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Source Corroboration actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await userEvent.click(await page.findByRole('button', { name: 'Delete note' }))
    await expectButtonPendingSpinner(canvasElement.ownerDocument.body, 'Delete note')
  },
}
