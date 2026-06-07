import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createBasicNoteDetail,
  createClozeNoteDetail,
  createDeckDetail,
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

import { NoteEditorPage } from './EditorPage'

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
  cards: [],
} satisfies Extract<NoteDetail, { kind: 'cloze' }>

const withNoteEditorPage = ({
  deckError,
  loading = false,
  mutationError,
  mutationLoading = false,
  noteError,
  noteDetail = basicNote,
}: {
  deckError?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  noteError?: DomainError
  noteDetail?: NoteDetail
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteDetail.id}/edit`,
    services: () =>
      createStorybookServices({
        decks: createDeckService({
          deckDetails: {
            [deckId]: deck,
          },
          decks: [deck],
          error: deckError,
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
    kind: 'basic',
    mode: 'create',
    workspaceId,
  },
  component: NoteEditorPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Notes/Pages/EditPage',
} satisfies Meta<typeof NoteEditorPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading note editor' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const BasicCreate: Story = {
  decorators: [withNoteEditorPage()],
}

export const BasicCreateRequiredValidation: Story = {
  decorators: [withNoteEditorPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Front is required.')
    await canvas.findByText('Back is required.')
  },
}

export const MobileBasicCreateRegression: Story = {
  decorators: [withNoteEditorPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'New Note' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [
    withNoteEditorPage({
      noteError: unavailableError('Note storage is temporarily unavailable.'),
    }),
  ],
}

export const SaveError: Story = {
  decorators: [
    withNoteEditorPage({
      mutationError: unavailableError('Note could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByPlaceholderText('Add a note title'), 'Memory Consolidation')
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter front side'),
      'Which structure is central to memory consolidation?',
    )
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter back side'),
      'The hippocampus consolidates short-term memories into long-term memory.',
    )
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Could not create note')
  },
}

export const Submitting: Story = {
  decorators: [withNoteEditorPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByPlaceholderText('Add a note title'), 'Memory Consolidation')
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter front side'),
      'Which structure is central to memory consolidation?',
    )
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter back side'),
      'The hippocampus consolidates short-term memories into long-term memory.',
    )
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await expectButtonPendingSpinner(canvasElement, 'Save note')
  },
}

export const EditSaveError: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [
    withNoteEditorPage({
      mutationError: unavailableError('Note could not be saved.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titleInput = await canvas.findByPlaceholderText('Add a note title')

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Source Corroboration Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Could not save note')
    await canvas.findByDisplayValue('Source Corroboration Review')
  },
}

export const EditSubmitting: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage({ mutationLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titleInput = await canvas.findByPlaceholderText('Add a note title')

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Source Corroboration Review')
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await expectButtonPendingSpinner(canvasElement, 'Save note')
  },
}

export const BasicCreateFilled: Story = {
  decorators: [withNoteEditorPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByPlaceholderText('Add a note title'), 'Memory Consolidation')
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter front side'),
      'Which structure is central to memory consolidation?',
    )
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter back side'),
      'The hippocampus consolidates short-term memories into long-term memory.',
    )
  },
}

export const MobileBasicCreateFilledRegression: Story = {
  decorators: [withNoteEditorPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByPlaceholderText('Add a note title'), 'Memory Consolidation')
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter front side'),
      'Which structure is central to memory consolidation?',
    )
    await userEvent.type(
      await canvas.findByPlaceholderText('Enter back side'),
      'The hippocampus consolidates short-term memories into long-term memory.',
    )
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const ClozeCreate: Story = {
  args: {
    deckId,
    kind: 'cloze',
    mode: 'create',
    workspaceId,
  },
  decorators: [withNoteEditorPage()],
}

export const ClozeCreateRequiredValidation: Story = {
  args: {
    deckId,
    kind: 'cloze',
    mode: 'create',
    workspaceId,
  },
  decorators: [withNoteEditorPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Note body is required.')
  },
}

export const BasicEdit: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage()],
}

export const BasicEditRequiredValidation: Story = {
  args: {
    deckId,
    kind: 'basic',
    mode: 'edit',
    noteId: basicNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const front = await canvas.findByLabelText('Front')

    await userEvent.clear(front)
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Front is required.')
  },
}

export const ClozeEdit: Story = {
  args: {
    deckId,
    kind: 'cloze',
    mode: 'edit',
    noteId: clozeNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage({ noteDetail: clozeNote })],
}

export const ClozeEditRequiredValidation: Story = {
  args: {
    deckId,
    kind: 'cloze',
    mode: 'edit',
    noteId: clozeNote.id,
    workspaceId,
  },
  decorators: [withNoteEditorPage({ noteDetail: clozeNote })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = await canvas.findByLabelText('Note body')

    await userEvent.clear(body)
    await userEvent.click(await canvas.findByRole('button', { name: 'Save note' }))
    await canvas.findByText('Note body is required.')
  },
}
