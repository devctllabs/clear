import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectElementsShareDesktopRow,
  expectElementsStackVertically,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
  setDesktopDetailZoomRegressionViewport,
  setDesktopZoomRegressionViewport,
} from '@/test/storybook/assertions'
import {
  createBasicNoteDetail,
  createClozeNoteDetail,
  createDeckDetail,
  dayMs,
  timestampAgo,
} from '@/test/storybook/fixtures'
import {
  createDeckService,
  createNoteService,
  createStorybookServices,
  unavailableError,
  createWorkspaceService,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'
import type { NoteDetail } from '../types/note.types'

import { NoteDetailPage } from './DetailPage'

const workspaceId = 'independent-study'
const deckId = 'world-history'

const deck = createDeckDetail({
  id: deckId,
  title: 'World History',
  workspaceId,
})

const basicNote = {
  ...createBasicNoteDetail({
    deckId,
    id: 'source-corroboration-basic',
    title: 'Source Corroboration',
  }),
} satisfies Extract<NoteDetail, { kind: 'basic' }>

const clozeNote = {
  ...createClozeNoteDetail({
    deckId,
    id: 'collective-memory-cloze',
    title: 'Collective Memory Cloze',
  }),
  cards: [
    {
      clozeId: 'c1',
      dueAt: timestampAgo(-1 * dayMs),
      id: 'collective-memory-cloze:c1',
      progress: 82,
      reviewedAt: timestampAgo(dayMs),
      status: 'mastered',
      title: 'Collective Memory',
    },
  ],
} satisfies Extract<NoteDetail, { kind: 'cloze' }>

const longNameNote = {
  ...basicNote,
  editor: {
    back:
      'A long-form explanation that wraps across multiple lines and should remain readable inside the constrained mobile detail page.',
    front:
      'Explain the neuroimmunoendocrinological feedback loop involved in stress-memory modulation.',
  },
  id: 'long-note',
  title: 'NeuroimmunoendocrinologicalPathophysiologyReviewProtocol',
} satisfies Extract<NoteDetail, { kind: 'basic' }>

const withNoteDetailPage = ({
  loading = false,
  mutationError,
  mutationLoading = false,
  noteError,
  noteDetail = basicNote,
}: {
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  noteError?: DomainError
  noteDetail?: NoteDetail
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteDetail.id}`,
    services: () =>
      createStorybookServices({
        decks: createDeckService({
          deckDetails: {
            [deckId]: deck,
          },
          decks: [deck],
          loading,
        }),
        notes: createNoteService({
          error: noteError,
          loading,
          mutationError,
          mutationLoading,
          noteDetails: [noteDetail],
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    deckId,
    noteId: basicNote.id,
    workspaceId,
  },
  component: NoteDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Notes/Pages/DetailPage',
} satisfies Meta<typeof NoteDetailPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withNoteDetailPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading note' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Basic: Story = {
  decorators: [withNoteDetailPage()],
}

export const MobileBasicRegression: Story = {
  decorators: [withNoteDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Source Corroboration' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DesktopDetailZoomRegression: Story = {
  decorators: [withNoteDetailPage()],
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const shouldAssertDesktopZoom125 = await setDesktopZoomRegressionViewport()

    if (!shouldAssertDesktopZoom125) {
      return
    }

    const canvas = within(canvasElement)
    const noteContent = await canvas.findByRole('region', { name: 'Note content' })
    const metadata = await canvas.findByRole('complementary', { name: 'Note metadata' })

    await expectElementsShareDesktopRow(noteContent, metadata)
    const shouldAssertDesktopZoom150 = await setDesktopDetailZoomRegressionViewport()

    if (!shouldAssertDesktopZoom150) {
      return
    }

    await expectElementsStackVertically(noteContent, metadata)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withNoteDetailPage({
      noteError: unavailableError('Note storage is temporarily unavailable.'),
    }),
  ],
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withNoteDetailPage({
      noteError: unavailableError('Note storage is temporarily unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Note could not be loaded')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const Cloze: Story = {
  args: {
    deckId,
    noteId: clozeNote.id,
    workspaceId,
  },
  decorators: [withNoteDetailPage({ noteDetail: clozeNote })],
}

export const LongContent: Story = {
  args: {
    deckId,
    noteId: longNameNote.id,
    workspaceId,
  },
  decorators: [withNoteDetailPage({ noteDetail: longNameNote })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongContentRegression: Story = {
  args: {
    deckId,
    noteId: longNameNote.id,
    workspaceId,
  },
  decorators: [withNoteDetailPage({ noteDetail: longNameNote })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const DeleteDialogOpen: Story = {
  decorators: [withNoteDetailPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Source Corroboration actions' })

    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
  },
}

export const MobileDeleteDialogOpenRegression: Story = {
  decorators: [withNoteDetailPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = await canvas.findByRole('button', { name: 'Source Corroboration actions' })

    await expectMobileNoHorizontalOverflow(canvasElement)
    await userEvent.click(trigger)
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }))
    await expectMobileNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const DeleteError: Story = {
  decorators: [
    withNoteDetailPage({
      mutationError: unavailableError('Note actions are temporarily unavailable.'),
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

export const DeletePending: Story = {
  decorators: [withNoteDetailPage({ mutationLoading: true })],
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
