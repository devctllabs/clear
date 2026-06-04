import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createBasicReviewCard,
  createClozeReviewCard,
  createDeckDetail,
} from '@/test/storybook/fixtures'
import {
  createDeckService,
  createReviewService,
  createStorybookServices,
  unavailableError,
  createWorkspaceService,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { ReviewCard } from '../types/review.types'
import type { DomainError } from '@shared/errors'

import { ReviewSessionPage } from './SessionPage'

const workspaceId = 'independent-study'
const deckId = 'world-history'
const reviewId = 'world-history-review'

const deck = createDeckDetail({
  id: deckId,
  title: 'World History',
  workspaceId,
})

const basicCard = createBasicReviewCard({
  back: 'Corroboration compares independent sources to test whether an account is reliable.',
  front: 'Which practice checks a source against independent evidence?',
  id: 'source-corroboration-basic:basic',
})

const clozeCard = createClozeReviewCard({
  body: 'Collective memory preserves {{c1::public narratives}} through monuments, archives, and ceremonies.',
  clozeId: 'c1',
  id: 'collective-memory-cloze:c1',
})

const longNameCard = createBasicReviewCard({
  back:
    'ComparativeConstitutionalHistoryInstitutionalContinuityExplanationShouldWrap',
  front:
    'ComparativeConstitutionalHistoryInstitutionalLegitimacyPrompt',
  id: 'long-review-note:basic',
})

const withReviewSessionPage = ({
  deckError,
  firstReviewable = basicCard,
  gradeLoading = false,
  loading = false,
  mutationError,
  nextReviewable,
  reviewError,
}: {
  deckError?: DomainError
  firstReviewable?: ReviewCard | null
  gradeLoading?: boolean
  loading?: boolean
  mutationError?: DomainError
  nextReviewable?: ReviewCard
  reviewError?: DomainError
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckId}/review/${reviewId}`,
    services: () =>
      createStorybookServices({
        decks: createDeckService({
          deckDetails: {
            [deckId]: deck,
          },
          decks: [deck],
          error: deckError,
        }),
        review: createReviewService({
          error: reviewError,
          firstReviewable,
          gradeLoading,
          loading,
          mutationError,
          nextReviewable,
        }),
        workspaces: createWorkspaceService({ activeWorkspaceId: workspaceId }),
      }),
  })

const meta = {
  args: {
    deckId,
    reviewId,
    workspaceId,
  },
  component: ReviewSessionPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Review/Pages/SessionPage',
} satisfies Meta<typeof ReviewSessionPage>

export default meta

type Story = StoryObj<typeof meta>

const getActiveDeckTop = async (root: HTMLElement) => {
  const canvas = within(root)
  const activeDeck = await canvas.findByText('Deck')

  return Math.round(activeDeck.getBoundingClientRect().top)
}

const setReviewSessionDesktopViewport = async () => {
  if (import.meta.env.MODE !== 'test') {
    return false
  }

  const { page } = await import('vitest/browser')

  await page.viewport(1280, 1024)

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

  return true
}

const expectCardActionsGap = async (root: HTMLElement) => {
  await setReviewSessionDesktopViewport()

  const card = root.querySelector('article')
  const footer = root.querySelector('footer')

  if (!(card instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
    throw new Error('Expected review card and actions footer to render.')
  }

  const gap = Math.round(footer.getBoundingClientRect().top - card.getBoundingClientRect().bottom)

  await expect(gap).toBeGreaterThanOrEqual(36)
  await expect(gap).toBeLessThanOrEqual(64)
}

export const Loading: Story = {
  decorators: [withReviewSessionPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading review' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const BasicHidden: Story = {
  decorators: [withReviewSessionPage()],
  play: async ({ canvasElement }) => {
    await getActiveDeckTop(canvasElement)
    await expectCardActionsGap(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileBasicHiddenRegression: Story = {
  decorators: [withReviewSessionPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Deck')
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const BasicRevealed: Story = {
  decorators: [withReviewSessionPage()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const activeDeckTopBeforeReveal = await getActiveDeckTop(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await canvas.findByRole('button', { name: 'Good' })
    await expectCardActionsGap(canvasElement)
    await waitFor(async () => {
      await expect(await getActiveDeckTop(canvasElement)).toBe(activeDeckTopBeforeReveal)
    })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const ClozeHidden: Story = {
  decorators: [withReviewSessionPage({ firstReviewable: clozeCard })],
}

export const ClozeRevealed: Story = {
  decorators: [withReviewSessionPage({ firstReviewable: clozeCard })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await canvas.findByRole('button', { name: 'Good' })
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const GradePending: Story = {
  decorators: [withReviewSessionPage({ gradeLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Good' }))
    await waitFor(() => {
      if (!canvas.queryByRole('button', { name: 'Good' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new Error('Pending spinner was not rendered.')
      }
    })
  },
}

export const Unavailable: Story = {
  decorators: [withReviewSessionPage({ firstReviewable: null })],
}

export const LoadError: Story = {
  decorators: [
    withReviewSessionPage({
      deckError: unavailableError('Review deck is temporarily unavailable.'),
    }),
  ],
}

export const GradeError: Story = {
  decorators: [
    withReviewSessionPage({
      mutationError: unavailableError('Card grading is temporarily unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Show answer' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Good' }))
    await canvas.findByText('Could not grade card')
  },
}

export const LongContent: Story = {
  decorators: [withReviewSessionPage({ firstReviewable: longNameCard })],
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLongContentRegression: Story = {
  decorators: [withReviewSessionPage({ firstReviewable: longNameCard })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}
