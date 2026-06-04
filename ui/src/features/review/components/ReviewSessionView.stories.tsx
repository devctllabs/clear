import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import {
  expectButtonPendingSpinner,
  expectNoHorizontalOverflow,
} from '@/test/storybook/assertions'
import {
  createBasicReviewCard,
  createClozeReviewCard,
  noop,
} from '@/test/storybook/fixtures'

import { ReviewSessionView } from './ReviewSessionView'

const basicCard = createBasicReviewCard({
  back: 'Corroboration compares independent sources to test whether an account is reliable.',
  front: 'Which practice checks a source against independent evidence?',
})

const clozeCard = createClozeReviewCard({
  body: 'Collective memory preserves {{c1::public narratives}} through monuments, archives, and ceremonies.',
  clozeId: 'c1',
})

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

const ReviewSessionStory = ({
  revealed: initialRevealed,
  ...args
}: ComponentProps<typeof ReviewSessionView>) => {
  const [revealed, setRevealed] = useState(initialRevealed)

  return (
    <ReviewSessionView
      {...args}
      revealed={revealed}
      onReveal={() => setRevealed(true)}
    />
  )
}

const meta = {
  args: {
    deckTitle: 'World History',
    disabled: false,
    card: basicCard,
    onClose: noop,
    onGrade: noop,
    onReveal: noop,
    pendingGrade: null,
    plannedCount: 42,
    revealed: false,
    reviewedCount: 14,
  },
  component: ReviewSessionView,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <ReviewSessionStory {...args} />,
  title: 'Features/Review/Components/ReviewSessionView',
} satisfies Meta<typeof ReviewSessionView>

export default meta

type Story = StoryObj<typeof meta>

export const BasicHidden: Story = {
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
    await expectCardActionsGap(canvasElement)
  },
}

export const BasicRevealed: Story = {
  args: {
    revealed: true,
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
    await expectCardActionsGap(canvasElement)
  },
}

export const ClozeHidden: Story = {
  args: {
    card: clozeCard,
  },
}

export const ClozeRevealed: Story = {
  args: {
    card: clozeCard,
    revealed: true,
  },
}

export const GradePending: Story = {
  args: {
    disabled: true,
    pendingGrade: 'good',
    revealed: true,
  },
  play: async ({ canvasElement }) => {
    await expectButtonPendingSpinner(canvasElement, 'Good')
  },
}

export const LongUnbrokenText: Story = {
  args: {
    deckTitle: 'ComparativeConstitutionalHistoryReferenceCompendium',
    card: createBasicReviewCard({
      back:
        'ComparativeConstitutionalHistoryInstitutionalContinuityExplanationShouldWrap',
      front:
        'ComparativeConstitutionalHistoryInstitutionalLegitimacyPrompt',
    }),
    revealed: true,
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
