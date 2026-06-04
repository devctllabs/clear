import type { Meta, StoryObj } from '@storybook/react-vite'
import { fireEvent, userEvent, within } from 'storybook/test'

import { noop } from '@/test/storybook/fixtures'

import { settingsFsrsDefaultParams } from '../utils/fsrs-params'
import { SettingsFsrsParamsDialog } from './SettingsFsrsParamsDialog'

const customParams = Array.from({ length: settingsFsrsDefaultParams.length }, (_, index) =>
  Number((index + 0.5).toFixed(1)),
)

const meta = {
  args: {
    open: true,
    onOpenChange: noop,
    onSave: noop,
    value: [...settingsFsrsDefaultParams],
  },
  component: SettingsFsrsParamsDialog,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Features/Settings/Components/SettingsFsrsParamsDialog',
} satisfies Meta<typeof SettingsFsrsParamsDialog>

export default meta

type Story = StoryObj<typeof meta>

export const DefaultParams: Story = {}

export const CustomParams: Story = {
  args: {
    value: customParams,
  },
}

export const ErrorState: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const dialog = page.getByRole('dialog', { name: 'Edit FSRS parameters' })
    const dialogScope = within(dialog)
    const textarea = dialogScope.getByLabelText('FSRS Parameters JSON')

    await fireEvent.change(textarea, { target: { value: 'not json' } })
    await userEvent.click(dialogScope.getByRole('button', { name: 'Save' }))
    await dialogScope.findByText('Paste valid JSON with 21 numeric values.')
  },
}
