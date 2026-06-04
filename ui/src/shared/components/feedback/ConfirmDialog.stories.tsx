import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor, within } from 'storybook/test'

import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'
import { domainError } from '@shared/errors'

import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  args: {
    confirmLabel: 'Delete',
    description:
      'This deck will move to trash. You can restore it later from the trash screen.',
    onConfirm: noop,
    onOpenChange: noop,
    open: true,
    title: 'Delete deck?',
  },
  component: ConfirmDialog,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Feedback/ConfirmDialog',
} satisfies Meta<typeof ConfirmDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Destructive: Story = {}

export const LongCopy: Story = {
  args: {
    confirmLabel: 'Delete Permanently',
    description:
      'This action removes the selected neuroimmunoendocrinological reference compendium and all associated review scheduling metadata from the active workspace.',
    title: 'Delete reference compendium?',
  },
}

export const Confirming: Story = {
  args: {
    confirming: true,
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)

    await waitFor(() => {
      if (!page.queryByRole('button', { name: 'Delete' })?.querySelector('[data-slot="pending-spinner"]')) {
        throw new globalThis.Error('Pending spinner was not rendered.')
      }
    })
  },
}

export const ActionError: Story = {
  args: {
    actionError: {
      error: domainError.unexpected('The item could not be moved to Trash.'),
      title: 'Could not delete item',
    },
    confirmLabel: 'Delete workspace',
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement.ownerDocument.body)
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
