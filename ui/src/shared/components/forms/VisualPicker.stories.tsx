import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { createVisualOption, type VisualOption } from '@shared/components/icons/IconGlyph'
import { expectNoHorizontalOverflow } from '@/test/storybook/assertions'
import { formCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'

import { VisualPicker } from './VisualPicker'

const primaryPresetOptions = [
  createVisualOption('sparkles', 'Sparkles'),
  createVisualOption('book-open', 'Book'),
  createVisualOption('layers-3', 'Layers'),
  createVisualOption('flask-conical', 'Lab'),
]

const compactPresetOptions = [
  createVisualOption('archive', 'Archive'),
  createVisualOption('globe', 'Global'),
  createVisualOption('settings', 'Settings'),
]

const noResultsCatalogOptions = [
  ...primaryPresetOptions,
  createVisualOption('archive', 'Archive'),
  createVisualOption('globe', 'Global'),
  createVisualOption('settings', 'Settings'),
]

const pendingVisualOptions = new Promise<readonly VisualOption[]>((resolve) => {
  void resolve
})

const neverResolvingLoadOptions = () => pendingVisualOptions

const rejectingLoadOptions = () =>
  Promise.reject(new Error('Icon catalog unavailable'))

const openVisualPickerPopover = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  const body = within(canvasElement.ownerDocument.body)

  await userEvent.click(canvas.getByRole('button', { name: 'More icons' }))

  return body.findByRole('dialog', { name: 'Visual icon picker' })
}

const openVisualPickerDialog = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  const body = within(canvasElement.ownerDocument.body)

  await userEvent.click(canvas.getByRole('button', { name: 'More icons' }))

  return body.findByRole('dialog', { name: 'Choose Icon' })
}

const getVisualPickerScrollArea = (surface: HTMLElement) => {
  const scrollArea = surface.querySelector('[data-testid="visual-picker-scroll-area"]')

  if (!(scrollArea instanceof HTMLElement)) {
    throw new Error('Expected VisualPicker scroll area to be rendered')
  }

  return scrollArea
}

const waitForActiveAnimations = async (element: HTMLElement) => {
  await Promise.all(
    element
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState !== 'finished')
      .map((animation) => animation.finished.catch(() => undefined)),
  )
}

const expectStableElementHeight = async (element: HTMLElement, expectedHeight: number) => {
  await waitFor(() => {
    const heightDelta = Math.abs(element.getBoundingClientRect().height - expectedHeight)

    expect(heightDelta).toBeLessThanOrEqual(1)
  })
}

const expectInitialCatalogBatch = async (surface: HTMLElement) => {
  await waitFor(() => {
    expect(surface.querySelectorAll('[aria-pressed]')).toHaveLength(60)
  })
}

const VisualPickerStory = ({
  onValueChange,
  value,
  ...args
}: ComponentProps<typeof VisualPicker>) => {
  const [selectedValue, setSelectedValue] = useState(value)

  return (
    <VisualPicker
      {...args}
      value={selectedValue}
      onValueChange={(nextValue) => {
        setSelectedValue(nextValue)
        onValueChange(nextValue)
      }}
    />
  )
}

const meta = {
  args: {
    description: 'Choose a recognizable visual marker.',
    label: 'Visual',
    onValueChange: noop,
    presetOptions: primaryPresetOptions,
    value: 'sparkles',
  },
  component: VisualPicker,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <VisualPickerStory {...args} />,
  title: 'Shared/Forms/VisualPicker',
} satisfies Meta<typeof VisualPicker>

export default meta

type Story = StoryObj<typeof meta>

export const DefaultPresets: Story = {}

export const AlternatePresets: Story = {
  args: {
    description: 'Use the same generic picker with another caller-owned preset set.',
    label: 'Compact visual set',
    presetOptions: compactPresetOptions,
    value: 'archive',
  },
}

export const LongDescription: Story = {
  args: {
    description:
      'Pick an icon that remains recognizable inside compact cards, action menus, search rows, and dense mobile layouts.',
    label: 'Compact mobile visual identity',
  },
}

export const CatalogLoading: Story = {
  args: {
    loadOptions: neverResolvingLoadOptions,
  },
  play: async ({ canvasElement }) => {
    const popover = await openVisualPickerPopover(canvasElement)

    await expect(
      await within(popover).findByRole('status', { name: 'Loading icons' }),
    ).toBeInTheDocument()
    await expect(popover.querySelectorAll('[data-testid="visual-picker-loading-cell"]')).toHaveLength(
      12,
    )
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(popover)
  },
}

