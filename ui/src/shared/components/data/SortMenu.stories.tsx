import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { SortMenu } from './SortMenu'

const deckFieldOptions = [
  { field: 'title', label: 'Title' },
  { field: 'updatedAt', label: 'Updated' },
] as const

const deckFieldOptionsWithDueToday = [
  ...deckFieldOptions,
  { field: 'dueToday', label: 'Due Today' },
] as const

const openMenuParameters = {
  a11y: {
    config: {
      rules: [{ id: 'aria-hidden-focus', enabled: false }],
    },
  },
}

const openSortMenu = async (canvasElement: HTMLElement, label: string) => {
  const canvas = within(canvasElement)

  await userEvent.click(canvas.getByRole('button', { name: label }))
}

const meta = {
  args: {
    ariaLabel: 'Sort decks',
    fieldOptions: deckFieldOptions,
    onDirectionChange: noop,
    onFieldChange: noop,
    sort: {
      direction: 'asc',
      field: 'title',
    },
  },
  component: SortMenu,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/SortMenu',
} satisfies Meta<typeof SortMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  parameters: openMenuParameters,
  play: async ({ canvasElement }) => {
    await openSortMenu(canvasElement, 'Sort decks')
  },
}

export const DueTodaySelected: Story = {
  args: {
    fieldOptions: deckFieldOptionsWithDueToday,
    sort: {
      direction: 'desc',
      field: 'dueToday',
    },
  },
  parameters: openMenuParameters,
  play: async ({ canvasElement }) => {
    await openSortMenu(canvasElement, 'Sort decks')
  },
}
