import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor, within } from 'storybook/test'

import { noop } from '@/test/storybook/fixtures'
import { withStorybookRouter } from '@/test/storybook/router'
import { domainError } from '@shared/errors'

import { EditorShell } from './EditorShell'

const meta = {
  args: {
    actionLabel: 'Save',
    backTo: '/dashboard/independent-study',
    children: (
      <div className="rounded-card border border-border bg-card p-8 shadow-card">
        <p className="type-study-title text-foreground">
          Editor content
        </p>
        <p className="mt-4 text-base font-medium leading-7 text-muted-foreground">
          Feature-owned forms compose inside this shared shell.
        </p>
      </div>
    ),
    onSubmit: noop,
    title: 'Edit Resource',
  },
  component: EditorShell,
  decorators: [withStorybookRouter()],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Layout/EditorShell',
} satisfies Meta<typeof EditorShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongTitleAndAction: Story = {
  args: {
    actionLabel: 'Save Reference Compendium',
    title: 'Edit Neuroimmunoendocrinological Reference Compendium',
  },
}

export const ActionError: Story = {
  args: {
    actionError: {
      error: domainError.unavailable('Resource could not be saved.'),
      title: 'Could not save resource',
    },
  },
}

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(() => {
      if (!canvas.queryByRole('button', { name: 'Save' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new globalThis.Error('Pending spinner was not rendered.')
      }
    })
  },
}
