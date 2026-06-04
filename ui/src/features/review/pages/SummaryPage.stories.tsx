import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import {
  expectElementFullyInViewport,
  expectMobileNoHorizontalOverflow,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createReviewService,
  createStorybookServices,
  unavailableError,
  createWorkspaceService,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'
import type { DomainError } from '@shared/errors'
import type { DueReviewSession } from '../types/review.types'

import { ReviewSummaryPage } from './SummaryPage'

const workspaceId = 'independent-study'
const deckId = 'world-history'
const reviewId = 'world-history-review'

const summary: DueReviewSession = {
  completedAt: '2026-05-16T12:18:00.000Z',
  deckId,
  durationSeconds: 1080,
  id: reviewId,
  mode: 'due',
  plannedCount: 48,
  reviewedCount: 32,
  startedAt: '2026-05-16T12:00:00.000Z',
  status: 'completed',
}

const loadingActionStackHeightPx = 108
const loadingCardHeightPx = 194
const loadingStackHeightPx = 322

const setReviewSummaryTestViewport = async () => {
  if (import.meta.env.MODE !== 'test') {
    return false
  }

  const { page } = await import('vitest/browser')

  await page.viewport(1280, 720)

  return true
}

const expectSummaryCardTopOffset = async (root: HTMLElement) => {
  const canvas = within(root)
  const heading = await canvas.findByRole('heading', { name: 'Review complete' })
  const card = heading.closest('section')

  if (!(card instanceof HTMLElement)) {
    throw new Error('Expected Review complete heading to be inside the summary card')
  }

  await expect(Math.round(card.getBoundingClientRect().top)).toBe(96)
}

const getLoadingSummaryElement = (root: HTMLElement, slot: string) => {
  const element = root.querySelector(`[data-slot="${slot}"]`)

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected ${slot} to render`)
  }

  return element
}

const expectLoadingSummaryCardTopOffset = async (root: HTMLElement) => {
  const card = getLoadingSummaryElement(root, 'review-summary-loading-card')

  await expect(Math.round(card.getBoundingClientRect().top)).toBe(96)
}

const expectLoadingSummaryActionReserve = async (root: HTMLElement) => {
  const stack = getLoadingSummaryElement(root, 'review-summary-loading-stack')
  const card = getLoadingSummaryElement(root, 'review-summary-loading-card')
  const actionStack = getLoadingSummaryElement(root, 'review-summary-loading-actions')
  const actions = root.querySelectorAll('[data-slot="review-summary-loading-action"]')

  await expect(actions).toHaveLength(2)
  await expect(Math.round(card.getBoundingClientRect().height)).toBe(loadingCardHeightPx)
  await expect(Math.round(actionStack.getBoundingClientRect().height)).toBe(
    loadingActionStackHeightPx,
  )
  await expect(Math.round(stack.getBoundingClientRect().height)).toBe(loadingStackHeightPx)
}

const withReviewSummaryPage = ({
  error,
  loading = false,
  summaryRecord = summary,
}: {
  error?: DomainError
  loading?: boolean
  summaryRecord?: DueReviewSession
} = {}) =>
  withStorybookApp({
    initialEntry: `/dashboard/${workspaceId}/decks/${deckId}/review/${reviewId}/summary`,
    services: () =>
      createStorybookServices({
        review: createReviewService({
          error,
          firstReviewable: null,
          loading,
          summary: summaryRecord,
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
  component: ReviewSummaryPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Review/Pages/SummaryPage',
} satisfies Meta<typeof ReviewSummaryPage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [withReviewSummaryPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const shouldAssertSummaryOffset = await setReviewSummaryTestViewport()
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading summary' })
    if (shouldAssertSummaryOffset) {
      await expectLoadingSummaryCardTopOffset(canvasElement)
    }

    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Complete: Story = {
  decorators: [withReviewSummaryPage()],
  play: async ({ canvasElement }) => {
    const shouldAssertSummaryOffset = await setReviewSummaryTestViewport()
    const canvas = within(canvasElement)

    const continueReview = await canvas.findByRole('link', { name: 'Continue review' })
    const backToDeck = await canvas.findByRole('link', { name: 'Back to deck' })

    if (shouldAssertSummaryOffset) {
      await expectSummaryCardTopOffset(canvasElement)
      await expectElementFullyInViewport(continueReview)
      await expectElementFullyInViewport(backToDeck)
    }

    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileCompleteRegression: Story = {
  decorators: [withReviewSummaryPage()],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Review complete' })
    await canvas.findByRole('link', { name: 'Continue review' })
    await canvas.findByRole('link', { name: 'Back to deck' })
    await expectMobileNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingRegression: Story = {
  decorators: [withReviewSummaryPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Loading summary' })
    await expectMobileNoHorizontalOverflow(canvasElement)
    await expectLoadingSummaryActionReserve(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withReviewSummaryPage({
      error: unavailableError('Review summary is temporarily unavailable.'),
    }),
  ],
}