export const CatalogError: Story = {
  args: {
    loadOptions: rejectingLoadOptions,
  },
  play: async ({ canvasElement }) => {
    const popover = await openVisualPickerPopover(canvasElement)

    await expect(
      await within(popover).findByText('Icons could not be loaded.'),
    ).toBeInTheDocument()
    await expect(
      within(popover).getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(popover)
  },
}

export const CatalogNoResults: Story = {
  args: {
    allOptions: noResultsCatalogOptions,
  },
  play: async ({ canvasElement }) => {
    const popover = await openVisualPickerPopover(canvasElement)

    await waitForActiveAnimations(popover)

    const initialPopoverHeight = popover.getBoundingClientRect().height

    await userEvent.type(
      within(popover).getByLabelText('Visual icon search'),
      'zzzz-no-match',
    )
    await expect(
      await within(popover).findByText('No icons match "zzzz-no-match".'),
    ).toBeInTheDocument()
    await expectStableElementHeight(popover, initialPopoverHeight)
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(popover)
  },
}

export const LargeCatalogIncremental: Story = {
  play: async ({ canvasElement }) => {
    const popover = await openVisualPickerPopover(canvasElement)

    await expectInitialCatalogBatch(popover)
    await expect(
      within(popover).queryByRole('button', { name: 'Arrow Big Right Dash' }),
    ).not.toBeInTheDocument()
    await expect(
      popover.querySelectorAll('[data-testid="visual-picker-loading-cell"]'),
    ).toHaveLength(12)
    await expect(
      popover.querySelector('[data-testid="visual-picker-load-sentinel"]'),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(popover)
  },
}

export const LargeCatalogAfterScroll: Story = {
  play: async ({ canvasElement }) => {
    const popover = await openVisualPickerPopover(canvasElement)
    const scrollArea = getVisualPickerScrollArea(popover)

    await expectInitialCatalogBatch(popover)
    scrollArea.scrollTop = scrollArea.scrollHeight

    await waitFor(() => {
      expect(within(popover).getAllByRole('button').length).toBeGreaterThan(60)
    })
    await expect(
      within(popover).getByRole('button', { name: 'Arrow Big Right Dash' }),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(popover)
  },
}

export const MobileDialogLargeCatalogIncremental: Story = {
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const dialog = await openVisualPickerDialog(canvasElement)

    await expectInitialCatalogBatch(dialog)
    await expect(
      within(dialog).queryByRole('button', { name: 'Arrow Big Right Dash' }),
    ).not.toBeInTheDocument()
    await expect(dialog.querySelectorAll('[data-testid="visual-picker-loading-cell"]')).toHaveLength(
      12,
    )
    await expect(
      dialog.querySelector('[data-testid="visual-picker-load-sentinel"]'),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(dialog)
  },
}

export const MobileDialogCatalogLoading: Story = {
  args: {
    loadOptions: neverResolvingLoadOptions,
  },
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const dialog = await openVisualPickerDialog(canvasElement)

    await expect(
      await within(dialog).findByRole('status', { name: 'Loading icons' }),
    ).toBeInTheDocument()
    await expect(dialog.querySelectorAll('[data-testid="visual-picker-loading-cell"]')).toHaveLength(
      12,
    )
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(dialog)
  },
}

export const MobileDialogCatalogError: Story = {
  args: {
    loadOptions: rejectingLoadOptions,
  },
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const dialog = await openVisualPickerDialog(canvasElement)

    await expect(
      await within(dialog).findByText('Icons could not be loaded.'),
    ).toBeInTheDocument()
    await expect(
      within(dialog).getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(dialog)
  },
}

export const MobileDialogCatalogNoResults: Story = {
  args: {
    allOptions: noResultsCatalogOptions,
  },
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const dialog = await openVisualPickerDialog(canvasElement)

    await waitForActiveAnimations(dialog)

    const initialDialogHeight = dialog.getBoundingClientRect().height

    await userEvent.type(
      within(dialog).getByLabelText('Visual icon search'),
      'zzzz-no-match',
    )
    await expect(
      await within(dialog).findByText('No icons match "zzzz-no-match".'),
    ).toBeInTheDocument()
    await expectStableElementHeight(dialog, initialDialogHeight)
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(dialog)
  },
}

export const MobileDialogLargeCatalogAfterScroll: Story = {
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const dialog = await openVisualPickerDialog(canvasElement)
    const scrollArea = getVisualPickerScrollArea(dialog)

    await expectInitialCatalogBatch(dialog)
    scrollArea.scrollTop = scrollArea.scrollHeight

    await waitFor(() => {
      expect(dialog.querySelectorAll('[aria-pressed]').length).toBeGreaterThan(60)
    })
    await expect(
      within(dialog).getByRole('button', { name: 'Arrow Big Right Dash' }),
    ).toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
    await expectNoHorizontalOverflow(dialog)
  },
}
