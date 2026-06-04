import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { dayMs, hourMs, noop, timestampAgo } from '@/test/storybook/fixtures'

import type { Workspace } from '../types/workspace.types'
import { WorkspaceSpaceCard } from './WorkspaceSpaceCard'

const baseWorkspace: Workspace = {
  description: 'A focused workspace for medical review, case notes, and study sessions.',
  icon: 'layers-3',
  id: 'independent-study',
  title: 'Editorial Production',
  updatedAt: timestampAgo(4 * hourMs),
}

const longWorkspaceDescription = [
  'This workspace captures cross-functional research notes, draft outlines, review queues, meeting observations, and follow-up decisions across multiple active projects.',
  'It also includes source references, archive migration notes, onboarding reminders, weekly planning context, implementation caveats, and retrospective summaries.',
  'The description is intentionally long enough to verify that workspace cards keep their scanning rhythm instead of expanding into a full page section.',
].join(' ')

const meta = {
  args: {
    active: true,
    onDelete: noop,
    onEdit: noop,
    onOpen: noop,
    workspace: baseWorkspace,
  },
  component: WorkspaceSpaceCard,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Workspaces/Components/WorkspaceSpaceCard',
} satisfies Meta<typeof WorkspaceSpaceCard>

export default meta

type Story = StoryObj<typeof meta>

export const Active: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const openButton = await canvas.findByRole('button', {
      name: 'Open Editorial Production',
    })
    const surface = openButton.closest('.relative')
    const activeBadge = await canvas.findByText('Active')

    if (!(surface instanceof HTMLElement)) {
      throw new Error('Expected workspace card surface to be rendered.')
    }

    await expect(surface).toHaveClass(
      'border',
      'border-foreground/20',
      'bg-card',
      'shadow-none',
    )
    await expect(surface).not.toHaveClass('bg-muted/35')
    await expect(surface).not.toHaveClass('border-2', 'border-primary')
    await expect(surface).not.toHaveClass('ring-1', 'ring-inset', 'ring-border/70')
    await expect(activeBadge.parentElement).toHaveClass('items-center')
    await expect(activeBadge.parentElement).not.toHaveClass('items-start')
    await expect(activeBadge).toHaveClass('border-border', 'bg-card', 'text-muted-foreground')
    await expect(activeBadge).not.toHaveClass('bg-primary', 'text-primary-foreground')
  },
}

export const Inactive: Story = {
  args: {
    active: false,
    workspace: {
      ...baseWorkspace,
      description: 'Long-term references, research notes, and archived project material.',
      icon: 'archive',
      id: 'reading-archive',
      title: 'Research Archive',
      updatedAt: timestampAgo(3 * dayMs),
    },
  },
}

export const Compact: Story = {
  args: {
    density: 'compact',
    workspace: {
      ...baseWorkspace,
      description: longWorkspaceDescription,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = await canvas.findByText('Editorial Production')
    const description = await canvas.findByText(longWorkspaceDescription)

    await expect(title).toHaveClass('line-clamp-2')
    await expect(description).toHaveClass('line-clamp-2')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const AlignedFooters: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 items-stretch gap-4">
      <WorkspaceSpaceCard
        {...args}
        active={false}
        workspace={{
          ...baseWorkspace,
          description: 'Fast-access study notes.',
          id: 'quick-notes',
          title: 'Quick Notes',
          updatedAt: timestampAgo(19 * hourMs),
        }}
      />
      <WorkspaceSpaceCard
        {...args}
        active={false}
        workspace={{
          ...baseWorkspace,
          description: longWorkspaceDescription,
          icon: 'archive',
          id: 'reference-archive',
          title: 'Reference Archive Operations',
          updatedAt: timestampAgo(23.75 * hourMs),
        }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstUpdated = await canvas.findByText('Updated 19h ago')
    const secondUpdated = await canvas.findByText('Updated 24h ago')
    const footerDelta = Math.abs(
      firstUpdated.getBoundingClientRect().bottom -
        secondUpdated.getBoundingClientRect().bottom,
    )

    await expect(footerDelta).toBeLessThanOrEqual(1)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const Opening: Story = {
  args: {
    active: false,
    opening: true,
    workspace: {
      ...baseWorkspace,
      description: 'Long-term references, research notes, and archived project material.',
      icon: 'archive',
      id: 'reading-archive',
      title: 'Research Archive',
      updatedAt: timestampAgo(3 * dayMs),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('status', { name: 'Opening Research Archive' })
  },
}

export const OpeningContentAlignment: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 items-stretch gap-4">
      <WorkspaceSpaceCard
        {...args}
        active={false}
        workspace={{
          ...baseWorkspace,
          description: 'Long-term references, research notes, and archived project material.',
          icon: 'archive',
          id: 'reading-archive',
          title: 'Research Archive',
          updatedAt: timestampAgo(3 * dayMs),
        }}
      />
      <WorkspaceSpaceCard
        {...args}
        active={false}
        opening
        workspace={{
          ...baseWorkspace,
          description: 'Long-term references, research notes, and archived project material.',
          icon: 'archive',
          id: 'reading-archive-opening',
          title: 'Research Archive',
          updatedAt: timestampAgo(3 * dayMs),
        }}
      />
    </div>
  ),
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const contentRows = canvasElement.querySelectorAll('[data-slot="workspace-card-content"]')

    await expect(contentRows).toHaveLength(2)

    const firstTop = contentRows[0]?.getBoundingClientRect().top ?? 0
    const secondTop = contentRows[1]?.getBoundingClientRect().top ?? 0

    await expect(Math.abs(firstTop - secondTop)).toBeLessThanOrEqual(1)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LongName: Story = {
  args: {
    active: false,
    workspace: {
      ...baseWorkspace,
      description: 'Layout stress case for a workspace with a long unbroken name.',
      id: 'long-workspace',
      title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
      updatedAt: timestampAgo(9 * dayMs),
    },
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LongDescription: Story = {
  args: {
    active: false,
    workspace: {
      ...baseWorkspace,
      description: longWorkspaceDescription,
      id: 'long-description-workspace',
      title: 'Reference Operations',
      updatedAt: timestampAgo(6 * dayMs),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const description = await canvas.findByText(longWorkspaceDescription)

    await expect(description).toHaveClass('line-clamp-3', 'sm:line-clamp-5')
    await expectNoHorizontalOverflow(canvasElement)
  },
}
