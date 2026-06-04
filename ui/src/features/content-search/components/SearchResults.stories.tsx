import type { Meta, StoryObj } from '@storybook/react-vite'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import {
  createSearchGroup,
  createSearchResult,
  dayMs,
  hourMs,
  timestampAgo,
} from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'

import { SearchResults } from './SearchResults'

const mixedGroups = [
  createSearchGroup({
    kind: 'deck',
    results: [
      createSearchResult({
        id: 'world-history',
        kind: 'deck',
        title: 'World History',
        updatedAt: timestampAgo(3 * hourMs),
      }),
    ],
  }),
  createSearchGroup({
    kind: 'folder',
    results: [
      createSearchResult({
        id: 'reading-notes',
        kind: 'folder',
        locationPath: ['Independent Study'],
        title: 'Reading Notes',
        updatedAt: timestampAgo(2 * dayMs),
        workspaceId: 'independent-study',
      }),
    ],
  }),
  createSearchGroup({
    kind: 'note',
    results: [
      createSearchResult({
        id: 'source-corroboration',
        kind: 'note',
        noteKind: 'basic',
        deckId: 'world-history',
        locationPath: ['Independent Study', 'Reading Notes', 'World History'],
        title: 'Source Corroboration',
        updatedAt: timestampAgo(28 * hourMs),
        workspaceId: 'independent-study',
      }),
      createSearchResult({
        id: 'collective-memory-cloze',
        kind: 'note',
        noteKind: 'cloze',
        deckId: 'world-history',
        locationPath: ['Independent Study', 'Reading Notes', 'World History'],
        title: 'Collective Memory Cloze',
        updatedAt: timestampAgo(6 * dayMs),
        workspaceId: 'independent-study',
      }),
    ],
  }),
]

const meta = {
  args: {
    emptyDescription: 'Try another keyword or create new study material first.',
    emptyTitle: 'No results found',
    groups: mixedGroups,
    query: 'source',
  },
  component: SearchResults,
  decorators: [withStorybookRouter(), componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Content Search/Components/SearchResults',
} satisfies Meta<typeof SearchResults>

export default meta

type Story = StoryObj<typeof meta>

export const MixedResults: Story = {}

export const Empty: Story = {
  args: {
    groups: [],
    query: 'constitutional legitimacy',
  },
}

export const Loading: Story = {
  args: {
    groups: undefined,
    loading: true,
    query: 'collective memory',
  },
}

export const LongText: Story = {
  args: {
    groups: [
      createSearchGroup({
        kind: 'note',
        results: [
          createSearchResult({
            id: 'long-result',
            kind: 'note',
            noteKind: 'basic',
            deckId: 'world-history',
            locationPath: [
              'IndependentStudy',
              'ReadingNotes',
              'ClinicalNeuroanatomyDifferentialDiagnosisAndCaseReviewArchive',
              'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
            ],
            title:
              'NeuroimmunoendocrinologicalPathophysiologyDifferentialDiagnosisProtocol',
            updatedAt: timestampAgo(14 * dayMs),
            workspaceId: 'independent-study',
          }),
        ],
      }),
    ],
    query: 'neuroimmunoendocrinological',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
