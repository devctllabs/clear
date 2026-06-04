import type { Meta, StoryObj } from '@storybook/react-vite'

import { noop } from '@/test/storybook/fixtures'

import { SettingsTimezonePickerDialog } from './SettingsTimezonePickerDialog'

const meta = {
  args: {
    open: true,
    onOpenChange: noop,
    onSelect: noop,
    value: 'auto',
  },
  component: SettingsTimezonePickerDialog,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Settings/Components/SettingsTimezonePickerDialog',
} satisfies Meta<typeof SettingsTimezonePickerDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Automatic: Story = {}

export const TokyoSelected: Story = {
  args: {
    value: 'Asia/Tokyo',
  },
}
