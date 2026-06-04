import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'

import { MarkdownContent } from './MarkdownContent'

const richMarkdown = [
  '## Memory Systems',
  'Review **hippocampal consolidation**, *cortical indexing*, and `retrieval` cues.',
  '',
  '> Spaced retrieval improves long-term recall when prompts stay specific.',
  '',
  '- Encoding context',
  '- [x] Consolidated trace',
  '- [ ] Follow-up recall',
  '',
  '| System | Role |',
  '| --- | --- |',
  '| Hippocampus | Binding |',
  '| Cortex | Storage |',
  '',
  '[Open reference](https://example.com)',
].join('\n')

const clozeMarkdown =
  'The {{c1::**hippocampus**}} binds context while the {{c2::*cortex*}} stores distributed traces.'

const adjacentClozeMarkdown =
  'A coalition becomes durable when the {{c1::policy bargain}} is credible and {{c2::incentives}} are transparent.'

const expectAdjacentClozeVerticalGap = async (root: HTMLElement) => {
  const clozes = Array.from(
    root.querySelectorAll('[data-cloze-state="revealed"]'),
  ).filter((element): element is HTMLElement => element instanceof HTMLElement)

  await expect(clozes).toHaveLength(2)

  const [firstCloze, secondCloze] = clozes
  const firstRect = firstCloze.getBoundingClientRect()
  const secondRect = secondCloze.getBoundingClientRect()

  await expect(secondRect.top).toBeGreaterThan(firstRect.top)
  await expect(secondRect.top - firstRect.bottom).toBeGreaterThanOrEqual(6)
}

const meta = {
  args: {
    markdown: richMarkdown,
  },
  component: MarkdownContent,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/MarkdownContent',
} satisfies Meta<typeof MarkdownContent>

export default meta

type Story = StoryObj<typeof meta>

export const RichMarkdown: Story = {}

export const ReviewClozeHidden: Story = {
  args: {
    activeClozeId: 'c1',
    clozeMode: 'review',
    markdown: clozeMarkdown,
  },
}

export const ReviewClozeRevealed: Story = {
  args: {
    activeClozeId: 'c1',
    clozeMode: 'review',
    markdown: clozeMarkdown,
    revealed: true,
  },
}

export const AllClozesVisible: Story = {
  args: {
    clozeMode: 'all',
    markdown: clozeMarkdown,
  },
}

export const AdjacentWrappedClozes: Story = {
  args: {
    className: 'max-w-[22rem] text-[2rem]',
    clozeMode: 'all',
    markdown: adjacentClozeMarkdown,
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
    await expectAdjacentClozeVerticalGap(canvasElement)
  },
}

export const LongUnbrokenText: Story = {
  args: {
    clozeMode: 'all',
    markdown:
      'NeuroimmunoendocrinologicalPathophysiologyFeedbackLoopExplanationShouldWrap with {{c1::HippocampocorticalNeuroimmunoendocrinologicalConsolidationProtocol}}.',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}
